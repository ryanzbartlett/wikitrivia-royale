import type { ServerMessage } from '../shared/types.ts';
import { profileRoutes } from './routes/profiles.ts';
import { roomRoutes } from './routes/rooms.ts';
import { getRoom, joinRoom, leaveRoom } from './rooms.ts';

type WSData = {
    roomCode: string;
    profile: { id: string; name: string };
};

Bun.serve<WSData>({
    port: 3000,

    routes: {
        ...profileRoutes,
        ...roomRoutes,
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

            // Send full state to the joining player
            ws.send(JSON.stringify({ type: 'room_state', room } satisfies ServerMessage));

            // Broadcast to everyone else (ws.publish excludes the sender)
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
        },

        message() {
            // Future: handle client → server game actions
        },
    },
});

console.log('Server listening on port 3000');
