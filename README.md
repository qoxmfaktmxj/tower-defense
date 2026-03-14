# 타워 디펜스

브라우저에서 바로 실행되는 한국어 타워 디펜스 프로젝트다.  
웹 셸은 React + Vite, 실제 전투 렌더링은 Phaser, API 계층은 NestJS, 데이터 계층은 Prisma + PostgreSQL 기준으로 구성되어 있다.

이 저장소는 단순 프로토타입이 아니라, 웹 화면과 전투 런타임을 분리한 상태에서 계속 확장할 수 있게 잡아 둔 구조가 핵심이다.  
현재 개발 방향은 기능을 무작정 늘리는 것보다 `전술형 타워 디펜스 경험의 완성도`를 높이는 데에 맞춰져 있다.

## 현재 구현 범위

- 전장 3개
  - `han-river-front`
  - `metro-grid`
  - `red-canyon`
- 웨이브 50개
- 포대 3종
  - 기관 포대
  - 중화기 포대
  - 빙결 포대
- 포대 업그레이드 5단계
- 5웨이브마다 보스 등장
- 로그인, 로비, 랭킹, 프로필, 게임 화면
- 전투 결과 제출과 랭킹 반영 흐름
- 전체 화면, 단축키, 세션 저장, 최근 결과 저장

현재 스코프에서 제외한 것:

- 공지
- 상점
- 결제
- 복수 모드 테마

## 이번 리디자인에서 바뀐 방향

이제 기본 UI는 파스텔 대시보드 톤이 아니라 `전술 지휘 센터` 톤을 기준으로 한다.

- 웹 셸 전체를 다크 그래파이트 계열로 통일
- 강조색은 시안, 골드, 레드만 사용
- 게임 화면은 상단 HUD, 중앙 전장, 하단 액션 바, 우측 인스펙터 구조로 정리
- Phaser 전장도 같은 제품 언어를 따르도록 배경, 도로, 슬롯, 파티클, 웨이브 경보를 강화
- 한국어 문구는 설명형 문장보다 짧고 전투 지향적으로 정리

## 기술 스택

- `apps/web`
  - React
  - Vite
  - React Router
  - TanStack Query
  - Zustand
- `apps/api`
  - NestJS
  - Prisma
  - PostgreSQL
- `packages/game`
  - Phaser 3
- `packages/shared`
  - 웹/API 공용 타입

## 폴더 구조

```text
tower-defense/
├─ apps/
│  ├─ web/                  # React 웹 셸
│  │  ├─ src/app/           # 라우터, 레이아웃, 프로바이더
│  │  ├─ src/components/    # 화면 공용 컴포넌트
│  │  ├─ src/pages/         # 로비, 로그인, 게임, 랭킹, 프로필
│  │  └─ src/styles/        # 전역 스타일
│  └─ api/                  # NestJS API
│     ├─ src/modules/       # auth, rankings, users 등
│     └─ prisma/            # schema, seed
├─ packages/
│  ├─ game/                 # Phaser 씬, 엔티티, 매니저, 밸런스 데이터
│  └─ shared/               # 공용 타입
├─ docs/                    # 계획서와 실행 문서
├─ tests/                   # 데이터/밸런스 테스트
└─ output/                  # 브라우저 검증 스크린샷, 런타임 로그
```

## 빠른 실행

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
- 헬스 체크: [http://localhost:4000/api/health](http://localhost:4000/api/health)

### 환경 변수

`.env.example`를 기준으로 맞춘다.

주요 값:

- `VITE_API_BASE_URL`
- `DATABASE_URL`
- `CORS_ORIGIN`

### 로컬 DB 예시

```bash
docker compose up -d
corepack pnpm --filter @tower-defense/api prisma:generate
corepack pnpm --filter @tower-defense/api prisma:seed
```

## 아키텍처 원칙

이 프로젝트에서 가장 중요한 규칙은 `React와 Phaser를 직접 섞지 않는 것`이다.

### 역할 분리

- React
  - 페이지 구조
  - 버튼, 폼, 패널, 라우팅
  - 사용자 입력과 상태 표시
- Phaser
  - 실제 전투 씬
  - 적 이동, 포대 발사, 충돌, 웨이브 진행
  - 전장 렌더링과 이펙트
- Bridge
  - React → Phaser 명령 전달
  - Phaser → React 상태 이벤트 전달

즉, 웹 화면을 수정할 때 Phaser 내부 로직을 직접 건드리는 것이 아니라, 먼저 `bridge로 주고받는 정보가 무엇인지`부터 확인해야 한다.

## 실제로 자주 수정하는 파일

### 웹 셸

- `apps/web/src/pages/game/GamePage.tsx`
  - 게임 HUD, 액션 바, 인스펙터, 결과 카드
- `apps/web/src/styles/global.css`
  - 디자인 토큰, 공용 패널, 버튼, 게임 화면 레이아웃
- `apps/web/src/components/layout/Header.tsx`
  - 상단 세션 정보, 볼륨, 로그인 상태
- `apps/web/src/components/layout/Sidebar.tsx`
  - 좌측 네비게이션
- `apps/web/src/components/ui/StageRoutePreview.tsx`
  - 맵 미리보기 SVG
- `apps/web/src/pages/lobby/LobbyPage.tsx`
- `apps/web/src/pages/ranking/RankingPage.tsx`
- `apps/web/src/pages/profile/ProfilePage.tsx`
- `apps/web/src/pages/auth/LoginPage.tsx`

### Phaser 전투

- `packages/game/src/scenes/GameScene.ts`
  - 전장 배경, 도로, 웨이브, 전투 상태 전송
- `packages/game/src/scenes/UiScene.ts`
  - 전장 위 보조 HUD, 웨이브 배너, 선택 힌트
- `packages/game/src/scenes/PreloadScene.ts`
- `packages/game/src/scenes/MenuScene.ts`
- `packages/game/src/scenes/ResultScene.ts`
- `packages/game/src/entities/BuildSlot.ts`
- `packages/game/src/entities/Tower.ts`
- `packages/game/src/entities/Enemy.ts`
- `packages/game/src/entities/Projectile.ts`

### 데이터와 밸런스

- `packages/game/src/data/stages/stageDefinitions.ts`
  - 맵 경로, 슬롯, 분위기, 전장 소개 문구
- `packages/game/src/data/waves/waveDefinitions.ts`
  - 웨이브 수, 적 구성, 보스 웨이브 규칙
- `packages/game/src/data/towers/towerDefinitions.ts`
  - 데미지, 사거리, 공속, 업그레이드 비용
- `packages/game/src/data/gameModes.ts`
  - 기본 테마, 에셋 경로, 공통 시각값

### API와 DB

- `apps/api/src/modules/auth`
- `apps/api/src/modules/rankings`
- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/prisma/schema.prisma`

## 개발 순서

기능 추가나 수정은 아래 순서로 진행하는 편이 가장 안전하다.

1. **데이터를 먼저 본다**
   - 맵이면 `stageDefinitions.ts`
   - 웨이브면 `waveDefinitions.ts`
   - 포대 밸런스면 `towerDefinitions.ts`
2. **Phaser 전투 로직을 맞춘다**
   - 씬, 엔티티, 매니저 수정
3. **React UI와 Bridge를 맞춘다**
   - 필요한 상태를 노출하고 HUD에 붙인다
4. **API가 필요하면 마지막에 붙인다**
   - 웹에서 DB로 직접 가지 않는다
5. **테스트와 브라우저 검증을 한다**

이 순서를 지키면 화면만 바뀌고 실제 전투가 안 맞는 상태, 또는 전투는 맞는데 UI가 엉키는 상태를 줄일 수 있다.

## 화면 작업 규칙

### 디자인 시스템

현재 기준 색 체계는 아래와 같다.

- 배경: 그래파이트, 슬레이트, 건메탈
- 기본 강조색: 시안, 전기 청록
- 경제/보상: 앰버, 골드
- 경고/위험: 레드, 크림슨

피해야 하는 것:

- 밝은 파스텔 대시보드 느낌
- 너무 둥글고 귀여운 관리형 UI
- 페이지마다 다른 디자인 언어
- 본문보다 장식이 더 튀는 효과

### 한국어 문구

- 설명을 길게 늘이지 않는다
- 전투 화면은 특히 짧게 쓴다
- `포대`, `웨이브`, `출격`, `전장`, `지휘관` 같은 핵심 용어는 계속 동일하게 쓴다
- 영어는 코드명이나 라벨 수준에서만 제한적으로 쓴다

### 게임 화면

`GamePage`를 건드릴 때는 아래 구조를 유지한다.

- 상단: 전장 이름, 상태, 골드, 생명, 웨이브, 점수
- 중앙: Phaser 전장 캔버스
- 하단: 포대 배치 액션 바와 전투 제어
- 우측: 선택한 슬롯/포대 인스펙터

중복 정보는 피한다.  
같은 상태를 React HUD와 Phaser UI에 동시에 크게 노출하지 않는다.

## Phaser 작업 규칙

전투는 3D 엔진으로 바꾸지 않는다. 대신 `2.5D처럼 보이는 연출`에 집중한다.

현재 적용된 방향:

- 다층 배경과 안개
- 더 두꺼운 도로 렌더링
- 슬롯 링과 선택 글로우 강화
- 포대 발사 플래시
- 투사체 잔상
- 폭발/빙결 시 카메라 미세 흔들림
- 웨이브 배너와 보스 웨이브 경고

새 연출을 넣을 때 주의할 점:

- 게임 규칙은 바꾸지 않고 표현만 강화한다
- 적 수가 많아지는 후반 웨이브에서도 프레임이 급격히 떨어지지 않게 한다
- 이펙트는 짧고 명확해야 한다
- 선택 상태는 항상 가독성이 우선이다

## 자주 하는 작업 예시

### 새 전장 추가

1. `stageDefinitions.ts`에 전장 정의 추가
2. `waveDefinitions.ts`에 해당 전장 웨이브 패턴 추가
3. `StageRoutePreview.tsx`에서 미리보기 문제가 없는지 확인
4. `/game` 화면에서 스테이지 카드와 Phaser 씬 둘 다 확인

### 포대 밸런스 조정

1. `towerDefinitions.ts` 수정
2. 필요한 경우 `Tower.ts`, `Projectile.ts` 확인
3. `corepack pnpm test` 실행
4. 실제 브라우저에서 한 판 이상 돌려 체감 확인

### 전장 UI 조정

1. `GamePage.tsx`에서 구조 수정
2. `global.css`에서 공용 패턴과 반응형까지 확인
3. Phaser 오버레이와 정보 중복이 생기지 않는지 확인
4. 전체 화면 동작과 단축키도 같이 점검

## 테스트와 검증

### 기본 검증

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

### 브라우저 검증 최소 항목

아래 흐름은 UI를 크게 바꾼 뒤 반드시 한 번은 확인한다.

1. 로그인
2. 로비 진입
3. 랭킹 이동
4. 프로필 이동
5. `/game` 진입
6. 전장 선택
7. 출격 시작
8. 포대 배치
9. 결과 제출 또는 재시작

### 이번 리디자인 검증 기록

2026-03-14 기준으로 아래를 확인했다.

- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- 브라우저 검증
  - 로그인
  - 로비
  - 랭킹
  - 프로필
  - 게임 진입
  - `?autostart=1&slot=A1&tower=arrow` 기준 자동 출격 화면 확인

산출물 예시:

- `output/playwright/redesign-game-autostart.png`
- `output/playwright/redesign-game-top.png`
- `output/playwright/redesign-game-live.png`

## 작업 전에 꼭 확인할 것

- 지금 건드리려는 내용이 `웹 화면`, `전투 로직`, `데이터`, `API` 중 어디에 속하는지 먼저 구분한다
- 밸런스 문제를 UI에서 해결하려 하지 않는다
- 반대로 전투 표현 문제를 데이터만 바꿔서 해결하려 하지 않는다
- 변경 범위가 크면 README와 계획 문서도 같이 갱신한다

## 푸시 전 체크리스트

- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- 브라우저 기준 핵심 흐름 1회 확인
- 깨진 한글 없는지 확인
- 사용하지 않는 임시 코드와 콘솔 로그 제거

## 남은 과제

현재 기준으로 다음 단계는 아래 항목이 자연스럽다.

1. 맵별 웨이브 개성 추가
2. 랭킹/프로필 데이터 확장
3. 오디오 레이어 실제 자산 적용
4. 더 큰 해상도 기준 HUD 세부 조정
5. 장기적으로는 2.5D 전장 연출 고도화

## 참고 문서

- [docs/PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)
- [docs/EXECUTION_PLAN.md](./docs/EXECUTION_PLAN.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
