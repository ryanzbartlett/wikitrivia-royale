import type { BunRequest } from 'bun';
import type { Profile } from '../../shared/types.ts';
import { createRoom, getRoom } from '../rooms.ts';

export const roomRoutes = {
    '/api/rooms': {
        POST: async (req: Request) => {
            const host = await req.json() as Partial<Profile>;
            if (!host.id || !host.name) {
                return Response.json({ error: 'id and name are required' }, { status: 400 });
            }
            const room = createRoom(host as Profile);
            return Response.json(room, { status: 201 });
        },
    },
    '/api/rooms/:code': {
        GET: (req: BunRequest<'/api/rooms/:code'>) => {
            const room = getRoom(req.params.code.toUpperCase());
            if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
            return Response.json(room);
        },
    },
};
