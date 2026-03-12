export const mockUser = {
  id: "player-kim",
  email: "commander@towerdefense.kr",
  nickname: "지휘관 김",
  role: "PLAYER",
  gold: 3200,
  gems: 120
};

export const mockNotices = [
  {
    id: "notice-1",
    title: "시범 빌드 오픈 안내",
    summary: "로비와 전장, 상점과 랭킹이 모두 한국어로 준비되어 있습니다.",
    body: "시범 빌드가 열렸습니다. 웹셸과 인게임 UI를 모두 한국어 기준으로 구성했으며, 현재는 1개 스테이지와 10개 웨이브가 제공됩니다.",
    category: "업데이트",
    publishedAt: "2026-03-12T09:00:00+09:00"
  },
  {
    id: "notice-2",
    title: "결과 제출 검증 안내",
    summary: "클리어 시간과 점수 조합을 바탕으로 랭킹 기록을 검증합니다.",
    body: "너무 짧은 클리어 시간이나 비정상적인 점수는 의심 기록으로 분류됩니다. MVP 단계에서는 최소한의 서버 검증을 적용합니다.",
    category: "점검",
    publishedAt: "2026-03-11T18:30:00+09:00"
  }
];

export const mockProducts = [
  {
    id: "product-1",
    code: "starter-pack",
    name: "사령부 스타터 팩",
    description: "골드와 보석을 묶어 제공하는 입문 패키지입니다.",
    price: 5500,
    currencyType: "KRW",
    badge: "추천"
  },
  {
    id: "product-2",
    code: "gem-crate",
    name: "보급 보석 상자",
    description: "보석 500개를 지급합니다.",
    price: 9900,
    currencyType: "KRW"
  }
];

export const mockRankings = [
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
  }
];
