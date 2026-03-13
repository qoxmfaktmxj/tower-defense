import {
  mockRankingEntries,
  mockSessionUser,
  type RankingEntry,
  type SessionUser,
  type SubmitGameResultDto
} from "@tower-defense/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const LOCAL_RANKING_KEY = "tower-defense-local-rankings";
const MAX_REASONABLE_SCORE_PER_WAVE = 9_000;
const BASE_SCORE_ALLOWANCE = 15_000;

interface SubmitGameResultResponse {
  accepted: boolean;
  suspicious: boolean;
  rankings: RankingEntry[];
}

const parseLocalRankings = (): RankingEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const cached = window.localStorage.getItem(LOCAL_RANKING_KEY);
  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached) as RankingEntry[];
  } catch {
    return [];
  }
};

const writeLocalRankings = (rankings: RankingEntry[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_RANKING_KEY, JSON.stringify(rankings));
};

const rankEntries = (entries: RankingEntry[]) =>
  entries
    .slice()
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

const request = async <T>(path: string, fallback: () => T, options?: RequestInit) => {
  if (!API_BASE_URL) {
    return fallback();
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) {
      throw new Error("API 요청에 실패했습니다.");
    }
    return (await response.json()) as T;
  } catch {
    return fallback();
  }
};

export const getSession = async (): Promise<SessionUser> => {
  return request("/auth/session", () => mockSessionUser);
};

export const login = async ({
  email,
  nickname
}: {
  email: string;
  nickname: string;
}): Promise<SessionUser> => {
  return request(
    "/auth/login",
    () => ({
      ...mockSessionUser,
      email,
      nickname
    }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        nickname
      })
    }
  );
};

export const getRankings = async (): Promise<RankingEntry[]> => {
  return request("/rankings", () =>
    rankEntries([...mockRankingEntries, ...parseLocalRankings()])
  );
};

export const submitGameResult = async (
  payload: SubmitGameResultDto
): Promise<SubmitGameResultResponse> => {
  return request(
    "/rankings/submit",
    () => {
      const suspicious =
        (payload.result.cleared && payload.result.durationMs < 45_000) ||
        payload.result.score >
          payload.result.bestWave * MAX_REASONABLE_SCORE_PER_WAVE + BASE_SCORE_ALLOWANCE;

      const localRankings = parseLocalRankings();
      if (!suspicious) {
        localRankings.push({
          id: `local-${Date.now()}`,
          rank: localRankings.length + mockRankingEntries.length + 1,
          nickname: payload.nickname,
          score: payload.result.score,
          bestWave: payload.result.bestWave,
          cleared: payload.result.cleared,
          playedAt: payload.result.playedAt
        });
        writeLocalRankings(localRankings);
      }

      return {
        accepted: !suspicious,
        suspicious,
        rankings: rankEntries([...mockRankingEntries, ...localRankings])
      };
    },
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );
};
