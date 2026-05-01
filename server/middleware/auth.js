import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-change-me';
const COOKIE_NAME = 'chem_session';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '30d' });
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== '0',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function readUserFromToken(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    const user = db.prepare(
      'SELECT id, student_id, name, role FROM users WHERE id = ?'
    ).get(payload.id);
    return user || null;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const user = readUserFromToken(req);
  if (!user) return res.status(401).json({ error: '로그인이 필요합니다.' });
  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  const user = readUserFromToken(req);
  if (!user) return res.status(401).json({ error: '로그인이 필요합니다.' });
  if (user.role !== 'admin') return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  req.user = user;
  next();
}

export function optionalAuth(req, _res, next) {
  req.user = readUserFromToken(req);
  next();
}
