# 프로젝트 구조 문서 (structure.md)

> 코드 수정 전 이 문서를 먼저 확인하세요.  
> 기능별 수정 파일 가이드는 [§7](#7-기능별-수정-파일-가이드)을 참조하세요.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [디렉토리 구조](#2-디렉토리-구조)
3. [백엔드 — `server/`](#3-백엔드--server)
   - 3-1. [진입점 — `index.js`](#3-1-진입점--indexjs)
   - 3-2. [데이터베이스 — `db.js`](#3-2-데이터베이스--dbjs)
   - 3-3. [API 라우트 목록](#3-3-api-라우트-목록)
   - 3-4. [인증 미들웨어 — `middleware/auth.js`](#3-4-인증-미들웨어--middlewareauthjs)
4. [프론트엔드 — `client/src/`](#4-프론트엔드--clientsrc)
   - 4-1. [앱 진입점 — `App.jsx`](#4-1-앱-진입점--appjsx)
   - 4-2. [페이지 목록 — `pages/`](#4-2-페이지-목록--pages)
   - 4-3. [공용 컴포넌트 — `components/`](#4-3-공용-컴포넌트--components)
   - 4-4. [Zustand 스토어 — `store/`](#4-4-zustand-스토어--store)
   - 4-5. [API 클라이언트 — `api/client.js`](#4-5-api-클라이언트--apiclientjs)
   - 4-6. [정적 데이터 — `data/`](#4-6-정적-데이터--data)
5. [독립 HTML 페이지 — `client/public/`](#5-독립-html-페이지--clientpublic)
   - 5-1. [연구실 박람회 — `fair/index.html`](#5-1-연구실-박람회--fairindexhtml)
   - 5-2. [CV 빌더 — `cv/index.html`](#5-2-cv-빌더--cvindexhtml)
   - 5-3. [컴퓨터 예약 — `reservation/`](#5-3-컴퓨터-예약--reservation)
6. [데이터베이스 스키마](#6-데이터베이스-스키마)
7. [기능별 수정 파일 가이드](#7-기능별-수정-파일-가이드)
8. [환경변수 — `.env`](#8-환경변수--env)
9. [빌드 · 배포 흐름](#9-빌드--배포-흐름)

---

## 1. 프로젝트 개요

명지대학교 화학나노학전공 학생들을 위한 통합 웹 플랫폼.

| 서브 앱 | URL | 설명 |
|---|---|---|
| 이수 설계 (메인) | `/` | 진로 선택 → 로드맵 6단계 설계 |
| 연구실 박람회 | `/fair/` | 부스별 포스터·일정·프로그램 안내 |
| CV 빌더 | `/cv/` | 이력서 작성 · PDF 출력 |
| 컴퓨터 예약 | `/reservation/` | PC 예약 시스템 |

**기술 스택**

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React 18, Vite, Zustand |
| 백엔드 | Node.js, Express 4 |
| DB | SQLite (better-sqlite3, 동기 API) |
| 인증 | JWT (httpOnly 쿠키), bcrypt |
| 독립 페이지 | Vanilla JS + HTML (빌드 불필요) |

---

## 2. 디렉토리 구조

```
Chemistry-master/
├── client/
│   ├── public/                     # 빌드 시 dist/에 그대로 복사
│   │   ├── fair/
│   │   │   ├── index.html          # 연구실 박람회 (Vanilla JS, ~2000줄)
│   │   │   └── mascot*.png
│   │   ├── cv/
│   │   │   └── index.html          # CV 빌더 (Vanilla JS)
│   │   └── reservation/
│   │       └── index.html
│   ├── src/
│   │   ├── App.jsx                 # 루트 컴포넌트 + 상단 네비게이션
│   │   ├── main.jsx
│   │   ├── api/client.js           # fetch 래퍼
│   │   ├── store/
│   │   │   ├── useAuthStore.js
│   │   │   └── useSelectionStore.js
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Step0Career.jsx
│   │   │   ├── Step1Basic.jsx
│   │   │   ├── Steps2_3_4.jsx
│   │   │   ├── Step5Roadmap.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── NoticeModal.jsx
│   │   ├── components/index.jsx
│   │   └── data/
│   │       ├── careerPaths.js
│   │       ├── courses.js
│   │       ├── modules.js
│   │       ├── pathways.js
│   │       └── courseDescs.js
│   ├── vite.config.js              # /api → :3000 프록시
│   └── package.json
├── server/
│   ├── index.js                    # Express 진입점
│   ├── db.js                       # 스키마 + seed 함수
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── roadmaps.js
│       ├── courseDescs.js
│       ├── notices.js
│       ├── reservations.js
│       ├── fairPosters.js          # 부스1 대표그림 (base64 JSON)
│       ├── fairBooth2.js           # 부스2 포스터/PDF (binary)
│       ├── fairSchedule.js
│       ├── fairGradSchedule.js
│       └── fairRnd.js
├── data/chem.db                    # SQLite DB
├── deploy/
│   ├── chem-app.service
│   └── nginx.conf.example
├── package.json
├── structure.md / user-guideline.md / skill.md / claude.md
└── README.md
```

---

## 3. 백엔드 — `server/`

### 3-1. 진입점 — `index.js`

- `express.json({ limit: '50mb' })` — JSON body 파싱 (50MB 상한)
- `cookieParser()` — JWT 쿠키 읽기
- 모든 API 라우트는 `/api/*`에 마운트
- 커스텀 에러 핸들러 → 항상 `{ error: '...' }` JSON 반환
- 프로덕션 정적 서빙 → `client/dist`
- SPA 폴백 → `/api/` 아닌 GET 요청은 `dist/index.html` 반환

### 3-2. 데이터베이스 — `db.js`

- better-sqlite3 **동기 API** (async/await 불필요)
- `WAL 모드` + `foreign_keys = ON`
- DB 경로: 환경변수 `DB_PATH` or `./data/chem.db`
- Seed 함수 (서버 시작 시 자동 실행, 모두 idempotent):

| 함수 | 생성 계정/데이터 |
|---|---|
| `seedAdmin()` | `.env`의 ADMIN_ID/PW로 관리자 |
| `seedStudAdmin()` | `studadmin / chemistry` |
| `seedFairAdmin()` | `chemistry / 236250` |
| `seedFairSchedule()` | 교수 상담 기본 4개 (`INSERT OR IGNORE`) |
| `seedGradSchedule()` | 대학원생 상담 6개 (행 0개일 때만) |
| `seedRndPrograms()` | R&D 프로그램 2개 (행 0개일 때만) |

### 3-3. API 라우트 목록

| 경로 | 파일 | 주요 메서드 | 권한 |
|---|---|---|---|
| `/api/auth` | `auth.js` | POST login/register/logout, GET me | public/로그인 |
| `/api/roadmaps` | `roadmaps.js` | GET, POST, DELETE | 로그인 |
| `/api/course-descs` | `courseDescs.js` | GET, PUT /:id, DELETE /:id | 로그인/admin |
| `/api/notices` | `notices.js` | GET, POST, PATCH /:id, DELETE /:id | public/admin |
| `/api/reservations` | `reservations.js` | GET, POST, DELETE | 로그인 |
| `/api/fair-posters` | `fairPosters.js` | GET, POST /:labId, DELETE /:labId | public/admin |
| `/api/fair-booth2` | `fairBooth2.js` | GET, POST (binary), DELETE /:id, PATCH /:id | public/admin |
| `/api/fair-schedule` | `fairSchedule.js` | GET, POST, DELETE /:profName | public/admin |
| `/api/fair-grad-schedule` | `fairGradSchedule.js` | GET, POST, PATCH /:id, DELETE /:id | public/admin |
| `/api/fair-rnd` | `fairRnd.js` | GET, POST, PATCH /:id, DELETE /:id | public/admin |

> **부스2 파일 업로드 방식**  
> 이미지/PDF → `Content-Type: application/octet-stream` (binary body)  
> `express.raw({ type: '*/*', limit: '100mb' })` 로 파싱  
> 메타데이터(`lab_name`, `poster_type`)는 쿼리스트링으로 전달  
> 서버에서 `Buffer.toString('base64')` → `data:타입;base64,...` 형식으로 DB 저장

### 3-4. 인증 미들웨어 — `middleware/auth.js`

| 함수 | 역할 |
|---|---|
| `requireAuth` | 로그인 필수, 아니면 401 JSON |
| `requireAdmin` | admin role 필수, 아니면 403 JSON |
| `optionalAuth` | 로그인 선택, `req.user` null 허용 |
| `signToken` | JWT 발급 (30일) |
| `setSessionCookie` | httpOnly 쿠키 설정 |
| `clearSessionCookie` | 쿠키 삭제 |

---

## 4. 프론트엔드 — `client/src/`

### 4-1. 앱 진입점 — `App.jsx`

- **상단 2×2 빠른 접근 그리드**: 공지사항 / 연구실 박람회 / 컴퓨터 예약 / CV 작성
- 모든 버튼 동일 높이 (`height: 56`, `quickNavStyle()` 함수)
- 이수 설계 6단계 컴포넌트 라우팅 (`STEP_COMPONENTS[step]`)
- 로그인 전 → `AuthPage` 렌더
- `user.role === 'admin'` 일 때 관리자 버튼 노출

### 4-2. 페이지 목록 — `pages/`

| 파일 | 단계 | 설명 |
|---|---|---|
| `AuthPage.jsx` | — | 학번/비밀번호 로그인 + 회원가입 |
| `Step0Career.jsx` | 0 | 진로 경로 선택 (취업/대학원/유학 등) |
| `Step1Basic.jsx` | 1 | 기초·교양 과목 선택 (최대 2개) |
| `Steps2_3_4.jsx` | 2-4 | 기초모듈 → 심화과목 → 심화모듈 선택 |
| `Step5Roadmap.jsx` | 5 | 로드맵 완성·저장·불러오기 |
| `AdminPage.jsx` | — | 교과 설명 수정, 공지사항 CRUD |
| `NoticeModal.jsx` | — | 공지사항 팝업 (학생용) |

### 4-3. 공용 컴포넌트 — `components/`

- `StepBar` — 진행 단계 시각화 바
- `NavButtons` — 이전/다음 버튼

### 4-4. Zustand 스토어 — `store/`

**`useAuthStore.js`**

| 상태/액션 | 설명 |
|---|---|
| `user`, `loading` | 현재 사용자, 로딩 상태 |
| `init()` | 앱 마운트 시 `/api/auth/me` 호출 |
| `logout()` | 쿠키 삭제 + 상태 초기화 |

**`useSelectionStore.js`**

| 상태/액션 | 설명 |
|---|---|
| `step` | 현재 단계 (0-5) |
| `careerPathId` | 선택한 진로 경로 ID |
| `basicIds`, `upperIds` | 선택한 기초/심화 과목 목록 |
| `savedRoadmaps` | 서버에서 불러온 저장 로드맵 |
| `fetchRoadmaps()` | 서버 동기화 |
| `saveRoadmap(label)` | 현재 선택 저장 |
| `loadRoadmap(id)` | 저장본 불러오기 |
| `resetAll()` | 전체 초기화 |

### 4-5. API 클라이언트 — `api/client.js`

`/api/*` 경로에 `credentials: 'include'`를 자동으로 첨부하는 fetch 래퍼.

### 4-6. 정적 데이터 — `data/`

| 파일 | 내용 |
|---|---|
| `careerPaths.js` | 진로 경로 배열 (id, label, color, modules) |
| `courses.js` | 전체 교과 목록 (id, name, credit, kind, module 등) |
| `modules.js` | 모듈 메타데이터 (color, bg, icon) |
| `pathways.js` | 트랙·마이크로전공 정의 + `computePathway()` |
| `courseDescs.js` | 교과 설명 기본값 + `loadAdminOverrides()` |

---

## 5. 독립 HTML 페이지 — `client/public/`

`client/public/` 파일은 `npm run build` 시 `client/dist/`에 그대로 복사되며 Express가 정적으로 서빙합니다. React 빌드와 무관하게 동작하는 Vanilla JS 단일 파일입니다.

> **주의**: 이 파일들을 수정한 후에는 반드시 `npm run build` 재실행 필요.

### 5-1. 연구실 박람회 — `fair/index.html`

단일 HTML 파일(~2000줄). 주요 구조:

**화면 섹션**

| id | 내용 |
|---|---|
| `#screen-intro` | 소개 화면 + 관리자 로그인 버튼 |
| `#screen-booth1` | 부스 1: 연구실별 대표그림 |
| `#screen-booth2` | 부스 2: 연구 포스터/PDF 갤러리 |
| `#screen-booth3` | 부스 3: 교수 상담 + 대학원 상담 + R&D 프로그램 |

**상단 관리자 바 (`#fair-admin-bar`)**
- 항상 표시 (비관리자: 로그인 버튼, 관리자: 로그아웃 버튼)
- `applyAdminMode()` / `fairAdminLogout()` 로 상태 전환

**주요 전역 변수**

```js
isAdmin           // 관리자 여부
fairPosters       // { labId: { poster_data, poster_type } }
fairSchedule      // 교수 상담 일정 배열
booth2Posters     // 부스2 포스터 배열
b2SelectedFile    // 업로드 대기 중인 File 객체
gradSchedule      // 대학원생 상담 블록 배열
rndPrograms       // R&D 프로그램 배열
```

**파일 업로드 흐름 (부스2)**

```
onB2FileChange() → b2SelectedFile = File 객체 저장
submitB2Poster() → file.arrayBuffer() → fetch(binary) → /api/fair-booth2?lab_name=...
setupPdfEmbeds() → base64 → Blob → URL.createObjectURL() → <embed> 렌더
```

**관리자 계정**: `chemistry / 236250`

### 5-2. CV 빌더 — `cv/index.html`

- 영/한 전환 가능한 학술 이력서 작성 도구
- `window.print()` 로 PDF 출력
- `← 메인 앱으로` 링크

### 5-3. 컴퓨터 예약 — `reservation/`

PC 예약 시스템 (9월 오픈 예정).

---

## 6. 데이터베이스 스키마

| 테이블 | 용도 |
|---|---|
| `users` | 사용자 계정 (학번, 이름, 비번해시, 역할) |
| `roadmaps` | 학생별 저장 로드맵 (JSON payload) |
| `reservations` | PC 예약 (날짜, 시간, 이름, UNIQUE 제약) |
| `course_descs` | 교과 설명 관리자 수정본 (course_id PK) |
| `notices` | 공지사항 (제목, 내용, 링크, 포스터 이미지) |
| `fair_posters` | 부스1 대표그림 (lab_id UNIQUE, base64) |
| `fair_booth2_posters` | 부스2 포스터/PDF (lab_name, base64 data URL) |
| `fair_schedule` | 교수 상담 일정 (prof_name PK) |
| `fair_grad_schedule` | 대학원생 상담 블록 (time_slot, lab_labels JSON) |
| `fair_rnd_programs` | R&D 프로그램 (badge, title, features JSON) |

---

## 7. 기능별 수정 파일 가이드

| 수정 목표 | 수정 파일 |
|---|---|
| 상단 네비게이션 버튼 | `client/src/App.jsx` |
| 이수 설계 단계 UI | `client/src/pages/Step*.jsx` |
| 진로 경로 · 교과 데이터 | `client/src/data/*.js` |
| 공지사항 관리 | `AdminPage.jsx` + `server/routes/notices.js` |
| 박람회 UI/로직 전반 | `client/public/fair/index.html` |
| 부스2 파일 업로드 서버 | `server/routes/fairBooth2.js` |
| 교수 상담 관리 | `fair/index.html` + `server/routes/fairSchedule.js` |
| 대학원 상담 관리 | `fair/index.html` + `server/routes/fairGradSchedule.js` |
| R&D 프로그램 관리 | `fair/index.html` + `server/routes/fairRnd.js` |
| CV 빌더 수정 | `client/public/cv/index.html` |
| DB 테이블 추가 | `server/db.js` (CREATE TABLE + seed 함수) |
| 새 API 라우트 추가 | `server/routes/새파일.js` + `server/index.js`에 마운트 |

---

## 8. 환경변수 — `.env`

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=랜덤긴문자열
ADMIN_ID=관리자학번
ADMIN_PW=관리자비밀번호
ADMIN_NAME=관리자이름
COOKIE_SECURE=0          # HTTPS 없으면 0
DB_PATH=/var/lib/chem-app/chem.db  # 선택
```

---

## 9. 빌드 · 배포 흐름

```bash
# 개발
npm run dev:server   # Express (포트 3000)
npm run dev:client   # Vite (포트 5173)

# 프로덕션 빌드
npm run build        # client/dist 생성

# 서버 시작
npm start

# 업데이트 배포
git pull && npm run install:all && npm run build && sudo systemctl restart chem-app
```
