# 화학나노학전공 이수 설계 (Chem-Nano Pathway)

명지대학교 화학나노학전공 학생들이 진로 → 기초/심화 모듈 → 트랙/마이크로전공을 단계별로 선택하면서 자신만의 8학기 이수 로드맵을 설계하는 웹앱입니다.

- **Frontend**: React 18 + Vite + Zustand
- **Backend**: Node.js (Express) + SQLite (better-sqlite3)
- **Auth**: 학번/비밀번호 로그인 (JWT httpOnly 쿠키, bcrypt 해시)
- **데이터**: 학생별 로드맵 저장(개수 무제한), 관리자가 수정한 교과 설명은 전역 공유

---

## 디렉토리 구조

```
chem-app/
├── client/                  # React + Vite 프론트엔드
│   ├── src/
│   │   ├── api/client.js    # 백엔드 fetch 래퍼
│   │   ├── store/           # zustand (auth, selection)
│   │   ├── pages/           # AuthPage, Step0~5, AdminPage
│   │   ├── components/
│   │   └── data/            # 교과/모듈/진로 정적 데이터
│   ├── index.html
│   ├── vite.config.js       # /api → :3000 프록시 포함
│   └── package.json
├── server/                  # Express + SQLite 백엔드
│   ├── routes/              # auth, roadmaps, courseDescs
│   ├── middleware/auth.js   # JWT 검증, requireAuth/Admin
│   ├── db.js                # 스키마 + 관리자 시드
│   ├── index.js             # 엔트리 (정적 client/dist도 서빙)
│   └── package.json
├── deploy/
│   ├── chem-app.service     # systemd 유닛 템플릿
│   └── nginx.conf.example   # (선택) nginx 리버스 프록시 예시
├── .env.example             # 환경변수 템플릿
├── .gitignore
├── package.json             # 루트 편의 스크립트
└── README.md
```

---

## 로컬 개발

### 1) 의존성 설치
```bash
git clone https://github.com/hanleem/chem_app.git
cd chem_app
npm run install:all
```

### 2) 환경변수 준비
```bash
cp .env.example .env
# JWT_SECRET 을 랜덤한 긴 문자열로 바꿉니다.
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# ADMIN_ID / ADMIN_PW 도 본인 값으로 변경.
# 로컬 http로 테스트할 때는 COOKIE_SECURE=0, NODE_ENV=development 추천.
```

### 3) 두 개 터미널로 실행
```bash
# 터미널 A — 백엔드 (포트 3000)
npm run dev:server

# 터미널 B — 프론트 (포트 5173, /api는 3000으로 프록시됨)
npm run dev:client
```
브라우저에서 `http://localhost:5173` 접속 → 회원가입 → 사용.

`.env`의 `ADMIN_ID`로 로그인하면 "관리자" 버튼이 보입니다.

---

## 학교 리눅스 서버 배포

### 사전 준비
- Node.js 18 이상 (`node -v` 확인). 없으면 NodeSource 또는 nvm으로 설치.
- (선택) Nginx — 80/443 리버스 프록시할 거면 설치.
- 시스템 사용자 `chem` 생성 권장 (혹은 본인 계정 사용).

### 1) 코드 받기
```bash
sudo mkdir -p /srv && sudo chown $USER:$USER /srv
cd /srv
git clone https://github.com/hanleem/chem_app.git chem-app
cd chem-app
```

### 2) 의존성 설치 + 클라이언트 빌드
```bash
npm run install:all
npm run build           # client/dist 생성
```
> `better-sqlite3`는 네이티브 모듈입니다. 설치 시 `python3`, `make`, `g++`이 필요할 수 있어요.
> Debian/Ubuntu: `sudo apt install -y build-essential python3`

### 3) 환경변수 설정
```bash
cp .env.example .env
nano .env
```
필수로 채울 항목:
- `JWT_SECRET` (절대 공개 X, 랜덤 긴 문자열)
- `ADMIN_ID`, `ADMIN_PW`, `ADMIN_NAME`
- `PORT` (기본 3000)
- `NODE_ENV=production`
- HTTPS를 안 쓰면 `COOKIE_SECURE=0` (HTTP로 쿠키가 막혀서 로그인이 안 풀리는 문제 방지)
- `DB_PATH=/var/lib/chem-app/chem.db` (선택; 기본은 `server/data/chem.db`)

DB 디렉토리 권한:
```bash
sudo mkdir -p /var/lib/chem-app
sudo chown chem:chem /var/lib/chem-app   # service User와 일치
```

### 4) 한 번 수동 실행해서 동작 확인
```bash
npm start
# [server] listening on http://localhost:3000  → ctrl+C
```
브라우저로 `http://서버IP:3000` 들어가서 가입/로그인 테스트.

### 5) systemd 등록
```bash
sudo cp deploy/chem-app.service /etc/systemd/system/chem-app.service
# 파일 내 User, WorkingDirectory, EnvironmentFile, ExecStart 경로를 본인 환경에 맞게 수정
sudo systemctl daemon-reload
sudo systemctl enable --now chem-app
sudo systemctl status chem-app
journalctl -u chem-app -f      # 실시간 로그
```

### 6) (선택) Nginx 리버스 프록시 + HTTPS
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/chem-app
sudo nano /etc/nginx/sites-available/chem-app   # server_name 수정
sudo ln -s /etc/nginx/sites-available/chem-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# Let's Encrypt:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d chem.example.ac.kr
```
HTTPS가 붙으면 `.env`에서 `COOKIE_SECURE=1`로 두는 게 안전합니다.

---

## 업데이트(재배포)

```bash
cd /srv/chem-app
git pull
npm run install:all
npm run build
sudo systemctl restart chem-app
```

---

## 데이터 백업

SQLite 파일 1개만 백업하면 끝입니다.

```bash
# 안전 백업 (서비스 돌면서도 OK)
sqlite3 /var/lib/chem-app/chem.db ".backup '/backup/chem-$(date +%F).db'"
```

---

## 관리자 기능

`.env`의 `ADMIN_ID`로 로그인하면 헤더에 "관리자" 버튼이 보입니다.
- 교과 설명(키워드/개요/연계) 추가·수정·초기화 → 모든 학생에게 즉시 반영(다음 로드시)
- "JSON 내보내기" 버튼으로 현재 통합본을 클립보드에 복사 가능

추가 관리자가 필요하면 SQLite로 직접:
```bash
sqlite3 /var/lib/chem-app/chem.db "UPDATE users SET role='admin' WHERE student_id='60201234';"
```

---

## API 요약

| Method | Path | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/auth/register` | 회원가입(학번+이름+비번) | public |
| POST | `/api/auth/login` | 로그인 | public |
| POST | `/api/auth/logout` | 로그아웃 | public |
| GET  | `/api/auth/me` | 현재 사용자 | 로그인 |
| GET  | `/api/roadmaps` | 본인 로드맵 목록 | 로그인 |
| POST | `/api/roadmaps` | 로드맵 저장 | 로그인 |
| DELETE | `/api/roadmaps/:id` | 로드맵 삭제 | 로그인(본인 것) |
| GET  | `/api/course-descs` | 관리자 수정본 전체 조회 | 로그인 |
| PUT  | `/api/course-descs/:courseId` | 교과 설명 저장/수정 | admin |
| DELETE | `/api/course-descs/:courseId` | 교과 설명 초기화 | admin |

---

## 트러블슈팅

- **로그인 직후 새로고침하면 로그아웃됨** → `COOKIE_SECURE=1`인데 HTTPS가 아닐 때 발생. `.env`에서 `COOKIE_SECURE=0`으로.
- **better-sqlite3 설치 실패** → `sudo apt install build-essential python3` 후 `npm --prefix server install` 다시.
- **포트 3000 충돌** → `.env`에서 `PORT=3001` 등으로 변경. systemd 재시작.
- **client/dist not found 경고** → 서버 시작 전 `npm run build` 실행 필요.
