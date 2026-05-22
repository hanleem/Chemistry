# 기술 스택 · 개발 패턴 (skill.md)

> 이 프로젝트에서 사용하는 기술, 라이브러리, 코딩 패턴을 정리합니다.  
> 새 기능을 추가할 때 기존 패턴에 맞춰 작성하세요.

---

## 목차

1. [기술 스택 요약](#1-기술-스택-요약)
2. [백엔드 기술 상세](#2-백엔드-기술-상세)
   - 2-1. [Express 4](#2-1-express-4)
   - 2-2. [better-sqlite3](#2-2-better-sqlite3)
   - 2-3. [JWT + bcrypt 인증](#2-3-jwt--bcrypt-인증)
   - 2-4. [파일 업로드 방식](#2-4-파일-업로드-방식)
3. [프론트엔드 기술 상세](#3-프론트엔드-기술-상세)
   - 3-1. [React 18 + Vite](#3-1-react-18--vite)
   - 3-2. [Zustand](#3-2-zustand)
   - 3-3. [CSS-in-JS (인라인 스타일)](#3-3-css-in-js-인라인-스타일)
4. [독립 HTML 페이지 패턴](#4-독립-html-페이지-패턴)
   - 4-1. [구조 패턴](#4-1-구조-패턴)
   - 4-2. [API 호출 패턴](#4-2-api-호출-패턴)
   - 4-3. [관리자 모드 패턴](#4-3-관리자-모드-패턴)
   - 4-4. [PDF Blob URL 패턴](#4-4-pdf-blob-url-패턴)
5. [코딩 컨벤션](#5-코딩-컨벤션)
6. [의존성 목록](#6-의존성-목록)

---

## 1. 기술 스택 요약

| 영역 | 기술 | 버전 |
|---|---|---|
| 런타임 | Node.js | 18+ |
| 백엔드 프레임워크 | Express | 4.x |
| DB | SQLite via better-sqlite3 | 11.x |
| 비밀번호 해싱 | bcryptjs | 2.x |
| 인증 | jsonwebtoken | 9.x |
| 환경변수 | dotenv | 16.x |
| 프론트엔드 | React | 18 |
| 번들러 | Vite | 5.x |
| 상태 관리 | Zustand | — |
| 독립 페이지 | Vanilla JS (ES2020+) | — |

---

## 2. 백엔드 기술 상세

### 2-1. Express 4

**라우터 파일 구조 패턴**

```js
import { Router } from 'express';
import express from 'express';           // express.raw 등 필요 시
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

router.get('/', (_req, res) => { ... });
router.post('/', requireAuth, requireAdmin, (req, res) => { ... });

export default router;
```

**에러 처리 원칙**

- 모든 라우터는 에러 시 `res.status(XXX).json({ error: '...' })` 반환
- 전역 에러 핸들러 (`server/index.js`)가 동기 에러도 JSON으로 캐치
- 절대로 HTML 에러 페이지를 반환하지 않음

**바디 파싱**

```js
// 전역: JSON 50MB
app.use(express.json({ limit: '50mb' }));

// 라우트별: 바이너리 100MB (파일 업로드)
router.post('/', express.raw({ type: '*/*', limit: '100mb' }), ...);
```

### 2-2. better-sqlite3

**특징**: 완전 동기 API — `async/await` 불필요

```js
// 단일 행 조회
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// 전체 목록
const rows = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();

// 삽입 (마지막 삽입 ID)
const info = db.prepare('INSERT INTO ... VALUES (?, ?)').run(v1, v2);
console.log(info.lastInsertRowid);

// Named parameters
db.prepare('INSERT INTO t (a, b) VALUES (@a, @b)').run({ a: 1, b: 2 });

// 트랜잭션
const insert = db.prepare('INSERT INTO ...');
const tx = db.transaction((rows) => rows.forEach(r => insert.run(r)));
tx(dataArray);
```

**DB 스키마 추가 시 패턴**

```js
// db.js — CREATE TABLE 추가
db.exec(`
  CREATE TABLE IF NOT EXISTS new_table (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    field1     TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// seed 함수 (idempotent)
export function seedNewTable() {
  const count = db.prepare('SELECT COUNT(*) as c FROM new_table').get();
  if (count.c > 0) return;  // 이미 데이터 있으면 스킵
  // INSERT 초기 데이터
}
```

### 2-3. JWT + bcrypt 인증

```js
// 로그인
const hash = await bcrypt.hash(password, 10);
const token = signToken(user);           // JWT 발급
setSessionCookie(res, token);           // httpOnly 쿠키

// 미들웨어 사용
router.post('/secure', requireAuth, (req, res) => {
  const { id, role } = req.user;        // 검증된 사용자
  ...
});
```

**쿠키 설정**

- `httpOnly: true` — JS에서 접근 불가
- `sameSite: 'lax'` — CSRF 방지
- `secure`: 프로덕션 + HTTPS 환경에서만 true
- `maxAge`: 30일

### 2-4. 파일 업로드 방식

**방식 A — base64 JSON** (소용량 이미지, 부스1)

```js
// 클라이언트
const reader = new FileReader();
reader.onload = () => {
  const base64 = reader.result;   // data:image/...;base64,...
  fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_data: base64 }),
  });
};
reader.readAsDataURL(file);
```

**방식 B — binary + 쿼리스트링** (이미지/PDF 대용량, 부스2) ✅ 권장

```js
// 클라이언트
const arrayBuffer = await file.arrayBuffer();
const params = new URLSearchParams({ lab_name, poster_type });
fetch(`/api/fair-booth2?${params}`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/octet-stream' },
  body: arrayBuffer,
});

// 서버
router.post('/', express.raw({ type: '*/*', limit: '100mb' }), requireAuth, requireAdmin, (req, res) => {
  const { lab_name, poster_type } = req.query;
  const base64 = req.body.toString('base64');
  const dataUrl = `data:${poster_type};base64,${base64}`;
  db.prepare('INSERT INTO ...').run(lab_name, dataUrl, poster_type);
  res.json({ ok: true });
});
```

---

## 3. 프론트엔드 기술 상세

### 3-1. React 18 + Vite

**Vite 개발 프록시** (`vite.config.js`)

```js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
},
```

→ 개발 시 `localhost:5173/api/*` → `localhost:3000/api/*` 자동 프록시

**빌드 결과물**

```
client/dist/
  index.html          ← React SPA
  assets/             ← JS/CSS 번들
  fair/index.html     ← 박람회 페이지 (public에서 복사)
  cv/index.html       ← CV 빌더 (public에서 복사)
  reservation/        ← 예약 (public에서 복사)
```

### 3-2. Zustand

```js
import { create } from 'zustand';

export const useMyStore = create((set, get) => ({
  // 상태
  value: null,

  // 액션
  setValue: (v) => set({ value: v }),

  // 비동기 액션
  fetchData: async () => {
    const data = await api.get('/something');
    set({ value: data });
  },
}));

// 컴포넌트에서 사용
const { value, setValue } = useMyStore();
```

**스토어 목록**

| 파일 | 역할 |
|---|---|
| `useAuthStore.js` | 로그인 상태 전역 관리 |
| `useSelectionStore.js` | 이수 설계 선택 상태 + 로드맵 |

### 3-3. CSS-in-JS (인라인 스타일)

이 프로젝트는 외부 CSS 파일이나 CSS 프레임워크 없이 **인라인 스타일 객체**를 사용합니다.

```jsx
// 컴포넌트 내
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 10,
  background: '#f8f8f6',
  border: '0.5px solid #e0e0dc',
}}>

// 스타일 함수 패턴 (App.jsx)
function quickNavStyle(background, border, color) {
  return {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 10px', height: 56,
    boxSizing: 'border-box', borderRadius: 10,
    background, color, cursor: 'pointer',
    border: border === 'none' ? 'none' : `1.5px solid ${border}`,
  };
}
```

---

## 4. 독립 HTML 페이지 패턴

### 4-1. 구조 패턴

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    /* 모든 CSS 인라인 (<style> 태그 내) */
  </style>
</head>
<body>
  <!-- 화면 섹션들 -->
  <div class="screen" id="screen-main">...</div>

  <script>
    // 전역 상태 변수
    let isAdmin = false;
    let data = [];

    // 초기화
    async function init() {
      await fetchData();
      render();
    }

    // API 호출
    async function fetchData() { ... }

    // 렌더
    function render() {
      document.getElementById('container').innerHTML = `...`;
    }

    // DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
```

### 4-2. API 호출 패턴

```js
// 공개 데이터 (인증 불필요)
async function fetchData() {
  try {
    const res = await fetch('/api/endpoint');
    if (res.ok) {
      const d = await res.json();
      data = d.items || [];
    }
  } catch (_) {}  // 실패 시 빈 배열 유지
}

// 관리자 액션 (인증 필요)
async function submitItem() {
  try {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ... }),
    });
    if (!res.ok) throw new Error((await res.json()).error || '실패');
    // 성공 처리
  } catch (err) {
    errEl.textContent = err.message;
  }
}
```

### 4-3. 관리자 모드 패턴

```js
let isAdmin = false;

// 앱 초기화 시 인증 상태 확인
async function initFairData() {
  try {
    const meRes = await fetch('/api/auth/me', { credentials: 'include' });
    if (meRes.ok) {
      const { user } = await meRes.json();
      isAdmin = user?.role === 'admin';
      if (isAdmin) applyAdminMode();
    }
  } catch (_) {}
}

// 관리자 UI 활성화
function applyAdminMode() {
  document.body.classList.add('admin-mode');
  // 관리자 전용 버튼 표시
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
}
```

```css
/* CSS: 관리자 모드 시만 표시 */
.admin-only { display: none; }
body.admin-mode .admin-only { display: block; }
```

### 4-4. PDF Blob URL 패턴

Chrome에서 `data:application/pdf;base64,...`를 `<embed>`에 직접 사용하면 CSP로 차단됩니다. Blob URL을 사용해야 합니다.

```js
function renderPdf(base64Data, containerEl) {
  try {
    // data URL 형식이면 base64 부분만 추출
    const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // base64 → Uint8Array → Blob → Blob URL
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    containerEl.innerHTML = `
      <embed src="${blobUrl}" type="application/pdf" style="width:100%;height:400px">
      <a href="${blobUrl}" download="poster.pdf">⬇ PDF 다운로드</a>
    `;
  } catch (e) {
    containerEl.textContent = 'PDF 렌더 실패';
  }
}
```

---

## 5. 코딩 컨벤션

| 항목 | 규칙 |
|---|---|
| 모듈 시스템 | ESM (`import/export`) — CJS 혼용 금지 |
| 서버 비동기 | better-sqlite3 동기 API 사용, `async/await` 불필요 |
| 에러 응답 | `res.status(코드).json({ error: '메시지' })` 형식 통일 |
| 클라이언트 fetch | 항상 `credentials: 'include'` (관리자 액션) |
| 대용량 파일 | JSON body가 아닌 binary body로 전송 |
| Seed 함수 | idempotent (중복 실행 시 변경 없어야 함) |
| DB 쿼리 | Prepared statement 사용 (`db.prepare(...).run/get/all`) |
| 인라인 HTML | 서버 사이드 렌더링 없음, 클라이언트에서 `innerHTML` 사용 |
| 한글 에러 메시지 | 사용자에게 노출되는 메시지는 한국어 |

---

## 6. 의존성 목록

**서버 (`server/package.json`)**

| 패키지 | 역할 |
|---|---|
| `express` | HTTP 서버 |
| `better-sqlite3` | SQLite (동기, 네이티브 모듈) |
| `bcryptjs` | 비밀번호 해싱 |
| `jsonwebtoken` | JWT 발급·검증 |
| `cookie-parser` | 요청 쿠키 파싱 |
| `cors` | CORS 헤더 (선택적) |
| `dotenv` | 환경변수 로드 |

**클라이언트 (`client/package.json`)**

| 패키지 | 역할 |
|---|---|
| `react`, `react-dom` | UI 프레임워크 |
| `vite` | 개발서버 + 번들러 |
| `@vitejs/plugin-react` | JSX 트랜스파일 |
| `zustand` | 전역 상태 관리 |
