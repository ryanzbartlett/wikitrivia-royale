import { dbGet, dbAll, dbRun } from '../db.ts';

interface Profile {
    id: string;
    name: string;
}

export async function handleProfiles(req: Request, url: URL): Promise<Response> {
    const id = url.pathname.split('/')[2]; // /profiles/:id

    if (req.method === 'GET' && !id) {
        return Response.json(dbAll<Profile>('SELECT * FROM profiles'));
    }

    if (req.method === 'GET' && id) {
        const profile = dbGet<Profile>('SELECT * FROM profiles WHERE id = ?', [id]);
        if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
        return Response.json(profile);
    }

    if (req.method === 'POST' && !id) {
        const { id: newId, name } = await req.json() as Partial<Profile>;
        if (!newId || !name) return Response.json({ error: 'id and name are required' }, { status: 400 });
        dbRun('INSERT INTO profiles (id, name) VALUES (?, ?)', [newId, name]);
        return Response.json({ id: newId, name }, { status: 201 });
    }

    if (req.method === 'PUT' && id) {
        const { name } = await req.json() as Partial<Profile>;
        if (!name) return Response.json({ error: 'name is required' }, { status: 400 });
        const result = dbRun('UPDATE profiles SET name = ? WHERE id = ?', [name, id]);
        if (result.changes === 0) return Response.json({ error: 'Profile not found' }, { status: 404 });
        return Response.json({ id, name });
    }

    if (req.method === 'DELETE' && id) {
        const result = dbRun('DELETE FROM profiles WHERE id = ?', [id]);
        if (result.changes === 0) return Response.json({ error: 'Profile not found' }, { status: 404 });
        return new Response(null, { status: 204 });
    }

    return new Response('Method Not Allowed', { status: 405 });
}
