import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'chem.db');

// ensure parent directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id    TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'student',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label     TEXT NOT NULL,
    payload   TEXT NOT NULL,
    saved_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);

  CREATE TABLE IF NOT EXISTS course_descs (
    course_id  TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed initial admin from env (idempotent)
export function seedAdmin() {
  const adminId = process.env.ADMIN_ID;
  const adminPw = process.env.ADMIN_PW;
  const adminName = process.env.ADMIN_NAME || '관리자';
  if (!adminId || !adminPw) {
    console.warn('[seed] ADMIN_ID / ADMIN_PW not set — skipping admin seed.');
    return;
  }
  const existing = db.prepare('SELECT id FROM users WHERE student_id = ?').get(adminId);
  if (existing) {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existing.id);
    return;
  }
  const hash = bcrypt.hashSync(adminPw, 10);
  db.prepare(
    "INSERT INTO users (student_id, name, password_hash, role) VALUES (?, ?, ?, 'admin')"
  ).run(adminId, adminName, hash);
  console.log(`[seed] Admin user created: ${adminId}`);
}
