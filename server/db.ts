import { Database, type SQLQueryBindings } from 'bun:sqlite';

const db = new Database(process.env.DB_PATH ?? './data.db');

db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
        id   TEXT PRIMARY KEY,
        name TEXT NOT NULL
    )
`);

export function dbGet<T>(sql: string, params: SQLQueryBindings[] = []): T | undefined {
    return db.prepare(sql).get(...params) as T | undefined;
}

export function dbAll<T>(sql: string, params: SQLQueryBindings[] = []): T[] {
    return db.prepare(sql).all(...params) as T[];
}

export function dbRun(sql: string, params: SQLQueryBindings[] = []): { changes: number } {
    const result = db.prepare(sql).run(...params);
    return { changes: Number(result.changes) };
}
