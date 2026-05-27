import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./data.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    `);
});

export function dbGet<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T | undefined);
        });
    });
}

export function dbAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });
}

export function dbRun(sql: string, params: unknown[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}
