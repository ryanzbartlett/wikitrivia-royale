import type { ServerMessage, ClientMessage } from '../shared/types.ts';
import { profileRoutes } from './routes/profiles.ts';
import { roomRoutes } from './routes/rooms.ts';
import { leaderboardRoutes } from './routes/leaderboard.ts';
import { getRoom, joinRoom, leaveRoom } from './rooms.ts';
import {
    initGame, getGameState, deleteGameState,
    processPlacement, eliminatePlayer, checkGameOver,
    computeRoundResults, advanceRound,
    getPublicStats, getCurrentCard,
} from './game.ts';
import { dbRun } from './db.ts';

type WSData = {
    roomCode: string;
    profile: { id: string; name: string };
};

function publish(server: ReturnType<typeof Bun.serve>, roomCode: string, msg: ServerMessage): void {
    server.publish(roomCode, JSON.stringify(msg));
}

function startRoundTimer(server: ReturnType<typeof Bun.serve>, roomCode: string, seconds: number): void {
    const gameState = getGameState(roomCode);
    if (!gameState) return;
    gameState.timerHandle = setTimeout(() => endRound(server, roomCode), seconds * 1000);
}

function endRound(server: ReturnType<typeof Bun.serve>, roomCode: string): void {
    const gameState = getGameState(roomCode);
    if (!gameState || gameState.phase !== 'placing') return;
    gameState.phase = 'results';

    const cardYear = getCurrentCard(gameState).year;
    const results = computeRoundResults(gameState);
    const playerStats = getPublicStats(gameState);

    publish(server, roomCode, { type: 'round_results', cardYear, results, playerStats });

    setTimeout(() => startNextRoundOrEnd(server, roomCode), 3000);
}

function startNextRoundOrEnd(server: ReturnType<typeof Bun.serve>, roomCode: string): void {
    const gameState = getGameState(roomCode);
    if (!gameState) return;

    const outcome = advanceRound(gameState);

    if (outcome === 'game_over') {
        const finalScores = getPublicStats(gameState);
        saveLeaderboardScores(roomCode, finalScores);
        const room = getRoom(roomCode);
        if (room) room.status = 'ended';
        publish(server, roomCode, { type: 'game_ended', finalScores });
        deleteGameState(roomCode);
    } else {
        const card = getCurrentCard(gameState);
        publish(server, roomCode, {
            type: 'card_revealed',
            card,
            cardIndex: gameState.currentCardIndex,
            totalCards: gameState.deck.length,
        });
        startRoundTimer(server, roomCode, gameState.timerSeconds);
    }
}

function saveLeaderboardScores(roomCode: string, finalScores: ReturnType<typeof getPublicStats>): void {
    const playedAt = new Date().toISOString();
    for (const p of finalScores) {
        dbRun(
            'INSERT INTO leaderboard (profile_id, profile_name, score, game_code, played_at) VALUES (?,?,?,?,?)',
            [p.playerId, p.playerName, p.score, roomCode, playedAt],
        );
    }
}

function handleStartGame(
    ws: { data: WSData },
    server: ReturnType<typeof Bun.serve>,
    msg: Extract<ClientMessage, { type: 'start_game' }>,
): void {
    const { roomCode, profile } = ws.data;
    const room = getRoom(roomCode);
    if (!room || room.status !== 'lobby' || room.hostId !== profile.id) return;

    const gameState = initGame(roomCode, room.players, msg.timerSeconds);
    room.status = 'playing';

    publish(server, roomCode, {
        type: 'game_started',
        startingCard: gameState.startingCard,
        timerSeconds: gameState.timerSeconds,
        playerStats: getPublicStats(gameState),
    });

    const firstCard = getCurrentCard(gameState);
    publish(server, roomCode, {
        type: 'card_revealed',
        card: firstCard,
        cardIndex: 0,
        totalCards: gameState.deck.length,
    });

    startRoundTimer(server, roomCode, msg.timerSeconds);
}

function handlePlaceCard(
    ws: { data: WSData },
    server: ReturnType<typeof Bun.serve>,
    msg: Extract<ClientMessage, { type: 'place_card' }>,
): void {
    const { roomCode, profile } = ws.data;
    const gameState = getGameState(roomCode);
    if (!gameState || gameState.phase !== 'placing') return;

    const { allAlivePlaced } = processPlacement(gameState, profile.id, msg.afterIndex);
    publish(server, roomCode, { type: 'player_placed', playerId: profile.id });

    if (allAlivePlaced) {
        if (gameState.timerHandle) clearTimeout(gameState.timerHandle);
        endRound(server, roomCode);
    }
}

const server = Bun.serve<WSData>({
    port: 3000,

    routes: {
        ...profileRoutes,
        ...roomRoutes,
        ...leaderboardRoutes,
    },

    fetch(req, server) {
        const url = new URL(req.url);
        if (url.pathname === '/ws') {
            const roomCode = url.searchParams.get('roomCode')?.toUpperCase();
            const profileId = url.searchParams.get('profileId');
            const profileName = url.searchParams.get('profileName');

            if (!roomCode || !profileId || !profileName) {
                return new Response('Missing roomCode, profileId or profileName', { status: 400 });
            }
            if (!getRoom(roomCode)) {
                return new Response('Room not found', { status: 404 });
            }

            const upgraded = server.upgrade(req, {
                data: { roomCode, profile: { id: profileId, name: profileName } },
            });
            return upgraded ? undefined : new Response('WebSocket upgrade failed', { status: 500 });
        }
        return new Response('Not Found', { status: 404 });
    },

    websocket: {
        open(ws) {
            const { roomCode, profile } = ws.data;
            ws.subscribe(roomCode);

            const room = joinRoom(roomCode, profile);
            if (!room) {
                ws.close(1008, 'Room not found or game already started');
                return;
            }

            ws.send(JSON.stringify({ type: 'room_state', room } satisfies ServerMessage));
            ws.publish(roomCode, JSON.stringify({ type: 'player_joined', player: profile } satisfies ServerMessage));
        },

        close(ws) {
            const { roomCode, profile } = ws.data;

            const oldHostId = getRoom(roomCode)?.hostId;
            const room = leaveRoom(roomCode, profile.id);
            if (room) {
                const msg: ServerMessage = {
                    type: 'player_left',
                    playerId: profile.id,
                    ...(room.hostId !== oldHostId ? { newHostId: room.hostId } : {}),
                };
                ws.publish(roomCode, JSON.stringify(msg));
            }

            // Handle mid-game disconnect
            const gameState = getGameState(roomCode);
            if (gameState) {
                eliminatePlayer(gameState, profile.id);
                if (checkGameOver(gameState)) {
                    if (gameState.timerHandle) clearTimeout(gameState.timerHandle);
                    endRound(server, roomCode);
                }
            }
        },

        message(ws, data) {
            const msg = JSON.parse(data as string) as ClientMessage;
            if (msg.type === 'start_game') handleStartGame(ws, server, msg);
            if (msg.type === 'place_card') handlePlaceCard(ws, server, msg);
        },
    },
});

console.log('Server listening on port 3000');
