# Claude 작업 가이드 (claude.md)

> Claude가 이 프로젝트에서 작업할 때 따라야 할 규칙과 컨텍스트입니다.  
> 새 세션 시작 시 이 파일과 `structure.md`를 먼저 읽으세요.

---

## 목차

1. [프로젝트 컨텍스트 요약](#1-프로젝트-컨텍스트-요약)
2. [작업 전 필수 확인 사항](#2-작업-전-필수-확인-사항)
3. [파일 수정 규칙](#3-파일-수정-규칙)
   - 3-1. [서버 라우트 추가/수정](#3-1-서버-라우트-추가수정)
   - 3-2. [DB 스키마 수정](#3-2-db-스키마-수정)
   - 3-3. [fair/index.html 수정](#3-3-fairindexhtml-수정)
   - 3-4. [React 컴포넌트 수정](#3-4-react-컴포넌트-수정)
4. [절대 하지 말아야 할 것들](#4-절대-하지-말아야-할-것들)
5. [자주 발생하는 문제 패턴과 해결책](#5-자주-발생하는-문제-패턴과-해결책)
6. [빌드 및 배포 체크리스트](#6-빌드-및-배포-체크리스트)
7. [계정·시드 데이터 레퍼런스](#7-계정시드-데이터-레퍼런스)
8. [API 엔드포인트 퀵 레퍼런스](#8-api-엔드포인트-퀵-레퍼런스)

---

## 1. 프로젝트 컨텍스트 요약

명지대학교 화학나노학전공 통합 플랫폼. 두 가지 아키텍처가 공존합니다.

**A. React SPA** (`client/src/`) — 이수 설계 메인 앱

- Vite 빌드 필요 (`npm run build`)
- Zustand로 전역 상태 관리
- `/api/*` 호출은 `api/client.js` 래퍼 사용

**B. 독립 Vanilla JS HTML** (`client/public/fair/`, `client/public/cv/`)

- 빌드 불필요하지만 `npm run build` 실행 시 `dist/`로 복사됨
- 변경 후 반드시 `npm run build` 실행해야 서버에 반영
- 직접 `/api/*` fetch 호출 (credentials: include)

---

## 2. 작업 전 필수 확인 사항

새 기능 추가 또는 버그 수정 전 항상 확인:

1. **어느 파일을 수정해야 하는가?** → `structure.md` §7 참조
2. **DB 테이블이 이미 있는가?** → `server/db.js` 확인
3. **API 라우트가 이미 있는가?** → `server/routes/` 확인
4. **서버가 실행 중인가?** → 서버 수정 후 반드시 재시작
5. **빌드가 필요한가?** → `client/public/` 수정 시 `npm run build` 필요

---

## 3. 파일 수정 규칙

### 3-1. 서버 라우트 추가/수정

**새 라우트 파일 생성 체크리스트**

```js
// 1. server/routes/newFeature.js 생성
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// requireAdmin 함수는 각 라우터 파일에서 직접 정의
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  next();
}

export default router;
```

```js
// 2. server/index.js에 마운트 추가
import newFeatureRoutes from './routes/newFeature.js';
// ...
app.use('/api/new-feature', newFeatureRoutes);
```

```js
// 3. 필요시 server/db.js에 테이블 추가
// 4. 필요시 server/index.js에서 seed 함수 import + 호출
```

**파일 업로드 라우트** — binary 방식 사용

```js
// 이미지/PDF 업로드: express.raw + 쿼리스트링 메타데이터
router.post('/', express.raw({ type: '*/*', limit: '100mb' }), requireAuth, requireAdmin, (req, res) => {
  const { param1, param2 } = req.query;
  const base64 = req.body.toString('base64');
  const dataUrl = `data:${param2};base64,${base64}`;
  // ...
});
```

> ❌ 절대 base64를 JSON body로 받지 마세요 — 프록시/body-parser 용량 문제 발생

### 3-2. DB 스키마 수정

- `server/db.js`의 `db.exec(...)` 블록에 `CREATE TABLE IF NOT EXISTS` 추가
- 기존 테이블 컬럼 추가 시: `ALTER TABLE ... ADD COLUMN ...` 또는 서버 재시작 시 적용 가능하도록 설계
- Seed 함수는 항상 **idempotent** 하게 작성:
  - `INSERT OR IGNORE` 사용 또는
  - `SELECT COUNT(*) > 0` 체크 후 스킵

### 3-3. `fair/index.html` 수정

이 파일은 ~2000줄의 단일 파일입니다. 수정 시 주의사항:

- **전역 변수** 추가 시: 파일 상단 `/* ── STATE ── */` 섹션에 추가
- **fetch 함수** 추가 시: `initFairData()` 내에서 호출 등록
- **렌더 함수** 추가 시: 관련 화면의 렌더 함수에서 호출
- **모달** 추가 시: `<body>` 끝 부분에 HTML 삽입, overlay 클래스로 표시/숨김
- **관리자 전용 UI**: `isAdmin` 변수 체크 후 `style.display` 토글

```js
// 모달 패턴
function openMyModal() {
  document.getElementById('my-overlay').classList.add('show');
}
function closeMyModal() {
  document.getElementById('my-overlay').classList.remove('show');
}
```

```css
/* 모달 CSS 패턴 */
.overlay { display:none; position:fixed; inset:0; ... }
.overlay.show { display:flex; }
```

**수정 후 필수**: `npm run build` 실행

### 3-4. React 컴포넌트 수정

- 인라인 스타일 객체 사용 (별도 CSS 파일 금지)
- Zustand 스토어를 통한 상태 관리 (로컬 useState는 UI 전용)
- API 호출은 `api/client.js` 래퍼 사용

---

## 4. 절대 하지 말아야 할 것들

| 금지 사항 | 이유 | 대안 |
|---|---|---|
| 대용량 파일을 base64 JSON으로 업로드 | body-parser/프록시 HTML 에러 반환 | binary body + query string |
| `<embed src="data:application/pdf;base64,...">` | Chrome CSP 차단 | Blob URL 사용 |
| DB 테이블에 없는 컬럼 INSERT | SQLite 에러 | db.js에 컬럼 추가 먼저 |
| `express.json` 없이 POST body 파싱 | `req.body` undefined | 미들웨어 순서 확인 |
| `prof_name` 필수 검증 유지 | UI에서 제거된 필드 | 선택 필드로 처리 |
| 서버 재시작 없이 서버 코드 변경 | 변경 미반영 | 항상 재시작 |
| `npm run build` 없이 public/ 파일 배포 | dist/ 미반영 | 항상 빌드 |
| `COOKIE_SECURE=1` + HTTP 조합 | 쿠키 전송 안 됨 | HTTP 시 `COOKIE_SECURE=0` |

---

## 5. 자주 발생하는 문제 패턴과 해결책

### "Unexpected token '<', '<!DOCTYPE'... is not valid JSON"

**원인**: 서버가 JSON 대신 HTML을 반환함 (body-parser 초과, 프록시 에러 등)

**해결**:
1. 파일 업로드라면 → binary 방식으로 전환 (`express.raw`, `file.arrayBuffer()`)
2. body-parser 설정 확인 → `express.json({ limit: '50mb' })`
3. 서버 재시작

### PDF가 브라우저에서 표시 안 됨

**원인**: `<embed src="data:application/pdf;base64,...">` Chrome CSP 차단

**해결**: Blob URL 변환 사용

```js
const blob = new Blob([uint8array], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
embed.src = url;
```

### 로그인 후 새로고침 시 로그아웃

**원인**: `COOKIE_SECURE=1`인데 HTTPS 미사용

**해결**: `.env`에서 `COOKIE_SECURE=0`으로 변경 후 서버 재시작

### 박람회 관리자 모드가 다른 컴퓨터에서 작동 안 함

**원인**: 소개 화면에만 로그인 버튼이 있었음 (현재 수정됨)

**현재 상태**: 상단 바(`#fair-admin-bar`)가 항상 표시되어 어느 화면에서든 로그인 가능

### 연구실 드롭다운이 비어있음 (부스2)

**원인**: `fairSchedule` 데이터가 로드되기 전 드롭다운 렌더

**해결**: `initFairData()` → `fetchBooth2()` 순서 확인, `populateB2LabDropdown()` 호출 확인

### `better-sqlite3` 설치 실패

**원인**: 네이티브 모듈 빌드 도구 없음

**해결**: `sudo apt install build-essential python3` 후 `npm --prefix server install`

---

## 6. 빌드 및 배포 체크리스트

### 개발 환경 시작

```bash
# 터미널 1
npm run dev:server   # Express 포트 3000

# 터미널 2
npm run dev:client   # Vite 포트 5173
```

### 프로덕션 배포

```bash
# 1. 의존성 설치
npm run install:all

# 2. 클라이언트 빌드 (public/ 파일 포함)
npm run build

# 3. 서버 시작
npm start
# 또는 systemd: sudo systemctl restart chem-app
```

### 수정 후 배포 체크

| 수정 내용 | 빌드 필요 | 서버 재시작 필요 |
|---|---|---|
| `client/src/` 변경 | ✅ 필요 | ❌ |
| `client/public/` 변경 | ✅ 필요 | ❌ |
| `server/` 변경 | ❌ | ✅ 필요 |
| `.env` 변경 | ❌ | ✅ 필요 |
| `server/db.js` 변경 | ❌ | ✅ 필요 |

---

## 7. 계정·시드 데이터 레퍼런스

| 계정 | student_id | password | role | seed 함수 |
|---|---|---|---|---|
| 메인 관리자 | `.env ADMIN_ID` | `ADMIN_PW` | admin | `seedAdmin()` |
| 학생 관리자 | `studadmin` | `chemistry` | admin | `seedStudAdmin()` |
| 박람회 관리자 | `chemistry` | `236250` | admin | `seedFairAdmin()` |

**seed 데이터**

| 데이터 | 함수 | 조건 |
|---|---|---|
| 교수 상담 일정 4개 | `seedFairSchedule()` | `INSERT OR IGNORE` |
| 대학원생 상담 6개 | `seedGradSchedule()` | COUNT = 0 일 때만 |
| R&D 프로그램 2개 | `seedRndPrograms()` | COUNT = 0 일 때만 |

---

## 8. API 엔드포인트 퀵 레퍼런스

```
GET  /api/auth/me                    — 현재 로그인 사용자
POST /api/auth/login                 — 로그인 { student_id, password }
POST /api/auth/logout                — 로그아웃

GET  /api/notices                    — 공지사항 목록
POST /api/notices                    — 공지사항 추가 [admin]

GET  /api/fair-posters               — 부스1 대표그림 목록
POST /api/fair-posters/:labId        — 대표그림 업로드 [admin]

GET  /api/fair-booth2                — 부스2 포스터 목록
POST /api/fair-booth2?lab_name=&poster_type=  — binary 업로드 [admin]
DELETE /api/fair-booth2/:id          — 포스터 삭제 [admin]

GET  /api/fair-schedule              — 교수 상담 일정
POST /api/fair-schedule              — 교수 추가 [admin]
DELETE /api/fair-schedule/:profName  — 교수 삭제 [admin]

GET  /api/fair-grad-schedule         — 대학원생 상담 목록
POST /api/fair-grad-schedule         — 블록 추가 [admin]
DELETE /api/fair-grad-schedule/:id   — 블록 삭제 [admin]

GET  /api/fair-rnd                   — R&D 프로그램 목록
POST /api/fair-rnd                   — 프로그램 추가 [admin]
DELETE /api/fair-rnd/:id             — 프로그램 삭제 [admin]
PATCH /api/fair-rnd/:id              — 프로그램 수정 [admin]

GET  /api/roadmaps                   — 본인 로드맵 목록
POST /api/roadmaps                   — 로드맵 저장
DELETE /api/roadmaps/:id             — 로드맵 삭제

GET  /api/course-descs               — 교과 설명 수정본 전체
PUT  /api/course-descs/:courseId     — 교과 설명 저장 [admin]
DELETE /api/course-descs/:courseId   — 교과 설명 초기화 [admin]
```
