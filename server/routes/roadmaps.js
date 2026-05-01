import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function rowToEntry(row) {
  const payload = JSON.parse(row.payload);
  return {
    id: row.id,
    label: row.label,
    savedAt: row.saved_at,
    careerPathId:    payload.careerPathId    ?? null,
    basicIds:        payload.basicIds        ?? [],
    upperIds:        payload.upperIds        ?? [],
    selectedTrackId: payload.selectedTrackId ?? null,
    selectedMicroId: payload.selectedMicroId ?? null,
  };
}

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT id, label, payload, saved_at FROM roadmaps WHERE user_id = ? ORDER BY id ASC'
  ).all(req.user.id);
  res.json({ roadmaps: rows.map(rowToEntry) });
});

router.post('/', requireAuth, (req, res) => {
  const { label, payload } = req.body || {};
  if (!label || typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ error: 'label과 payload가 필요합니다.' });
  }
  const info = db.prepare(
    'INSERT INTO roadmaps (user_id, label, payload) VALUES (?, ?, ?)'
  ).run(req.user.id, String(label), JSON.stringify(payload));

  const row = db.prepare(
    'SELECT id, label, payload, saved_at FROM roadmaps WHERE id = ?'
  ).get(info.lastInsertRowid);

  res.json({ roadmap: rowToEntry(row) });
});

router.delete('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });
  const info = db.prepare(
    'DELETE FROM roadmaps WHERE id = ? AND user_id = ?'
  ).run(id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default router;
