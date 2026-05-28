export interface Profile {
    id: string;
    name: string;
}

export interface Room {
    code: string;
    hostId: string;
    players: Profile[];
    status: 'lobby' | 'playing' | 'ended';
}

export interface Card {
    qid: string;
    title: string;
    subtitle: string;
    year: number;
    fact: string;
    wikipediaSlug: string;
    image: string;
    pageViews: number;
}

export interface PublicPlayerStats {
    playerId: string;
    playerName: string;
    lives: number;
    score: number;
    heat: number;
    hasPlaced: boolean;
    eliminated: boolean;
}

export interface RoundResult {
    playerId: string;
    correct: boolean;
    timedOut: boolean;
    scoreDelta: number;
    newScore: number;
    newLives: number;
    newHeat: number;
    eliminated: boolean;
}

export type ServerMessage =
    | { type: 'room_state'; room: Room }
    | { type: 'player_joined'; player: Profile }
    | { type: 'player_left'; playerId: string; newHostId?: string }
    | { type: 'game_started'; startingCard: Card; timerSeconds: number; playerStats: PublicPlayerStats[] }
    | { type: 'card_revealed'; card: Card; cardIndex: number; totalCards: number }
    | { type: 'player_placed'; playerId: string }
    | { type: 'round_results'; cardYear: number; results: RoundResult[]; playerStats: PublicPlayerStats[] }
    | { type: 'game_ended'; finalScores: PublicPlayerStats[] };

export type ClientMessage =
    | { type: 'start_game'; timerSeconds: number }
    | { type: 'place_card'; afterIndex: number };
