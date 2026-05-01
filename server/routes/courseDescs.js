import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All authenticated users can read overrides (so the UI can display admin-edited descriptions)
router.get('/', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT course_id, data FROM course_descs').all();
  const overrides = {};
  for (const row of rows) {
    try { overrides[row.course_id] = JSON.parse(row.data); } catch {}
  }
  res.json({ overrides });
});

// Only admins can create/update/delete
router.put('/:courseId', requireAdmin, (req, res) => {
  const { courseId } = req.params;
  const { desc, keywords, related } = req.body || {};
  if (typeof desc !== 'string') {
    return res.status(400).json({ error: 'desc(문자열)가 필요합니다.' });
  }
  const data = {
    desc: desc.trim(),
    keywords: Array.isArray(keywords) ? keywords.map(String).map(s => s.trim()).filter(Boolean) : [],
    ...(related && String(related).trim() ? { related: String(related).trim() } : {}),
  };
  db.prepare(`
    INSERT INTO course_descs (course_id, data, updated_by, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(course_id) DO UPDATE SET
      data = excluded.data,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  `).run(courseId, JSON.stringify(data), req.user.id);
  res.json({ ok: true, data });
});

router.delete('/:courseId', requireAdmin, (req, res) => {
  const { courseId } = req.params;
  db.prepare('DELETE FROM course_descs WHERE course_id = ?').run(courseId);
  res.json({ ok: true });
});

export default router;
