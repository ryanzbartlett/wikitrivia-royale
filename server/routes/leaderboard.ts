import { dbAll } from '../db.ts';

interface LeaderboardEntry {
    profile_id: string;
    profile_name: string;
    best_score: number;
    games_played: number;
}

export const leaderboardRoutes = {
    '/api/leaderboard': {
        GET: (req: Request) => {
            const limit = Math.min(Number(new URL(req.url).searchParams.get('limit') ?? '10'), 100);
            const rows = dbAll<LeaderboardEntry>(
                `SELECT profile_id, profile_name, MAX(score) as best_score, COUNT(*) as games_played
                 FROM leaderboard
                 GROUP BY profile_id
                 ORDER BY best_score DESC
                 LIMIT ?`,
                [limit],
            );
            return Response.json(rows);
        },
    },
};
