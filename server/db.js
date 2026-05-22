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

  CREATE TABLE IF NOT EXISTS reservations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT NOT NULL,
    time_slot  TEXT NOT NULL,
    name       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(date, time_slot)
  );
  CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

  CREATE TABLE IF NOT EXISTS course_descs (
    course_id  TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notices (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    content      TEXT,
    link_url     TEXT,
    poster_data  TEXT,
    poster_type  TEXT,
    created_by   INTEGER REFERENCES users(id),
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fair_posters (
    lab_id       INTEGER NOT NULL UNIQUE,
    poster_data  TEXT NOT NULL,
    poster_type  TEXT,
    uploaded_by  INTEGER REFERENCES users(id),
    uploaded_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fair_booth2_posters (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    lab_name    TEXT NOT NULL,
    prof_name   TEXT NOT NULL,
    poster_data TEXT NOT NULL,
    poster_type TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fair_schedule (
    prof_name  TEXT PRIMARY KEY,
    lab_name   TEXT NOT NULL,
    time_slot  TEXT NOT NULL,
    color_cls  TEXT NOT NULL DEFAULT 'pr1',
    av_cls     TEXT NOT NULL DEFAULT 'av1',
    icon       TEXT NOT NULL DEFAULT '👨‍🔬',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fair_grad_schedule (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    time_slot   TEXT NOT NULL,
    lab_labels  TEXT NOT NULL DEFAULT '[]',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_by  INTEGER REFERENCES users(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fair_rnd_programs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    badge       TEXT NOT NULL DEFAULT '',
    title       TEXT NOT NULL,
    subtitle    TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    features    TEXT NOT NULL DEFAULT '[]',
    link_url    TEXT NOT NULL DEFAULT '',
    color_cls   TEXT NOT NULL DEFAULT 'c1',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_by  INTEGER REFERENCES users(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
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

// Seed professor consultation schedule defaults (idempotent)
export function seedFairSchedule() {
  const defaults = [
    { prof_name: '박노경', lab_name: '바이오분자공학연구실',   time_slot: '10:30 – 11:00', color_cls: 'pr1', av_cls: 'av4', icon: '🧬' },
    { prof_name: '이한림', lab_name: '에너지나노소재 연구실',  time_slot: '13:30 – 14:00', color_cls: 'pr2', av_cls: 'av3', icon: '⚡' },
    { prof_name: '김수연', lab_name: '에너지·환경재료 연구실', time_slot: '15:30 – 16:00', color_cls: 'pr3', av_cls: 'av2', icon: '💻' },
    { prof_name: '이동기', lab_name: '유기합성·재료 연구실',   time_slot: '11:00 – 11:30', color_cls: 'pr1', av_cls: 'av1', icon: '🧪' },
  ];
  const insert = db.prepare(`
    INSERT OR IGNORE INTO fair_schedule (prof_name, lab_name, time_slot, color_cls, av_cls, icon)
    VALUES (@prof_name, @lab_name, @time_slot, @color_cls, @av_cls, @icon)
  `);
  defaults.forEach(row => insert.run(row));
}

// Seed fair admin account (idempotent) — id: chemistry / pw: 236250
export function seedFairAdmin() {
  const existing = db.prepare("SELECT id FROM users WHERE student_id = 'chemistry'").get();
  if (existing) {
    db.prepare("UPDATE users SET role='admin' WHERE id=?").run(existing.id);
    return;
  }
  const hash = bcrypt.hashSync('236250', 10);
  db.prepare(
    "INSERT INTO users (student_id, name, password_hash, role) VALUES ('chemistry', '박람회관리자', ?, 'admin')"
  ).run(hash);
  console.log('[seed] fair admin (chemistry) created');
}

// Seed fixed studadmin account (idempotent)
export function seedStudAdmin() {
  const existing = db.prepare("SELECT id FROM users WHERE student_id = 'studadmin'").get();
  if (existing) {
    db.prepare("UPDATE users SET role='admin' WHERE id=?").run(existing.id);
    return;
  }
  const hash = bcrypt.hashSync('chemistry', 10);
  db.prepare(
    "INSERT INTO users (student_id, name, password_hash, role) VALUES ('studadmin', '학생관리자', ?, 'admin')"
  ).run(hash);
  console.log('[seed] studadmin created');
}

// Seed default graduate student schedule (idempotent)
export function seedGradSchedule() {
  const count = db.prepare('SELECT COUNT(*) as c FROM fair_grad_schedule').get();
  if (count.c > 0) return;

  const LA = JSON.stringify([{ label: '에너지·환경소재연구실 (김수연)', cls: 'lab-a' }]);
  const LB = JSON.stringify([{ label: '바이오분자공학연구실 (박노경)',  cls: 'lab-b' }]);
  const LC = JSON.stringify([{ label: '나노에너지랩실 (이한림)',        cls: 'lab-c' }]);
  const LAB = JSON.stringify([
    { label: '에너지·환경소재연구실 (김수연)', cls: 'lab-a' },
    { label: '바이오분자공학연구실 (박노경)',  cls: 'lab-b' },
  ]);
  const LAC = JSON.stringify([
    { label: '에너지·환경소재연구실 (김수연)', cls: 'lab-a' },
    { label: '나노에너지랩실 (이한림)',        cls: 'lab-c' },
  ]);

  const defaults = [
    { time_slot: '10:00 – 11:00', lab_labels: LAB,  sort_order: 0 },
    { time_slot: '11:00 – 12:00', lab_labels: LB,   sort_order: 1 },
    { time_slot: '12:00 – 13:00', lab_labels: LB,   sort_order: 2 },
    { time_slot: '13:00 – 14:00', lab_labels: LC,   sort_order: 3 },
    { time_slot: '14:00 – 15:00', lab_labels: LC,   sort_order: 4 },
    { time_slot: '15:00 – 16:00', lab_labels: LAC,  sort_order: 5 },
  ];
  const insert = db.prepare(`
    INSERT INTO fair_grad_schedule (time_slot, lab_labels, sort_order)
    VALUES (@time_slot, @lab_labels, @sort_order)
  `);
  defaults.forEach(row => insert.run(row));
  console.log('[seed] grad schedule seeded');
}

// Seed default R&D programs (idempotent)
export function seedRndPrograms() {
  const count = db.prepare('SELECT COUNT(*) as c FROM fair_rnd_programs').get();
  if (count.c > 0) return; // already seeded

  const defaults = [
    {
      badge: '3 · 4학년 대상',
      title: '제1회 R&D 경진대회',
      subtitle: '대학원생 1:1 멘토링으로 시작하는 나의 첫 연구!',
      description: '대학원생과 대학생을 1:1로 매칭하여 함께 연구를 진행하고, 그 결과를 연구 포스터로 제출하는 경진대회예요.',
      features: JSON.stringify([
        '대학원생 ↔ 대학생 1:1 매칭 연구 진행',
        '실제 랩실의 연구 장비 및 시약 활용',
        '연구 결과를 포스터로 제출 · 발표',
        '🏆 우수팀 시상 + 총장상 수여',
      ]),
      link_url: 'https://www.mju.ac.kr/energymaterials/11451/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZW5lcmd5bWF0ZXJpYWxzJTJGMTYzNCUyRjIzMDc5OSUyRmFydGNsVmlldy5kbyUzRnBhZ2UlM0QxJTI2c3JjaENvbHVtbiUzRCUyNnNyY2hXcmQlM0QlMjZiYnNDbFNlcSUzRCUyNmJic09wZW5XcmRTZXElM0QlMjZyZ3NCZ25kZVN0ciUzRCUyNnJnc0VuZGRlU3RyJTNEJTI2aXNWaWV3TWluZSUzRGZhbHNlJTI2aXNWaWV3JTNEdHJ1ZSUyNnBhc3N3b3JkJTNEJTI2',
      color_cls: 'c1',
      sort_order: 0,
    },
    {
      badge: '전 학년 대상',
      title: '명지 R&D 랩(LAB) 경진대회',
      subtitle: '랩 투어 · 선배 상담 · 동영상 제작 콘테스트',
      description: '관심있는 랩실을 직접 방문해 투어하고, 대학원 선배와 상담한 경험을 바탕으로 그 연구실을 소개하는 동영상을 제작 · 제출하는 프로그램이에요.',
      features: JSON.stringify([
        '랩실 직접 방문 · 투어 경험',
        '대학원 선배와의 1:1 상담',
        '경험을 바탕으로 연구실 소개 동영상 제작',
        '🏆 입상 시 상금 100만원 + 총장상 수여',
      ]),
      link_url: 'https://www.mju.ac.kr/energymaterials/11451/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZW5lcmd5bWF0ZXJpYWxzJTJGMTYzNCUyRjIzMTI0NCUyRmFydGNsVmlldy5kbyUzRnBhZ2UlM0QxJTI2c3JjaENvbHVtbiUzRCUyNnNyY2hXcmQlM0QlMjZiYnNDbFNlcSUzRCUyNmJic09wZW5XcmRTZXElM0QlMjZyZ3NCZ25kZVN0ciUzRCUyNnJnc0VuZGRlU3RyJTNEJTI2aXNWaWV3TWluZSUzRGZhbHNlJTI2aXNWaWV3JTNEdHJ1ZSUyNnBhc3N3b3JkJTNEJTI2',
      color_cls: 'c2',
      sort_order: 1,
    },
  ];
  const insert = db.prepare(`
    INSERT INTO fair_rnd_programs (badge, title, subtitle, description, features, link_url, color_cls, sort_order)
    VALUES (@badge, @title, @subtitle, @description, @features, @link_url, @color_cls, @sort_order)
  `);
  defaults.forEach(row => insert.run(row));
  console.log('[seed] R&D programs seeded');
}
