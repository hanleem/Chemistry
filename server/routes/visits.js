import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

// KST 기준 날짜 문자열 반환
function kstDate() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10); // YYYY-MM-DD
}
function kstMonth() {
  return kstDate().slice(0, 7); // YYYY-MM
}

// POST /api/visits — 접속 기록 (로그인 사용자, 하루 1회)
router.post('/', requireAuth, (req, res) => {
  const today = kstDate();
  const month = kstMonth();
  db.prepare(`
    INSERT OR IGNORE INTO visit_logs (user_id, visit_date, visit_month)
    VALUES (?, ?, ?)
  `).run(req.user.id, today, month);
  res.json({ ok: true });
});

// GET /api/visits/stats — 월별 통계 [admin]
router.get('/stats', requireAuth, requireAdmin, (req, res) => {
  const today      = kstDate();
  const thisMonth  = kstMonth();

  // 이번 달 고유 접속자 수
  const monthTotal = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM visit_logs WHERE visit_month = ?
  `).get(thisMonth).count;

  // 오늘 고유 접속자 수
  const todayTotal = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM visit_logs WHERE visit_date = ?
  `).get(today).count;

  // 이번 달 일별 현황
  const daily = db.prepare(`
    SELECT visit_date, COUNT(DISTINCT user_id) as count
    FROM visit_logs WHERE visit_month = ?
    GROUP BY visit_date ORDER BY visit_date ASC
  `).all(thisMonth);

  // 최근 12개월 월별 현황
  const monthly = db.prepare(`
    SELECT visit_month, COUNT(DISTINCT user_id) as count
    FROM visit_logs
    GROUP BY visit_month ORDER BY visit_month DESC LIMIT 12
  `).all();

  // 누적 총 접속자 수 (전체 기간, 중복 제거)
  const allTime = db.prepare(`
    SELECT COUNT(DISTINCT user_id || visit_date) as count FROM visit_logs
  `).get().count;

  res.json({ thisMonth, today, monthTotal, todayTotal, daily, monthly, allTime });
});

export default router;
