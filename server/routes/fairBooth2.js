import { Router } from 'express';
import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

// GET /api/fair-booth2 — 포스터 목록 (공개)
router.get('/', (_req, res) => {
  const posters = db.prepare(
    'SELECT id, lab_name, prof_name, poster_data, poster_type, sort_order, uploaded_at FROM fair_booth2_posters ORDER BY sort_order ASC, id ASC'
  ).all();
  res.json({ posters });
});

// POST /api/fair-booth2 — 포스터 업로드 (관리자)
// 파일 바이너리를 body로, lab_name/poster_type 은 query string으로 전달
router.post(
  '/',
  express.raw({ type: '*/*', limit: '100mb' }),
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { lab_name, prof_name = '', poster_type = 'application/octet-stream' } = req.query;
    if (!lab_name) {
      return res.status(400).json({ error: '연구실을 선택해 주세요.' });
    }
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: '파일을 선택해 주세요.' });
    }

    // Buffer → base64 data URL (기존 저장 형식과 동일)
    const base64 = req.body.toString('base64');
    const dataUrl = `data:${poster_type};base64,${base64}`;

    const info = db.prepare(
      'INSERT INTO fair_booth2_posters (lab_name, prof_name, poster_data, poster_type, uploaded_by) VALUES (?, ?, ?, ?, ?)'
    ).run(
      lab_name.trim(),
      (prof_name || '').trim(),
      dataUrl,
      poster_type,
      req.user.id
    );
    res.json({ ok: true, id: info.lastInsertRowid });
  }
);

// DELETE /api/fair-booth2/:id — 포스터 삭제 (관리자)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM fair_booth2_posters WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

// PATCH /api/fair-booth2/:id — 연구실명/교수명 수정 (관리자)
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const { lab_name, prof_name } = req.body || {};
  if (!lab_name) return res.status(400).json({ error: '연구실명을 입력해 주세요.' });
  db.prepare('UPDATE fair_booth2_posters SET lab_name=?, prof_name=? WHERE id=?')
    .run(lab_name.trim(), (prof_name || '').trim(), Number(req.params.id));
  res.json({ ok: true });
});

export default router;
