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

export type ServerMessage =
    | { type: 'room_state'; room: Room }
    | { type: 'player_joined'; player: Profile }
    | { type: 'player_left'; playerId: string; newHostId?: string };
