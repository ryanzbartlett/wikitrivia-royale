import { Router } from 'express';
import { dbGet, dbAll, dbRun } from '../db.ts';

interface Profile {
    id: string;
    name: string;
}

const router = Router();

router.get('/', async (_req, res) => {
    const profiles = await dbAll<Profile>('SELECT * FROM profiles');
    res.json(profiles);
});

router.get('/:id', async (req, res) => {
    const profile = await dbGet<Profile>('SELECT * FROM profiles WHERE id = ?', [req.params.id]);
    if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    res.json(profile);
});

router.post('/', async (req, res) => {
    const { id, name } = req.body as Partial<Profile>;
    if (!id || !name) {
        res.status(400).json({ error: 'id and name are required' });
        return;
    }
    await dbRun('INSERT INTO profiles (id, name) VALUES (?, ?)', [id, name]);
    res.status(201).json({ id, name });
});

router.put('/:id', async (req, res) => {
    const { name } = req.body as Partial<Profile>;
    if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const result = await dbRun('UPDATE profiles SET name = ? WHERE id = ?', [name, req.params.id]);
    if (result.changes === 0) {
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    res.json({ id: req.params.id, name });
});

router.delete('/:id', async (req, res) => {
    const result = await dbRun('DELETE FROM profiles WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    res.status(204).send();
});

export default router;
