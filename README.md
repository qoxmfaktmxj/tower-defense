# 타워 디펜스

한국어 UI 기준으로 만든 브라우저 타워 디펜스 모노레포입니다.  
현재 기준으로는 `프론트라인` 단일 전장 테마에 집중하고 있고, 3개 맵과 20웨이브, 타워 3종, 5단 업그레이드 구조를 제공하는 방향으로 정리되어 있습니다.

## 현재 구현 범위

- 웹 클라이언트: React + Vite
- 전투 런타임: Phaser
- API: NestJS
- DB 계층: Prisma + PostgreSQL 준비
- 게임 구성:
  - 맵 3종
  - 웨이브 20개
  - 타워 3종
  - 업그레이드 5단계
  - 레벨 5 특수 효과
  - 한국어 전술 UI
- 웹 기능:
  - 로그인
  - 로비
  - 랭킹
  - 프로필
  - 게임 화면

공지와 상점은 현재 제품 범위에서 제외되어 라우트와 UI에서 제거되어 있습니다.

## 구조

- `apps/web`
  - React 웹 앱
  - 라우팅, 로비, 랭킹, 게임 UI 담당
- `apps/api`
  - NestJS API
  - 인증, 랭킹, 사용자 관련 엔드포인트 담당
- `packages/game`
  - Phaser 게임 런타임
  - 맵, 웨이브, 타워, 적, 씬, 브리지 담당
- `packages/shared`
  - 웹/API 공용 타입과 목업 데이터

## 실행 방법

### 요구 사항

- Node.js 20 이상
- pnpm
- Docker Desktop 또는 로컬 PostgreSQL

### 설치

```bash
corepack pnpm install
```

### 개발 서버

```bash
corepack pnpm dev:web
corepack pnpm dev:api
```

웹은 기본적으로 `http://localhost:5173`, API는 `http://localhost:4000`을 사용합니다.

### 환경 변수

`.env.example`를 기준으로 환경을 맞춥니다.

주요 값:

- `VITE_API_BASE_URL`
- `DATABASE_URL`
- `CORS_ORIGIN`

### DB 실행 예시

```bash
docker compose up -d
corepack pnpm --filter @tower-defense/api prisma:generate
corepack pnpm --filter @tower-defense/api prisma:seed
```

## 빌드와 검증

```bash
corepack pnpm typecheck
corepack pnpm build
```

실제 기능 수정 후에는 브라우저에서 아래 흐름을 최소 1회 확인하는 것을 권장합니다.

- 로그인
- 로비 진입
- `/game` 진입
- 맵 선택
- 출격 시작
- 타워 설치 또는 업그레이드

## 어떻게 구현했는가

구조는 `React 셸 + Phaser 전투 런타임 + API 계층`으로 분리했습니다.

- 웹은 UI와 라우팅, 사용자 액션만 담당합니다.
- 게임 전투 상태는 Phaser 안에서 관리합니다.
- React가 Phaser 내부 객체를 직접 만지지 않도록 `bridge`를 두고 이벤트로만 연결했습니다.
- 맵, 웨이브, 타워 밸런스는 코드 하드코딩 대신 `packages/game/src/data` 아래 데이터 정의로 관리합니다.
- DB 연결은 웹에서 직접 하지 않고 반드시 API를 통해서만 접근하도록 구성했습니다.

이 구조 덕분에 UI 수정, 밸런스 수정, 서버 작업을 서로 비교적 독립적으로 진행할 수 있습니다.

## 문서

- 초기 계획서: [docs/PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)
- 개발 가이드라인: [CONTRIBUTING.md](./CONTRIBUTING.md)

## 현재 방향

당분간은 `모드 확장`보다 `프론트라인 단일 테마의 완성도 개선`이 우선입니다.

추천 작업 순서:

1. 게임 밸런스 미세 조정
2. 맵별 웨이브 개성 추가
3. 레벨 5 특수 효과 연출 강화
4. 랭킹/인증 실DB 안정화
5. GamePage 번들 분리
