# 브라우저용 타워디펜스 최종 기술스택 결정안 및 아키텍처 설계서

## 1. 문서 목적

이 문서는 다음 조건을 만족하는 **브라우저용 타워디펜스 프로젝트**의 최종 기술스택과 구조를 확정하기 위한 핸드오프 문서다.

조건:
- 사용자는 웹 브라우저에서 URL로 접속해 게임을 플레이한다.
- 게임 외에도 로그인, 로비, 상점, 랭킹, 공지, 결제 같은 웹앱 UI가 많다.
- 사람 개발자가 일부 검수하더라도, 실제 구현의 큰 비중은 AI에게 맡긴다.
- 따라서 **AI가 구현하기 쉽고**, **유지보수가 쉽고**, **프론트/게임/백엔드 경계가 명확한 구조**가 필요하다.

이 문서의 결론은 다음과 같다.

## 2. 최종 결론

### 최종 추천 스택
- **모노레포**: pnpm workspace
- **웹 앱 프론트엔드**: React + TypeScript + Vite
- **게임 클라이언트**: Phaser 3 + TypeScript
- **라우팅**: React Router
- **서버 상태 관리**: TanStack Query
- **클라이언트 UI 상태 관리**: Zustand
- **백엔드 API**: NestJS + TypeScript
- **DB 접근/마이그레이션**: Prisma ORM
- **데이터베이스**: PostgreSQL
- **결제 연동**: 결제사 SDK를 감싸는 Provider Adapter 패턴
- **공유 타입**: 공용 패키지로 DTO / enum / 상수 공유

### 한 줄 요약
**TypeScript 단일 언어 모노레포 + React 웹셸 + Phaser 게임 + NestJS API + Prisma/PostgreSQL**로 간다.

---

## 3. 왜 이 조합이 맞는가

### 3-1. TypeScript 단일 언어 전략
이 프로젝트는 웹 UI, 게임 로직, API 서버가 모두 있다. 언어를 나누면 경계마다 문맥 전환 비용이 커지고 AI 산출물도 분산된다.  
TypeScript 하나로 통일하면 다음 장점이 있다.

- 프론트 / 게임 / 백엔드 모두 같은 언어로 간다.
- 타입 기반으로 AI 코드 오류를 더 빨리 잡을 수 있다.
- shared package로 공용 타입과 계약을 재사용할 수 있다.
- 리뷰 기준이 통일된다.

### 3-2. React는 웹 UI, Phaser는 게임 캔버스
이 프로젝트는 단순한 게임 페이지가 아니라 웹앱 기능이 많다.  
따라서 전체를 게임 엔진으로 밀어붙이는 것보다, 역할을 분리하는 것이 맞다.

- **React**가 담당할 것:
  - 로그인
  - 회원 상태
  - 로비
  - 상점
  - 랭킹
  - 공지
  - 결제 플로우
  - 페이지 라우팅
  - 모달, 폼, 테이블, 리스트

- **Phaser**가 담당할 것:
  - 실제 전투 화면
  - 게임 루프
  - 적 이동
  - 타워 설치/공격
  - 웨이브
  - 이펙트
  - 오디오
  - 인게임 HUD 일부

핵심은 **React와 Phaser의 책임을 명확히 분리**하는 것이다.

### 3-3. NestJS는 웹서비스 기능이 많은 프로젝트에 유리
로그인, 상점, 결제, 랭킹, 공지까지 들어가면 API가 단순 CRUD 수준을 넘는다.  
NestJS는 모듈 구조가 분명해서 아래와 같이 기능 단위로 쪼개기 좋다.

- auth
- users
- notices
- rankings
- shop
- payments
- inventory
- game-runs
- progression

AI에게도 “모듈 하나씩 구현” 방식으로 맡기기 좋다.

### 3-4. Prisma + PostgreSQL은 유지보수성이 좋다
랭킹, 유저, 인벤토리, 결제, 공지 같은 서비스성 데이터가 많다.  
관계형 데이터가 중심이므로 PostgreSQL이 적합하고, Prisma를 두면 다음이 좋아진다.

- 스키마가 명시적이다.
- 타입 안전한 쿼리 사용이 가능하다.
- 마이그레이션 흐름이 비교적 명확하다.
- DB 모델을 AI에게 지시하기 쉽다.

---

## 4. 아키텍처 원칙

이 프로젝트는 다음 원칙을 강제한다.

### 원칙 1. React와 Phaser를 섞지 않는다
금지:
- React state를 Phaser Scene 안에서 직접 마구 참조
- Phaser GameObject를 React 컴포넌트처럼 다룸
- 게임 상태를 전부 React 전역 상태로 끌어올림

권장:
- React는 웹앱 껍데기 담당
- Phaser는 canvas 내부 게임 담당
- 둘 사이 통신은 **좁은 bridge API** 또는 이벤트 인터페이스로만 연결

### 원칙 2. 게임 코어는 웹 UI와 독립적으로 유지한다
`packages/game` 또는 `packages/game-core`는 React에 종속되지 않도록 한다.

좋은 구조:
- game-core는 입력값을 받는다
- game-core는 결과 이벤트를 내보낸다
- web 앱은 그 결과를 받아 서버에 제출한다

### 원칙 3. 서버가 최종 권위다
브라우저 게임은 클라이언트 변조 가능성이 있다.  
따라서 아래 정보는 서버가 최종 판단권을 가진다.

- 결제 승인 상태
- 상점 구매 확정
- 재화 증감
- 인벤토리 반영
- 랭킹 기록 저장
- 시즌 보상 반영

MVP에서는 완전한 안티치트까지 가지 않더라도, 최소한 **랭킹 저장 전 검증 로직**은 별도 설계한다.

### 원칙 4. 데이터 중심 구조를 유지한다
타워, 적, 웨이브, 상품, 공지, 랭킹 규칙을 하드코딩하지 말고 데이터/설정으로 뺀다.

---

## 5. 최종 폴더 구조

```txt
repo-root/
  apps/
    web/
      public/
      src/
        app/
          router/
          providers/
          layouts/
        pages/
          auth/
          lobby/
          notices/
          shop/
          ranking/
          game/
          payment/
          profile/
        features/
          auth/
          notices/
          shop/
          ranking/
          payment/
          profile/
        components/
          ui/
          common/
          layout/
        hooks/
        lib/
          api/
          query/
          utils/
        stores/
        styles/
        main.tsx
        vite-env.d.ts
      index.html
      package.json
      tsconfig.json
      vite.config.ts

    api/
      src/
        main.ts
        app.module.ts
        common/
          decorators/
          dto/
          exceptions/
          filters/
          guards/
          interceptors/
          pipes/
        config/
        modules/
          auth/
          users/
          notices/
          rankings/
          shop/
          payments/
          inventory/
          game-runs/
          progression/
        prisma/
        health/
      prisma/
        schema.prisma
        migrations/
      test/
      package.json
      tsconfig.json

  packages/
    game/
      src/
        core/
          config/
          constants/
          events/
          types/
        data/
          enemies/
          towers/
          stages/
          waves/
        scenes/
          BootScene.ts
          PreloadScene.ts
          MenuScene.ts
          GameScene.ts
          UiScene.ts
          ResultScene.ts
        entities/
          Enemy.ts
          Tower.ts
          Projectile.ts
          BuildSlot.ts
        managers/
          EnemyManager.ts
          TowerManager.ts
          WaveManager.ts
          ProjectileManager.ts
          EconomyManager.ts
          SelectionManager.ts
        bridge/
          createGameBridge.ts
          gameEvents.ts
          gameCommands.ts
        index.ts
      package.json
      tsconfig.json

    shared/
      src/
        dto/
        enums/
        constants/
        schemas/
        types/
        index.ts
      package.json
      tsconfig.json

    eslint-config/
    tsconfig/

  pnpm-workspace.yaml
  package.json
  tsconfig.base.json
  .editorconfig
  .gitignore
  .env.example
```

---

## 6. 앱/게임/서버 경계 정의

## 6-1. React Web 앱이 맡는 영역
- 로그인 화면
- 회원가입 / 계정 연결
- 로비
- 상점 페이지
- 랭킹 페이지
- 공지 목록 / 상세
- 프로필
- 결제 시작 / 결과 페이지
- 서버 데이터 조회/갱신
- 접근 제어
- 브라우저 레이아웃
- 헤더 / 사이드바 / 모달 / 알림 토스트

## 6-2. Phaser Game이 맡는 영역
- 스테이지 렌더링
- 적 이동
- 웨이브 시스템
- 타워 설치 / 업그레이드 / 판매
- 발사체
- 사거리 판정
- 인게임 자원(골드, 라이프)
- 인게임 HUD
- 승리 / 패배 처리
- 플레이 결과 요약 이벤트 생성

## 6-3. API 서버가 맡는 영역
- 인증 / 세션
- 유저 정보 조회
- 공지 CRUD
- 상품 목록 조회
- 구매 처리
- 인벤토리 반영
- 랭킹 저장/조회
- 플레이 결과 수신
- 시즌 정보
- 결제 검증 콜백 처리

---

## 7. 웹 프론트엔드 설계

## 7-1. 라우트 구조

```txt
/
  /login
  /signup
  /lobby
  /notices
  /notices/:noticeId
  /shop
  /ranking
  /profile
  /game
  /payment/checkout
  /payment/result
```

### 권장 규칙
- 비로그인 사용자는 `/login` 또는 공개 페이지로 리다이렉트
- `/game`, `/shop`, `/profile` 등은 인증 필요
- 공지/랭킹은 공개 여부 정책에 따라 일부 공개 가능

## 7-2. React 상태 전략

### TanStack Query 사용 영역
- 내 프로필 조회
- 공지 목록/상세
- 상점 상품 목록
- 인벤토리
- 랭킹 목록
- 결제 상태 조회
- 세션 조회

즉, **서버에서 가져오는 데이터**는 TanStack Query가 담당한다.

### Zustand 사용 영역
- 전역 모달 열림 여부
- 음량 설정
- 현재 선택된 서버/채널(있다면)
- UI 탭 상태
- 웹앱 레벨 임시 상태
- Phaser와 연동되는 얕은 전역 상태 일부

즉, **브라우저 내 UI 상태**만 Zustand로 관리한다.

### 금지 규칙
- 서버 데이터 캐시를 Zustand에 중복 저장
- TanStack Query와 Zustand에 동일 데이터 이중 저장
- Phaser 내부 전투 상태를 React 전역 상태에 그대로 옮김

## 7-3. 스타일링 권장
MVP에서는 다음 중 하나를 택한다.

1. Tailwind CSS
2. CSS Modules

AI 생산성과 UI 반복 속도를 우선하면 Tailwind CSS가 유리하다.  
하지만 스타일 체계 혼란을 피하려면 한 번 정하면 끝까지 유지한다.

---

## 8. Phaser 게임 설계

## 8-1. 게임 구조
게임은 `packages/game`에 격리한다.

### Scene 구성
- `BootScene`: 환경 설정, 기본 초기화
- `PreloadScene`: 에셋 로드
- `MenuScene`: 인게임 시작 전 준비 상태
- `GameScene`: 실제 게임플레이
- `UiScene`: 인게임 UI/HUD
- `ResultScene`: 클리어/실패 결과

## 8-2. 게임 규칙
- 2D 타워디펜스
- 브라우저 캔버스 기반
- 고정 경로(path) 방식
- 자유 배치 금지
- build slot 방식
- 타워 3종부터 시작
- 적 4종부터 시작
- 업그레이드 2단계
- 맵 1개 + 웨이브 10개로 MVP 시작

## 8-3. 엔티티 구조
- `Enemy`
- `Tower`
- `Projectile`
- `BuildSlot`

## 8-4. 매니저 구조
- `EnemyManager`
- `TowerManager`
- `ProjectileManager`
- `WaveManager`
- `EconomyManager`
- `SelectionManager`

## 8-5. 게임 데이터 분리
하드코딩 금지. 아래는 데이터 파일로 분리한다.

- 적 타입 정의
- 타워 타입 정의
- 스테이지 정의
- 웨이브 정의
- 밸런스 상수
- 보상 수치

## 8-6. React와 Phaser 브리지 규칙
React와 Phaser는 아래처럼 통신한다.

### React → Phaser 명령 예시
- `startGame(payload)`
- `pauseGame()`
- `resumeGame()`
- `setGameSpeed(speed)`
- `setSoundVolume(volume)`
- `destroyGame()`

### Phaser → React 이벤트 예시
- `onGameReady`
- `onRunStarted`
- `onWaveChanged`
- `onGoldChanged`
- `onLifeChanged`
- `onRunFinished(result)`
- `onError(error)`

### 중요 원칙
- Phaser Scene이 직접 fetch를 날리지 않는다.
- 서버 통신은 React 또는 api client layer가 담당한다.
- 게임 결과를 서버로 보내는 것도 React 쪽에서 처리한다.

---

## 9. 백엔드 API 설계

## 9-1. 모듈 구조

### auth
- 로그인
- 로그아웃
- 토큰 재발급
- 세션 검증

### users
- 내 정보 조회
- 프로필 수정
- 보유 재화 조회

### notices
- 공지 목록
- 공지 상세
- 관리자 공지 등록/수정/삭제

### shop
- 상품 목록 조회
- 구매 요청
- 가격 정책 조회

### inventory
- 소유 아이템 조회
- 구매 결과 반영

### payments
- 결제 시작
- 결제 검증
- 결제 콜백 처리
- 주문 상태 조회

### rankings
- 랭킹 목록
- 시즌 랭킹
- 플레이 결과 반영

### game-runs
- 게임 시작 기록
- 게임 종료 기록
- 점수 제출
- 검증 상태 저장

### progression
- 스테이지 클리어 상태
- 업적/진행도
- 보상 지급

## 9-2. API 스타일
MVP에서는 **REST API 우선**으로 간다.

이유:
- AI가 구현하기 쉽다.
- 디버깅이 쉽다.
- 로그인, 상점, 공지, 랭킹은 대부분 REST로 충분하다.

실시간 채팅이나 실시간 로비 동기화가 생기면 그때 WebSocket을 추가한다.

---

## 10. 데이터 모델 초안

아래는 최소 권장 엔티티다.

### User
- id
- email / socialId
- nickname
- role
- createdAt
- updatedAt

### UserCurrency
- userId
- gold
- gem
- updatedAt

### Session / RefreshToken
- id
- userId
- tokenHash
- expiresAt

### Notice
- id
- title
- body
- category
- isPublished
- publishedAt

### Product
- id
- code
- name
- type
- price
- currencyType
- isActive

### Order
- id
- userId
- productId
- paymentProvider
- amount
- status
- requestedAt
- approvedAt

### InventoryItem
- id
- userId
- itemType
- itemCode
- quantity

### GameRun
- id
- userId
- stageId
- startedAt
- finishedAt
- score
- cleared
- durationMs
- submittedSource
- validationStatus

### RankingEntry
- id
- seasonId
- userId
- score
- bestWave
- cleared
- createdAt

### Season
- id
- name
- startedAt
- endedAt
- isActive

### PlayerProgress
- id
- userId
- currentStage
- stars
- lastPlayedAt

---

## 11. 결제 설계 원칙

결제사는 나중에 확정해도 된다.  
하지만 구조는 지금부터 고정하는 것이 좋다.

### 권장 방식
- `payments` 모듈 안에 provider adapter 인터페이스를 둔다.
- 실제 결제사 SDK 연동은 provider 구현체로 분리한다.
- 앱 레이어는 "결제 요청 / 승인 검증 / 주문 확정"만 다룬다.

예시:
```txt
payments/
  domain/
    PaymentProvider.ts
  providers/
    ProviderA/
    ProviderB/
  application/
  presentation/
```

### 중요한 원칙
- 프론트 성공 콜백만 믿지 않는다.
- 서버에서 결제 승인 상태를 검증한 뒤 주문을 확정한다.
- 주문 확정과 아이템 지급은 트랜잭션 단위로 묶는다.

---

## 12. 랭킹/치트 대응 원칙

브라우저 게임은 클라이언트가 신뢰 대상이 아니다.  
MVP라 해도 최소한 아래는 반영한다.

- 결과 제출 시 서버 검증 로직 분리
- 비정상 수치 필터링
- 너무 짧은 클리어 시간 차단
- 불가능한 골드/웨이브/스코어 조합 차단
- suspicious 플래그 저장

완전한 치트 방지는 어렵지만, **아무 검증 없이 점수 저장**하는 구조는 금지한다.

---

## 13. 환경 변수 예시

```txt
# web
VITE_API_BASE_URL=
VITE_GAME_ENV=
VITE_PAYMENT_RETURN_URL=

# api
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
CORS_ORIGIN=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

---

## 14. 단계별 구현 계획

## Phase 0. 모노레포 뼈대
완료 기준:
- pnpm workspace 구성
- apps/web, apps/api, packages/game, packages/shared 생성
- TypeScript 공통 설정 완료
- lint / format / build 기본 동작

## Phase 1. 웹 셸
완료 기준:
- React + Vite 앱 구동
- React Router 연결
- 기본 레이아웃 구성
- `/login`, `/lobby`, `/shop`, `/ranking`, `/notices`, `/game` 빈 페이지 생성

## Phase 2. API 기본기
완료 기준:
- NestJS 앱 생성
- Prisma 연결
- User / Notice / Ranking 최소 테이블 생성
- health check와 기본 인증 구조 생성

## Phase 3. Phaser 임베드
완료 기준:
- `/game` 페이지에서 Phaser canvas 정상 렌더링
- React와 Phaser bridge 초안 구현
- Boot/Preload/Menu/Game/UI/Result scene 생성

## Phase 4. 타워디펜스 MVP
완료 기준:
- 적 경로 이동
- 웨이브 시스템
- 슬롯 설치
- 3종 타워 공격
- 골드/라이프/승패 작동

## Phase 5. 웹 기능 연결
완료 기준:
- 공지 목록/상세 연동
- 랭킹 조회 연동
- 로그인 후 접근 제어
- 게임 결과 제출 API 연결

## Phase 6. 상점/인벤토리
완료 기준:
- 상품 목록 조회
- 구매 요청 흐름
- 인벤토리 반영
- 구매 내역 확인

## Phase 7. 결제 연동
완료 기준:
- 결제 요청/복귀 페이지
- 서버 검증 후 주문 확정
- 지급 트랜잭션 처리

## Phase 8. 하드닝
완료 기준:
- 에러 처리 정리
- 로딩/빈 상태 UI
- 비정상 점수 필터
- 로그/모니터링 최소 적용
- 코드 정리

---

## 15. AI 작업 규칙

AI에게 아래 규칙을 강제한다.

1. **항상 TypeScript 사용**
2. `any` 남용 금지
3. 새 파일/수정 파일은 항상 전체 코드 출력
4. 한 번에 너무 많은 기능을 넣지 말고 단계별로 진행
5. 빌드 가능한 상태를 우선
6. 하드코딩 최소화, 데이터/상수 분리
7. React와 Phaser 책임 섞지 말 것
8. API contract는 shared package 타입을 사용
9. 결제 로직은 adapter pattern 유지
10. 서버가 최종 권위라는 원칙 유지

---

## 16. AI가 절대 하지 말아야 할 것

- Next.js로 임의 전환
- Unity WebGL로 임의 전환
- Phaser와 React state를 뒤섞는 구조
- 게임 상태 전체를 Redux/Zustand로 올리는 구조
- 공지/랭킹/상점 데이터를 컴포넌트 내부 fetch 난사로 처리
- 결제 성공을 프론트 콜백만으로 확정
- 점수 제출을 무검증 저장
- 타입 없는 자바스크립트로 회귀
- monorepo 없이 여러 저장소로 쪼개기

---

## 17. MVP 기능 범위

### 포함
- 이메일 또는 간단 로그인
- 로비
- 공지 목록 / 상세
- 랭킹 목록
- 상점 목록
- 결제 시작 / 결과 페이지
- 인게임 타워디펜스 1맵
- 웨이브 10개
- 타워 3종
- 적 4종
- 결과 제출

### 제외
- 멀티플레이
- 실시간 PVP
- 길드
- 채팅
- 소셜 피드
- 복잡한 시즌 패스
- 자유 맵 에디터
- 스테이지 수십 개
- 고급 안티치트
- 관리자 백오피스 고도화

---

## 18. 최종 의사결정 요약

이 프로젝트는 다음 조합으로 고정한다.

- **프론트엔드**: React + TypeScript + Vite
- **게임**: Phaser 3 + TypeScript
- **라우팅**: React Router
- **서버 상태**: TanStack Query
- **클라이언트 UI 상태**: Zustand
- **백엔드**: NestJS + TypeScript
- **ORM**: Prisma
- **DB**: PostgreSQL
- **레포 구조**: pnpm workspace monorepo

이 구성이 가장 중요한 이유는 성능이 아니라 **역할 분리와 유지보수성**이다.

- 웹 기능은 React가 잘한다.
- 2D 게임 루프는 Phaser가 잘한다.
- 서비스 API는 NestJS가 잘한다.
- 데이터 계약은 TypeScript 공유 패키지로 관리한다.
- AI는 모듈/단계 단위로 작업하기 쉬워진다.

이 문서를 기준으로 구현을 시작한다.
