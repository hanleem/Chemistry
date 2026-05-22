import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

// GET /api/fair-rnd — 프로그램 목록 (공개)
router.get('/', (_req, res) => {
  const programs = db.prepare(
    'SELECT id, badge, title, subtitle, description, features, link_url, color_cls, sort_order, created_at FROM fair_rnd_programs ORDER BY sort_order ASC, id ASC'
  ).all();
  res.json({ programs });
});

// POST /api/fair-rnd — 프로그램 추가 (관리자)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { badge, title, subtitle, description, features, link_url, color_cls, sort_order } = req.body || {};
  if (!title) return res.status(400).json({ error: '프로그램 제목을 입력해 주세요.' });
  const featuresJson = Array.isArray(features)
    ? JSON.stringify(features)
    : (features || '[]');
  const info = db.prepare(`
    INSERT INTO fair_rnd_programs (badge, title, subtitle, description, features, link_url, color_cls, sort_order, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    (badge || '').trim(),
    title.trim(),
    (subtitle || '').trim(),
    (description || '').trim(),
    featuresJson,
    (link_url || '').trim(),
    color_cls || 'c1',
    sort_order ?? 0,
    req.user.id
  );
  res.json({ ok: true, id: info.lastInsertRowid });
});

// DELETE /api/fair-rnd/:id — 프로그램 삭제 (관리자)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM fair_rnd_programs WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

// PATCH /api/fair-rnd/:id — 프로그램 수정 (관리자)
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const { badge, title, subtitle, description, features, link_url, color_cls, sort_order } = req.body || {};
  if (!title) return res.status(400).json({ error: '프로그램 제목을 입력해 주세요.' });
  const featuresJson = Array.isArray(features)
    ? JSON.stringify(features)
    : (features || '[]');
  db.prepare(`
    UPDATE fair_rnd_programs
    SET badge=?, title=?, subtitle=?, description=?, features=?, link_url=?, color_cls=?, sort_order=?
    WHERE id=?
  `).run(
    (badge || '').trim(),
    title.trim(),
    (subtitle || '').trim(),
    (description || '').trim(),
    featuresJson,
    (link_url || '').trim(),
    color_cls || 'c1',
    sort_order ?? 0,
    Number(req.params.id)
  );
  res.json({ ok: true });
});

export default router;
