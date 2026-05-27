import { dbGet, dbAll, dbRun } from '../db.ts';
import type { Profile } from '../../shared/types.ts';
import type { BunRequest } from 'bun';

export const profileRoutes = {
    '/api/profiles': {
        GET: () => {
            return Response.json(dbAll<Profile>('SELECT * FROM profiles'));
        },
        POST: async (req: Request) => {
            const { id, name } = await req.json() as Partial<Profile>;
            if (!id || !name) return Response.json({ error: 'id and name are required' }, { status: 400 });
            dbRun('INSERT INTO profiles (id, name) VALUES (?, ?)', [id, name]);
            return Response.json({ id, name }, { status: 201 });
        },
    },
    '/api/profiles/:id': {
        GET: (req: BunRequest<'/api/profiles/:id'>) => {
            const profile = dbGet<Profile>('SELECT * FROM profiles WHERE id = ?', [req.params.id]);
            if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
            return Response.json(profile);
        },
        PUT: async (req: BunRequest<'/api/profiles/:id'>) => {
            const { name } = await req.json() as Partial<Profile>;
            if (!name) return Response.json({ error: 'name is required' }, { status: 400 });
            const result = dbRun('UPDATE profiles SET name = ? WHERE id = ?', [name, req.params.id]);
            if (result.changes === 0) return Response.json({ error: 'Profile not found' }, { status: 404 });
            return Response.json({ id: req.params.id, name });
        },
        DELETE: (req: BunRequest<'/api/profiles/:id'>) => {
            const result = dbRun('DELETE FROM profiles WHERE id = ?', [req.params.id]);
            if (result.changes === 0) return Response.json({ error: 'Profile not found' }, { status: 404 });
            return new Response(null, { status: 204 });
        },
    },
};
