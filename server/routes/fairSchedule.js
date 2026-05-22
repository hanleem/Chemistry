import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

// GET /api/fair-schedule — 전체 일정 반환 (공개)
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM fair_schedule ORDER BY time_slot').all();
  res.json({ schedule: rows });
});

// PUT /api/fair-schedule/:profName — 시간/연구실 수정 (관리자)
router.put('/:profName', requireAuth, requireAdmin, (req, res) => {
  const profName = decodeURIComponent(req.params.profName);
  const { time_slot, lab_name } = req.body || {};
  if (!time_slot) return res.status(400).json({ error: '시간을 입력해 주세요.' });

  const existing = db.prepare('SELECT prof_name FROM fair_schedule WHERE prof_name = ?').get(profName);
  if (!existing) return res.status(404).json({ error: '해당 교수님을 찾을 수 없습니다.' });

  db.prepare(`
    UPDATE fair_schedule
    SET time_slot = ?, lab_name = ?, updated_at = datetime('now')
    WHERE prof_name = ?
  `).run(time_slot.trim(), lab_name ? lab_name.trim() : existing.lab_name, profName);

  res.json({ ok: true });
});

// POST /api/fair-schedule — 교수 추가 (관리자)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { prof_name, lab_name, time_slot, color_cls, av_cls, icon } = req.body || {};
  if (!prof_name || !lab_name || !time_slot) return res.status(400).json({ error: '필수 항목 누락' });
  db.prepare(`
    INSERT OR REPLACE INTO fair_schedule (prof_name, lab_name, time_slot, color_cls, av_cls, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(prof_name.trim(), lab_name.trim(), time_slot.trim(),
         color_cls || 'pr1', av_cls || 'av1', icon || '👨‍🔬');
  res.json({ ok: true });
});

// DELETE /api/fair-schedule/:profName — 교수 삭제 (관리자)
router.delete('/:profName', requireAuth, requireAdmin, (req, res) => {
  const profName = decodeURIComponent(req.params.profName);
  db.prepare('DELETE FROM fair_schedule WHERE prof_name = ?').run(profName);
  res.json({ ok: true });
});

export default router;
