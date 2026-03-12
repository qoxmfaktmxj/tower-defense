# 개발 가이드라인

## 기본 원칙

- 한국어 문구를 기본으로 유지합니다.
- 전투 규칙은 `packages/game`에서 관리합니다.
- 웹은 전투 객체를 직접 수정하지 않고 bridge 이벤트로만 연결합니다.
- DB는 `apps/api`에서만 접근합니다.
- 새로운 기능은 가능한 한 데이터 기반으로 추가합니다.

## 이 프로젝트에서 흔들리면 안 되는 것

### 1. 단일 테마 유지

현재 제품 방향은 `프론트라인` 단일 테마 집중입니다.

- 새로운 모드 테마를 바로 추가하지 않습니다.
- 시각 변형이 필요하면 기존 테마 안에서 품질을 올리는 방식으로 접근합니다.
- 다중 모드 복귀는 명확한 기획 결정 이후에만 진행합니다.

### 2. React와 Phaser 경계 유지

- React 컴포넌트는 Phaser 씬 내부 상태를 직접 보관하거나 수정하지 않습니다.
- 게임 상태는 bridge 이벤트로 받고, 명령도 bridge 메서드로만 보냅니다.
- `GamePage`에 과도한 게임 로직을 넣지 않습니다.

### 3. 데이터 위치 고정

아래 항목은 반드시 `packages/game/src/data` 중심으로 관리합니다.

- 맵
- 웨이브
- 타워 수치
- 적 수치

런타임 로직 안에 밸런스 숫자를 흩뿌리지 않는 것이 중요합니다.

### 4. DB 접근 규칙

- 웹에서 Prisma 또는 DB에 직접 연결하지 않습니다.
- API를 통해서만 데이터를 주고받습니다.
- 랭킹, 사용자, 인증, 공용 데이터는 API 응답 형태를 먼저 맞춥니다.

## 작업 전 확인 포인트

- 이 변경이 웹 UI 변경인지
- Phaser 전투 변경인지
- API/DB 변경인지
- 데이터 수정인지

영역을 먼저 나누고 작업하면 충돌이 크게 줄어듭니다.

## 권장 작업 흐름

1. 먼저 변경 범위를 좁힌다.
2. 관련 파일만 읽고 구조를 확인한다.
3. 데이터 수정과 런타임 수정을 분리한다.
4. 타입체크를 먼저 통과시킨다.
5. 빌드를 통과시킨다.
6. 브라우저에서 핵심 흐름을 직접 확인한다.

## 필수 검증

최소 검증:

```bash
corepack pnpm --filter @tower-defense/web typecheck
corepack pnpm build
```

권장 브라우저 검증:

- 로그인
- 로비 이동
- 게임 진입
- 맵 변경
- 출격 시작
- 타워 설치
- 업그레이드 또는 판매

## 파일 가이드

- 웹 라우팅: `apps/web/src/app/router.tsx`
- 메인 게임 페이지: `apps/web/src/pages/game/GamePage.tsx`
- Phaser 뷰포트 연결: `apps/web/src/components/game/GameViewport.tsx`
- 게임 씬: `packages/game/src/scenes/GameScene.ts`
- 맵 정의: `packages/game/src/data/stages/stageDefinitions.ts`
- 웨이브 정의: `packages/game/src/data/waves/waveDefinitions.ts`
- 타워 정의: `packages/game/src/data/towers/towerDefinitions.ts`
- API DB 스키마: `apps/api/prisma/schema.prisma`

## 주의 사항

- 무한 렌더를 피하려면 `GamePage`에서 상태 reset effect를 함부로 늘리지 않습니다.
- 모드/맵 전환처럼 Phaser 재생성이 필요한 흐름은 stale bridge가 남지 않게 처리합니다.
- 번들 크기 경고는 현재 알려진 상태입니다. 기능 변경과 함께 chunk 분리까지 한 번에 섞지 않는 편이 안전합니다.
- 임시 자산은 `.tmp-assets`, 테스트 산출물은 `output`, `.playwright-cli`에 두고 커밋하지 않습니다.

## 커밋 기준

- 한 커밋에는 한 가지 목적을 담습니다.
- 게임 밸런스 조정과 UI 대수선은 가능하면 분리합니다.
- 문서가 필요한 구조 변경이면 README나 가이드를 같이 업데이트합니다.
