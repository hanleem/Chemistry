import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET all notices — public, no auth required
router.get('/', (_req, res) => {
  const notices = db.prepare(
    `SELECT id, title, content, link_url, poster_data, poster_type, created_at
     FROM notices ORDER BY created_at DESC`
  ).all();
  res.json({ notices });
});

// POST create notice — admin only
router.post('/', requireAdmin, (req, res) => {
  const { title, content, link_url, poster_data, poster_type } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: '제목을 입력하세요.' });
  const info = db.prepare(
    `INSERT INTO notices (title, content, link_url, poster_data, poster_type, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    title.trim(),
    content?.trim() || null,
    link_url?.trim() || null,
    poster_data || null,
    poster_type || null,
    req.user.id
  );
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(info.lastInsertRowid);
  res.json({ notice });
});

// DELETE notice — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: '잘못된 요청' });
  db.prepare('DELETE FROM notices WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
