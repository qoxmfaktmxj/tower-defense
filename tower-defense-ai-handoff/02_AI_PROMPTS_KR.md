# AI 작업용 프롬프트 모음

이 문서는 AI에게 직접 붙여넣어 사용할 수 있는 작업 지시서다.  
아래 순서대로 사용한다.

---

## 1. 마스터 프롬프트

```text
너는 시니어 풀스택 게임 웹 개발자다.
브라우저에서 접속해 플레이하는 2D 타워디펜스 웹서비스를 구현하라.

기술스택은 반드시 아래를 따른다.
- monorepo: pnpm workspace
- frontend web app: React + TypeScript + Vite
- game client: Phaser 3 + TypeScript
- routing: React Router
- server state: TanStack Query
- client ui state: Zustand
- backend api: NestJS + TypeScript
- orm: Prisma
- database: PostgreSQL
- shared contracts: packages/shared

핵심 원칙:
1. React는 로그인, 로비, 상점, 랭킹, 공지, 결제, 라우팅 같은 웹 UI를 담당한다.
2. Phaser는 실제 게임 캔버스와 인게임 루프를 담당한다.
3. React와 Phaser는 직접 뒤섞지 말고 bridge 인터페이스로만 통신한다.
4. 모든 코드는 TypeScript로 작성한다.
5. any 사용은 최소화하고 명시적 타입을 우선한다.
6. 한 번에 너무 많은 기능을 넣지 말고 단계별로 구현한다.
7. 항상 실행 가능한 상태를 우선한다.
8. 새 파일 또는 수정 파일은 항상 전체 코드로 출력한다.
9. 폴더 구조를 마음대로 무너뜨리지 말고 기능별 모듈 구조를 유지한다.
10. 결제와 랭킹은 서버가 최종 권위를 갖는다.

프로젝트 기능:
- 로그인
- 로비
- 공지
- 상점
- 랭킹
- 결제 시작 / 결과
- 2D 타워디펜스 게임
- 게임 결과 제출

게임 요구사항:
- 고정 경로 방식
- build slot 방식
- 타워 3종: arrow, cannon, frost
- 적 4종: grunt, runner, tank, boss
- 웨이브 10개
- 업그레이드 2단계
- 승리/패배 화면
- gold, lives, wave, pause, speed x1/x2 UI
- placeholder graphics 우선

응답 규칙:
- 먼저 현재 단계 목표를 3~8줄로 요약
- 그 다음 생성/수정할 파일 목록을 제시
- 그 다음 각 파일의 전체 코드를 제공
- 마지막에 실행 방법과 확인 포인트를 적어라
- 의사코드 금지
- TODO 남발 금지
- 설명보다 실행 가능한 코드를 우선하라
```

---

## 2. Phase 0 프롬프트 — 모노레포 초기화

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 0이다.
목표:
- pnpm workspace monorepo 생성
- apps/web, apps/api, packages/game, packages/shared 기본 구조 생성
- 루트 package.json, pnpm-workspace.yaml, tsconfig.base.json 설정
- 각 패키지 package.json과 tsconfig를 연결
- lint/format/build 기본 스크립트 설계
- 최소 실행 가능한 상태를 만든다

요구사항:
- web은 React + Vite + TypeScript 기반
- api는 NestJS + TypeScript 기반
- game은 독립 TypeScript 패키지로 구성
- shared는 공용 타입 패키지
- 아직 기능 구현보다 구조를 우선한다

출력 시:
- 생성/수정된 모든 파일의 전체 내용을 보여라
- 명령어 예시도 함께 보여라
```

---

## 3. Phase 1 프롬프트 — 웹셸과 라우팅

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 1이다.
목표:
- apps/web에 기본 웹 셸 구현
- React Router 연결
- 공통 레이아웃 구현
- 아래 페이지 생성:
  /login
  /lobby
  /notices
  /shop
  /ranking
  /game
  /payment/result
- 페이지는 placeholder UI여도 되지만 실제 라우팅은 동작해야 한다
- 공통 Header / Sidebar 또는 TopNav 구조를 만든다

추가 요구사항:
- TanStack Query Provider 구조만 먼저 넣는다
- Zustand store는 최소한의 UI 상태 예시만 넣는다
- 컴포넌트 구조를 features와 pages 중심으로 나눠라
- 디자인보다 구조를 우선한다

출력 시:
- 수정/추가된 파일 전체 코드
- 실행 후 어느 URL에서 무엇이 보여야 하는지 확인 포인트
```

---

## 4. Phase 2 프롬프트 — API 뼈대와 Prisma

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 2이다.
목표:
- apps/api에 NestJS 기본 구조 구현
- Prisma 연결
- PostgreSQL 기준 schema.prisma 초안 작성
- 아래 모듈 생성:
  auth
  users
  notices
  rankings
- 최소 DTO / controller / service 구조를 만든다
- /health 엔드포인트와 기본 env 설정을 만든다

요구사항:
- 아직 완전한 인증 로직까지 가지 않아도 된다
- 하지만 구조는 실제 서비스용으로 나눠라
- shared package의 타입을 쓸 수 있는 방향으로 정리하라
- Prisma schema에는 User, Notice, RankingEntry 정도는 포함하라

출력 시:
- schema.prisma 포함 모든 파일 전체 코드
- 실행 커맨드
- 예상 엔드포인트 목록
```

---

## 5. Phase 3 프롬프트 — Phaser를 React에 임베드

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 3이다.
목표:
- apps/web의 /game 페이지에서 Phaser 게임을 렌더링한다
- packages/game에 Phaser 초기 구조를 만든다
- 아래 Scene을 만든다:
  BootScene
  PreloadScene
  MenuScene
  GameScene
  UiScene
  ResultScene
- React와 Phaser를 연결하는 최소 bridge 인터페이스를 만든다
- /game 페이지 진입 시 게임이 생성되고 이탈 시 정리되게 한다

요구사항:
- Phaser 코드는 React 컴포넌트 안에 직접 길게 쓰지 말고 game 패키지에 둔다
- React는 container div와 lifecycle만 관리한다
- placeholder graphics 사용
- 아직 게임 플레이 전체는 넣지 않아도 된다
- Scene 전환이 보이도록 최소 동작을 구현한다

출력 시:
- 생성/수정 파일 전체 코드
- React와 Phaser 연결 구조 설명
- 브라우저에서 확인할 수 있는 동작
```

---

## 6. Phase 4 프롬프트 — 타워디펜스 MVP 구현

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 4이다.
목표:
- GameScene 중심으로 타워디펜스 MVP를 구현한다
- 적 path 이동
- 웨이브 시스템
- build slot 설치
- 타워 3종
- 적 4종
- 발사체
- 골드 / 라이프 / 승패
- UiScene과 연결

구체 요구사항:
- 자유 배치 금지, build slot 방식
- 고정 경로 방식
- 타워: arrow, cannon, frost
- 적: grunt, runner, tank, boss
- 웨이브 10개
- 타워 업그레이드 2단계
- x1 / x2 속도
- pause 버튼
- placeholder graphics
- 데이터 중심 구조로 구현
- entities, managers, data 폴더를 분리

출력 시:
- 모든 새/수정 파일 전체 코드
- 파일 구조 요약
- 플레이 테스트 체크리스트
```

---

## 7. Phase 5 프롬프트 — 웹 기능과 게임 결과 제출 연결

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 5이다.
목표:
- 공지 목록/상세 API 연동
- 랭킹 목록 API 연동
- 로그인 상태에 따른 접근 제어 기본 구현
- 게임 종료 시 결과를 React가 받아 API로 제출하는 흐름 구현

요구사항:
- TanStack Query로 서버 데이터 호출
- React Router로 보호 라우트 구현
- Phaser가 runFinished 이벤트를 보내면 React가 이를 받아 submit API 호출
- 아직 결제는 제외
- 로딩/에러/빈 상태를 최소한으로 처리

출력 시:
- 전체 코드
- 어떤 페이지에서 어떤 API가 호출되는지 표로 정리
```

---

## 8. Phase 6 프롬프트 — 상점/인벤토리

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 6이다.
목표:
- 상품 목록 페이지 구현
- 구매 요청 API 구현
- 인벤토리 조회 API 구현
- 구매 성공 시 인벤토리 반영 흐름 구현

요구사항:
- Product, Order, InventoryItem 모델을 추가/정리
- shop / inventory 모듈 분리
- 아직 실제 결제사 SDK는 붙이지 말고 mock provider 또는 pending 상태로 처리
- 프론트는 상품 리스트, 구매 버튼, 결과 상태 표시를 구현

출력 시:
- 전체 코드
- 데이터 모델 변경점
- 엔드포인트 목록
```

---

## 9. Phase 7 프롬프트 — 결제 Provider Adapter

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 7이다.
목표:
- payments 모듈에 provider adapter 패턴을 도입
- 결제 요청 생성
- 결제 결과 복귀 처리
- 서버 승인 검증 후 주문 확정
- 지급 처리 트랜잭션 반영

요구사항:
- PaymentProvider 인터페이스를 만든다
- 최소 1개 mock provider 구현
- 나중에 실제 결제사로 교체 가능해야 한다
- 프론트에서 /payment/checkout, /payment/result 흐름을 만든다
- 프론트 콜백만 믿고 주문 확정하지 말고 서버 검증 후 확정한다

출력 시:
- 전체 코드
- provider 구조 설명
- 시퀀스 흐름 설명
```

---

## 10. Phase 8 프롬프트 — 하드닝과 정리

```text
위 마스터 프롬프트를 따른다.

지금은 Phase 8이다.
목표:
- 에러 처리 통일
- 로딩/빈 상태 정리
- 코드 중복 제거
- DTO / shared types 정리
- 랭킹 제출 검증 보강
- 환경 변수 정리
- 문서화

요구사항:
- 불필요한 any 제거
- 중복 타입 제거
- API 응답 형식 통일
- 게임 결과 검증 로직에 최소 안전장치 추가
- README 수준 실행 문서를 만든다

출력 시:
- 수정 파일 전체 코드
- 정리한 항목 목록
- 남은 리스크 목록
```

---

## 11. AI 코드 작성 세부 규칙

```text
아래 규칙을 반드시 지켜라.

1. TypeScript strict 모드에 맞게 작성하라.
2. any 대신 구체 타입 또는 unknown + narrowing을 사용하라.
3. 주석은 핵심 로직에만 짧게 달아라.
4. React 컴포넌트는 과도하게 비대해지지 않게 분리하라.
5. Phaser Scene은 책임별로 매니저/엔티티로 분리하라.
6. 서버 모듈은 controller/service/dto 구조를 유지하라.
7. Prisma 모델 변경 시 migration 관점도 함께 고려하라.
8. API 계약은 shared 패키지 타입을 우선 사용하라.
9. 빌드가 깨질 가능성이 큰 모호한 코드는 넣지 마라.
10. 가능하면 임시 mock 데이터도 타입을 맞춰라.
```

---

## 12. AI에게 마지막으로 붙일 단문 지시

```text
한 번에 전부 구현하지 말고, 지금 단계에서 필요한 최소 기능만 완전하게 구현하라.
실행 가능한 코드가 가장 중요하다.
설명보다 코드와 파일 구조를 우선하라.
```
