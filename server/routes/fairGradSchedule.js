import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

// GET /api/fair-grad-schedule — 전체 목록 (공개)
router.get('/', (_req, res) => {
  const rows = db.prepare(
    'SELECT id, time_slot, lab_labels, sort_order FROM fair_grad_schedule ORDER BY sort_order ASC, id ASC'
  ).all();
  res.json({ schedule: rows });
});

// POST /api/fair-grad-schedule — 블록 추가 (관리자)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { time_slot, lab_labels, sort_order } = req.body || {};
  if (!time_slot) return res.status(400).json({ error: '시간대를 입력해 주세요.' });
  const labsJson = Array.isArray(lab_labels) ? JSON.stringify(lab_labels) : (lab_labels || '[]');
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) as m FROM fair_grad_schedule').get().m;
  const info = db.prepare(`
    INSERT INTO fair_grad_schedule (time_slot, lab_labels, sort_order, created_by)
    VALUES (?, ?, ?, ?)
  `).run(time_slot.trim(), labsJson, sort_order ?? maxOrder + 1, req.user.id);
  res.json({ ok: true, id: info.lastInsertRowid });
});

// PATCH /api/fair-grad-schedule/:id — 블록 수정 (관리자)
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const { time_slot, lab_labels } = req.body || {};
  if (!time_slot) return res.status(400).json({ error: '시간대를 입력해 주세요.' });
  const labsJson = Array.isArray(lab_labels) ? JSON.stringify(lab_labels) : (lab_labels || '[]');
  db.prepare('UPDATE fair_grad_schedule SET time_slot=?, lab_labels=? WHERE id=?')
    .run(time_slot.trim(), labsJson, Number(req.params.id));
  res.json({ ok: true });
});

// DELETE /api/fair-grad-schedule/:id — 블록 삭제 (관리자)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM fair_grad_schedule WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

export default router;
