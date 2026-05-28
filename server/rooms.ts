import type { Profile, Room } from '../shared/types.ts';

const rooms = new Map<string, Room>();

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export function createRoom(host: Profile): Room {
    let code: string;
    do { code = generateCode(); } while (rooms.has(code));

    const room: Room = { code, hostId: host.id, players: [host], status: 'lobby' };
    rooms.set(code, room);
    return room;
}

export function getRoom(code: string): Room | undefined {
    return rooms.get(code);
}

export function joinRoom(code: string, player: Profile): Room | null {
    const room = rooms.get(code);
    if (!room || room.status !== 'lobby') return null;
    if (!room.players.find(p => p.id === player.id)) {
        room.players.push(player);
    }
    return room;
}

export function leaveRoom(code: string, profileId: string): Room | null {
    const room = rooms.get(code);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== profileId);

    if (room.players.length === 0) {
        rooms.delete(code);
        return null;
    }

    if (room.hostId === profileId) {
        room.hostId = room.players[0].id;
    }

    return room;
}
