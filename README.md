# 타워 디펜스

한국어 UI 기준으로 만든 브라우저 타워 디펜스 모노레포입니다.  
웹 셸은 React/Vite, 전투 런타임은 Phaser, API는 NestJS, DB 계층은 Prisma/PostgreSQL 기준으로 구성되어 있습니다.

현재 개발 방향은 `모드 확장`보다 `단일 프론트라인 테마 완성도 개선`에 집중합니다.

## 현재 범위

- 맵 3개
  - `han-river-front`
  - `metro-grid`
  - `red-canyon`
- 웨이브 50개
- 타워 3종
  - 기관 포대
  - 중화기 포대
  - 빙결 포대
- 업그레이드 5단계
- 5웨이브마다 보스 등장
- 한국어 로그인, 로비, 랭킹, 프로필, 게임 화면
- Phaser 전투 결과 제출 및 랭킹 반영 흐름

제외 범위:

- 공지
- 상점
- 결제
- 다중 모드 테마

## 기술 스택

- `apps/web`: React + Vite + React Router + TanStack Query
- `apps/api`: NestJS + Prisma
- `packages/game`: Phaser 전투 런타임
- `packages/shared`: 웹/API 공용 타입

## 폴더 구조

```text
tower-defense/
├─ apps/
│  ├─ web/           # 웹 UI, 라우팅, 화면 컴포넌트
│  └─ api/           # 인증, 랭킹, 세션, Prisma
├─ packages/
│  ├─ game/          # Phaser 씬, 전투 로직, 밸런스 데이터
│  └─ shared/        # 공용 타입
├─ docs/             # 계획서, 실행 계획서
└─ tests/            # 게임 데이터/밸런스 테스트
```

## 실행 방법

### 요구 사항

- Node.js 20 이상
- `corepack` 사용 가능 환경
- PostgreSQL 또는 Docker Desktop

### 설치

```bash
corepack pnpm install
```

### 개발 서버 실행

```bash
corepack pnpm dev:web
corepack pnpm dev:api
```

기본 주소:

- 웹: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000](http://localhost:4000)

### 환경 변수

`.env.example` 기준으로 맞춥니다.

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

## 개발 원칙

이 프로젝트는 아래 원칙을 기준으로 개발합니다.

1. React와 Phaser를 직접 섞지 않습니다.
2. React는 화면과 사용자 입력만 담당합니다.
3. Phaser는 전투 상태와 전장 렌더링을 담당합니다.
4. React ↔ Phaser 연결은 `bridge` 이벤트만 사용합니다.
5. 밸런스 값은 컴포넌트에 하드코딩하지 않고 `packages/game/src/data`에서 관리합니다.
6. DB는 웹에서 직접 접근하지 않고 반드시 API를 통해서만 접근합니다.
7. 한국어 UI가 기본이므로 문구는 짧고 명확하게 유지합니다.

## 어디를 수정해야 하는가

### 1. 웹 화면 수정

주요 위치:

- [apps/web/src/pages/game/GamePage.tsx](./apps/web/src/pages/game/GamePage.tsx)
- [apps/web/src/styles/global.css](./apps/web/src/styles/global.css)
- [apps/web/src/components/layout/Sidebar.tsx](./apps/web/src/components/layout/Sidebar.tsx)
- [apps/web/src/components/layout/Header.tsx](./apps/web/src/components/layout/Header.tsx)

이 레이어에서 하는 일:

- 레이아웃
- 버튼/패널/UI 문구
- 전체화면 버튼
- 게임 페이지 오버레이 조작
- 로그인/로비/랭킹/프로필 화면

### 2. 전투 로직 수정

주요 위치:

- [packages/game/src/scenes/GameScene.ts](./packages/game/src/scenes/GameScene.ts)
- [packages/game/src/scenes/UiScene.ts](./packages/game/src/scenes/UiScene.ts)
- [packages/game/src/entities/Tower.ts](./packages/game/src/entities/Tower.ts)
- [packages/game/src/entities/Projectile.ts](./packages/game/src/entities/Projectile.ts)
- [packages/game/src/managers/TowerManager.ts](./packages/game/src/managers/TowerManager.ts)
- [packages/game/src/managers/ProjectileManager.ts](./packages/game/src/managers/ProjectileManager.ts)

이 레이어에서 하는 일:

- 적 이동
- 타워 공격
- 충돌/폭발/빙결 처리
- 선택 상태
- 웨이브 진행
- 게임 종료 조건

### 3. 데이터 수정

주요 위치:

- [packages/game/src/data/stages/stageDefinitions.ts](./packages/game/src/data/stages/stageDefinitions.ts)
- [packages/game/src/data/waves/waveDefinitions.ts](./packages/game/src/data/waves/waveDefinitions.ts)
- [packages/game/src/data/towers/towerDefinitions.ts](./packages/game/src/data/towers/towerDefinitions.ts)
- [packages/game/src/data/gameModes.ts](./packages/game/src/data/gameModes.ts)

이 레이어에서 하는 일:

- 맵 경로
- 배치 슬롯
- 맵별 분위기
- 웨이브 적 구성
- 타워 데미지/사거리/공속/업그레이드 비용
- 에셋 경로와 색상 테마

### 4. 서버/API 수정

주요 위치:

- [apps/api/src/modules/auth](./apps/api/src/modules/auth)
- [apps/api/src/modules/rankings](./apps/api/src/modules/rankings)
- [apps/api/src/prisma/prisma.service.ts](./apps/api/src/prisma/prisma.service.ts)
- [apps/api/prisma/schema.prisma](./apps/api/prisma/schema.prisma)

이 레이어에서 하는 일:

- 로그인
- 세션
- 랭킹 저장/검증
- DB 연결

## 작업 순서

새 기능을 넣을 때는 아래 순서를 권장합니다.

1. 데이터 구조를 먼저 정합니다.
2. Phaser 쪽 전투 동작을 붙입니다.
3. React UI와 bridge 연결을 맞춥니다.
4. API가 필요하면 마지막에 붙입니다.
5. 테스트와 빌드를 돌립니다.

예시:

- 새 맵 추가
  1. `stageDefinitions.ts`에 맵 정의 추가
  2. `waveDefinitions.ts`에 웨이브 패턴 추가
  3. 필요하면 `gameModes.ts` 또는 stage visuals 조정
  4. `/game` 화면에서 맵 선택 노출 확인

- 새 타워 밸런스 조정
  1. `towerDefinitions.ts` 수정
  2. `Tower.ts`, `Projectile.ts` 영향 확인
  3. 테스트 갱신
  4. 실제 브라우저에서 체감 확인

## UI/아트 작업 규칙

현재 UI는 파스텔 톤 기준입니다.

- 기본 팔레트:
  - `#d7fdec`
  - `#a9fbd7`
  - `#b2e4db`
  - `#b0c6ce`
  - `#938ba1`
- 텍스트는 밝은 배경에서도 읽히도록 더 어두운 중성색을 사용합니다.
- 버튼 색은 페이지 안에서 톤을 최대한 통일합니다.
- 게임 조작 버튼은 전장 안 오버레이 우선, 화면 바깥 제어는 최소화합니다.
- Phaser 씬은 웹 UI와 완전히 다른 테마로 따로 놀지 않게 맞춥니다.

## 한국어 문구 규칙

- 한 줄에 너무 긴 설명을 넣지 않습니다.
- 의미 없는 영어 혼용을 피합니다.
- `포대`, `웨이브`, `출격`, `전장`, `지휘관` 같은 용어를 일관되게 씁니다.
- 코드 내부 상수명은 영어여도, 사용자 노출 문구는 한국어를 기본으로 합니다.

## 테스트와 검증

### 기본 검증

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

### 브라우저 검증 최소 체크

기능 수정 후 아래는 최소 1회 확인합니다.

1. 로그인
2. 로비 진입
3. `/game` 진입
4. 맵 선택
5. 출격 시작
6. 슬롯 선택 후 포대 배치
7. 업그레이드 또는 판매
8. 결과 제출 또는 재시작

## 작업 전에 확인할 것

- 현재 작업이 웹 UI 수정인지, Phaser 로직 수정인지 먼저 구분합니다.
- 밸런스 수정이면 반드시 데이터 파일부터 봅니다.
- UI 수정이면 브라우저에서 실제 화면을 확인합니다.
- 변경 범위가 크면 README, 계획서, 테스트도 같이 갱신합니다.

## 푸시 전 체크리스트

- `corepack pnpm test`
- `corepack pnpm build`
- 깨진 한글 문자열 없는지 확인
- 사용하지 않는 라우트/컴포넌트 남아 있는지 확인
- 브라우저에서 최소 1회 실동작 확인

## 문서

- 초기 계획서: [docs/PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)
- 실행 계획서: [docs/EXECUTION_PLAN.md](./docs/EXECUTION_PLAN.md)

## 현재 우선순위

1. 전투 UX와 가독성 개선
2. 맵별 플레이 감각 차별화
3. 랭킹/API 신뢰도 개선
4. 번들 크기 최적화
5. 오디오/SFX 확장
