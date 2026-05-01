import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, setSessionCookie, clearSessionCookie, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { student_id, name, password } = req.body || {};
  if (!student_id || !name || !password) {
    return res.status(400).json({ error: '학번, 이름, 비밀번호를 모두 입력하세요.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE student_id = ?').get(student_id);
  if (exists) return res.status(409).json({ error: '이미 등록된 학번입니다.' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    "INSERT INTO users (student_id, name, password_hash, role) VALUES (?, ?, ?, 'student')"
  ).run(String(student_id).trim(), String(name).trim(), hash);

  const user = db.prepare(
    'SELECT id, student_id, name, role FROM users WHERE id = ?'
  ).get(info.lastInsertRowid);

  setSessionCookie(res, signToken(user));
  res.json({ user });
});

router.post('/login', (req, res) => {
  const { student_id, password } = req.body || {};
  if (!student_id || !password) {
    return res.status(400).json({ error: '학번과 비밀번호를 입력하세요.' });
  }
  const row = db.prepare(
    'SELECT id, student_id, name, role, password_hash FROM users WHERE student_id = ?'
  ).get(String(student_id).trim());
  if (!row) return res.status(401).json({ error: '학번 또는 비밀번호가 올바르지 않습니다.' });

  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: '학번 또는 비밀번호가 올바르지 않습니다.' });

  const user = { id: row.id, student_id: row.student_id, name: row.name, role: row.role };
  setSessionCookie(res, signToken(user));
  res.json({ user });
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
