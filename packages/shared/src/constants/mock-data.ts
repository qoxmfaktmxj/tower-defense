import type { Notice, Product, RankingEntry, SessionUser } from "../types/content";

export const mockSessionUser: SessionUser = {
  id: "player-kim",
  email: "commander@towerdefense.kr",
  nickname: "지휘관 김",
  role: "PLAYER",
  gold: 3200,
  gems: 120
};

export const mockNotices: Notice[] = [
  {
    id: "notice-1",
    title: "시범 빌드 오픈 안내",
    summary: "한국어 UI와 첫 번째 방어전을 플레이할 수 있습니다.",
    body: "시범 빌드가 열렸습니다. 로비에서 공지와 랭킹을 확인하고, 게임 화면에서 10웨이브 방어전을 바로 플레이할 수 있습니다.",
    category: "업데이트",
    publishedAt: "2026-03-12T09:00:00+09:00"
  },
  {
    id: "notice-2",
    title: "랭킹 검증 정책 안내",
    summary: "클리어 시간과 점수 조합을 기준으로 비정상 기록을 걸러냅니다.",
    body: "랭킹은 클라이언트 제출값만으로 확정되지 않습니다. 너무 짧은 플레이 시간이나 불가능한 점수 조합은 저장 전에 검증됩니다.",
    category: "점검",
    publishedAt: "2026-03-11T18:30:00+09:00"
  },
  {
    id: "notice-3",
    title: "오픈 기념 보급품 지급",
    summary: "첫 로그인 시 보석 120개와 골드 3,200을 지급합니다.",
    body: "한국 서비스 오픈 기념으로 모든 시범 계정에 기본 보급품을 지급했습니다. 상점에서 패키지를 둘러보고 로비에서 바로 전장으로 출격해보세요.",
    category: "이벤트",
    publishedAt: "2026-03-10T10:00:00+09:00"
  }
];

export const mockRankingEntries: RankingEntry[] = [
  {
    id: "rank-1",
    rank: 1,
    nickname: "한강수호자",
    score: 12540,
    bestWave: 10,
    cleared: true,
    playedAt: "2026-03-12T08:20:00+09:00"
  },
  {
    id: "rank-2",
    rank: 2,
    nickname: "빙결포탑장인",
    score: 11810,
    bestWave: 10,
    cleared: true,
    playedAt: "2026-03-12T07:45:00+09:00"
  },
  {
    id: "rank-3",
    rank: 3,
    nickname: "화포중대",
    score: 9640,
    bestWave: 9,
    cleared: false,
    playedAt: "2026-03-11T23:15:00+09:00"
  }
];

export const mockProducts: Product[] = [
  {
    id: "product-1",
    code: "starter-pack",
    name: "사령부 스타터 팩",
    description: "초반 방어에 유용한 보석과 골드를 한 번에 제공합니다.",
    price: 5500,
    currencyType: "KRW",
    badge: "추천"
  },
  {
    id: "product-2",
    code: "gem-crate",
    name: "보급 보석 상자",
    description: "즉시 사용 가능한 보석 500개를 지급합니다.",
    price: 9900,
    currencyType: "KRW"
  },
  {
    id: "product-3",
    code: "battle-pass",
    name: "시범 시즌 패스",
    description: "시범 시즌 동안 보너스 임무와 추가 보상을 해금합니다.",
    price: 14900,
    currencyType: "KRW",
    badge: "신규"
  }
];
