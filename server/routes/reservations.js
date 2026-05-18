import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/reservations?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start, end 파라미터 필요' });
  const rows = db.prepare(
    'SELECT * FROM reservations WHERE date >= ? AND date <= ? ORDER BY date, time_slot'
  ).all(start, end);
  res.json(rows);
});

// POST /api/reservations  { date, time_slot, name }
router.post('/', (req, res) => {
  const { date, time_slot, name } = req.body;
  if (!date || !time_slot || !name?.trim())
    return res.status(400).json({ error: '날짜, 시간, 이름을 모두 입력하세요.' });

  const existing = db.prepare(
    'SELECT id FROM reservations WHERE date = ? AND time_slot = ?'
  ).get(date, time_slot);
  if (existing) return res.status(409).json({ error: '이미 예약된 시간입니다.' });

  const result = db.prepare(
    'INSERT INTO reservations (date, time_slot, name) VALUES (?, ?, ?)'
  ).run(date, time_slot, name.trim());

  res.json({ id: result.lastInsertRowid, date, time_slot, name: name.trim() });
});

// DELETE /api/reservations/:id  body: { name }
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
  if (row.name !== name?.trim()) return res.status(403).json({ error: '이름이 일치하지 않습니다.' });
  db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
