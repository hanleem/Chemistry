import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { seedAdmin, seedStudAdmin, seedFairAdmin, seedFairSchedule, seedRndPrograms, seedGradSchedule } from './db.js';
import authRoutes from './routes/auth.js';
import roadmapRoutes from './routes/roadmaps.js';
import courseDescRoutes from './routes/courseDescs.js';
import reservationRoutes from './routes/reservations.js';
import noticeRoutes from './routes/notices.js';
import fairPosterRoutes from './routes/fairPosters.js';
import fairScheduleRoutes from './routes/fairSchedule.js';
import fairBooth2Routes from './routes/fairBooth2.js';
import fairRndRoutes from './routes/fairRnd.js';
import fairGradScheduleRoutes from './routes/fairGradSchedule.js';
import visitsRoutes from './routes/visits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

// In dev (Vite proxy), the browser hits Vite first then it proxies /api here — same origin, no CORS needed.
// In production, the same Express server serves the built client, so CORS is not needed either.
// CORS is only useful if you intentionally split client/server origins.
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
}

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/course-descs', courseDescRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/fair-posters', fairPosterRoutes);
app.use('/api/fair-schedule', fairScheduleRoutes);
app.use('/api/fair-booth2', fairBooth2Routes);
app.use('/api/fair-rnd', fairRndRoutes);
app.use('/api/fair-grad-schedule', fairGradScheduleRoutes);
app.use('/api/visits', visitsRoutes);

// Generic JSON error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: '서버 오류' });
});

// Serve built client (production)
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback — anything not /api/* falls through to index.html
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn(`[server] client/dist not found at ${clientDist}. Run "npm run build" inside client/ to enable static serving.`);
}

seedAdmin();
seedStudAdmin();
seedFairAdmin();
seedFairSchedule();
seedRndPrograms();
seedGradSchedule();

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
