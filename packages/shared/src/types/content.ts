export type UserRole = "PLAYER" | "ADMIN";

export type CurrencyType = "KRW" | "GEM";

export interface SessionUser {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  gold: number;
  gems: number;
}

export interface Notice {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: "업데이트" | "점검" | "이벤트";
  publishedAt: string;
}

export interface RankingEntry {
  id: string;
  rank: number;
  nickname: string;
  score: number;
  bestWave: number;
  cleared: boolean;
  playedAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currencyType: CurrencyType;
  badge?: string;
}
