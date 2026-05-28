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
