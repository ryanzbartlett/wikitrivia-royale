import { readFileSync } from 'fs';
import { join } from 'path';
import type { Card, Profile, PublicPlayerStats, RoundResult } from '../shared/types.ts';

interface PlayerGameState {
    playerId: string;
    playerName: string;
    lives: number;
    score: number;
    heat: number;
    timeline: Card[];
    hasPlaced: boolean;
    eliminated: boolean;
    placement: number | undefined;
}

interface GameState {
    roomCode: string;
    deck: Card[];
    startingCard: Card;
    currentCardIndex: number;
    timerSeconds: number;
    phase: 'placing' | 'results';
    timerHandle: ReturnType<typeof setTimeout> | null;
    playerStates: Map<string, PlayerGameState>;
}

interface DeckFile {
    id: string;
    startingCard: Card;
    cards: Card[];
}

const gameStates = new Map<string, GameState>();
const DECK_COUNT = 10;

function loadDeck(index: number): DeckFile {
    const name = `deck-${String(index + 1).padStart(2, '0')}.json`;
    const path = join(import.meta.dir, 'data/decks', name);
    return JSON.parse(readFileSync(path, 'utf-8')) as DeckFile;
}

export function initGame(roomCode: string, players: Profile[], timerSeconds: number): GameState {
    const deckIndex = Math.floor(Math.random() * DECK_COUNT);
    const deck = loadDeck(deckIndex);

    const playerStates = new Map<string, PlayerGameState>();
    for (const player of players) {
        playerStates.set(player.id, {
            playerId: player.id,
            playerName: player.name,
            lives: 3,
            score: 0,
            heat: 0,
            timeline: [deck.startingCard],
            hasPlaced: false,
            eliminated: false,
            placement: undefined,
        });
    }

    const state: GameState = {
        roomCode,
        deck: deck.cards,
        startingCard: deck.startingCard,
        currentCardIndex: 0,
        timerSeconds,
        phase: 'placing',
        timerHandle: null,
        playerStates,
    };

    gameStates.set(roomCode, state);
    return state;
}

export function getGameState(roomCode: string): GameState | undefined {
    return gameStates.get(roomCode);
}

export function deleteGameState(roomCode: string): void {
    gameStates.delete(roomCode);
}

export function isCorrectPlacement(timeline: Card[], afterIndex: number, card: Card): boolean {
    const before = afterIndex >= 0 ? timeline[afterIndex] : null;
    const after = afterIndex + 1 < timeline.length ? timeline[afterIndex + 1] : null;

    if (before && card.year < before.year) return false;
    if (after && card.year > after.year) return false;
    return true;
}

export function processPlacement(
    gameState: GameState,
    playerId: string,
    afterIndex: number,
): { allAlivePlaced: boolean } {
    const player = gameState.playerStates.get(playerId);
    if (!player || player.eliminated || player.hasPlaced || gameState.phase !== 'placing') {
        return { allAlivePlaced: false };
    }

    player.hasPlaced = true;
    player.placement = afterIndex;

    const allAlivePlaced = [...gameState.playerStates.values()]
        .filter(p => !p.eliminated)
        .every(p => p.hasPlaced);

    return { allAlivePlaced };
}

export function eliminatePlayer(gameState: GameState, playerId: string): void {
    const player = gameState.playerStates.get(playerId);
    if (player) player.eliminated = true;
}

export function checkGameOver(gameState: GameState): boolean {
    return [...gameState.playerStates.values()].every(p => p.eliminated);
}

export function computeRoundResults(gameState: GameState): RoundResult[] {
    const currentCard = gameState.deck[gameState.currentCardIndex];
    const results: RoundResult[] = [];

    for (const player of gameState.playerStates.values()) {
        if (player.eliminated) continue;

        const timedOut = !player.hasPlaced;
        const correct = !timedOut && isCorrectPlacement(player.timeline, player.placement!, currentCard);

        let scoreDelta = 0;
        let newHeat = 0;
        let newLives = player.lives;

        if (correct) {
            scoreDelta = player.heat + 1;
            newHeat = player.heat + 1;
            // Insert card into timeline maintaining sort by year
            const insertAt = player.timeline.findIndex(c => c.year > currentCard.year);
            if (insertAt === -1) {
                player.timeline.push(currentCard);
            } else {
                player.timeline.splice(insertAt, 0, currentCard);
            }
        } else {
            newLives = player.lives - 1;
        }

        const eliminated = newLives <= 0;

        player.score += scoreDelta;
        player.heat = newHeat;
        player.lives = newLives;
        player.eliminated = eliminated;

        results.push({
            playerId: player.playerId,
            correct,
            timedOut,
            scoreDelta,
            newScore: player.score,
            newLives,
            newHeat,
            eliminated,
        });
    }

    return results;
}

export function advanceRound(gameState: GameState): 'next_card' | 'game_over' {
    for (const player of gameState.playerStates.values()) {
        player.hasPlaced = false;
        player.placement = undefined;
    }

    gameState.currentCardIndex++;
    gameState.phase = 'placing';

    if (gameState.currentCardIndex >= gameState.deck.length || checkGameOver(gameState)) {
        return 'game_over';
    }
    return 'next_card';
}

export function getPublicStats(gameState: GameState): PublicPlayerStats[] {
    return [...gameState.playerStates.values()].map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        lives: p.lives,
        score: p.score,
        heat: p.heat,
        hasPlaced: p.hasPlaced,
        eliminated: p.eliminated,
    }));
}

export function getCurrentCard(gameState: GameState): Card {
    return gameState.deck[gameState.currentCardIndex];
}
