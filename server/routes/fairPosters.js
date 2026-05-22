import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// 관리자 권한 확인 미들웨어
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  next();
}

// GET /api/fair-posters — 모든 랩 포스터 반환 (공개)
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT lab_id, poster_data, poster_type, uploaded_at FROM fair_posters').all();
  const posters = {};
  rows.forEach(r => { posters[r.lab_id] = r; });
  res.json({ posters });
});

// POST /api/fair-posters/:labId — 포스터 업로드 (관리자)
router.post('/:labId', requireAuth, requireAdmin, (req, res) => {
  const labId = Number(req.params.labId);
  const { poster_data, poster_type } = req.body || {};
  if (!poster_data) return res.status(400).json({ error: '이미지 데이터가 없습니다.' });

  db.prepare(`
    INSERT INTO fair_posters (lab_id, poster_data, poster_type, uploaded_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(lab_id) DO UPDATE SET
      poster_data = excluded.poster_data,
      poster_type = excluded.poster_type,
      uploaded_by = excluded.uploaded_by,
      uploaded_at = datetime('now')
  `).run(labId, poster_data, poster_type || null, req.user.id);

  res.json({ ok: true });
});

// DELETE /api/fair-posters/:labId — 포스터 삭제 (관리자)
router.delete('/:labId', requireAuth, requireAdmin, (req, res) => {
  const labId = Number(req.params.labId);
  db.prepare('DELETE FROM fair_posters WHERE lab_id = ?').run(labId);
  res.json({ ok: true });
});

export default router;
