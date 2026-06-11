import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/lab-blocks
router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM lab_blocks ORDER BY start_date, start_time'
  ).all();
  res.json(rows);
});

// POST /api/lab-blocks  { class_name, start_date, end_date, start_time, end_time }
router.post('/', requireAdmin, (req, res) => {
  const { class_name, start_date, end_date, start_time, end_time } = req.body;
  if (!class_name?.trim() || !start_date || !end_date || !start_time || !end_time)
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  if (start_date > end_date)
    return res.status(400).json({ error: '종료일이 시작일보다 빠릅니다.' });
  if (start_time >= end_time)
    return res.status(400).json({ error: '종료 시간이 시작 시간보다 빠릅니다.' });

  const result = db.prepare(
    `INSERT INTO lab_blocks (class_name, start_date, end_date, start_time, end_time, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(class_name.trim(), start_date, end_date, start_time, end_time, req.user.id);

  res.json({ id: result.lastInsertRowid, class_name: class_name.trim(), start_date, end_date, start_time, end_time });
});

// DELETE /api/lab-blocks/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM lab_blocks WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: '찾을 수 없습니다.' });
  db.prepare('DELETE FROM lab_blocks WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
