import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubmitRankingDto } from "./dto/submit-ranking.dto";

const MAX_REASONABLE_SCORE_PER_WAVE = 9_000;
const BASE_SCORE_ALLOWANCE = 15_000;

const suspiciousResult = (payload: SubmitRankingDto): boolean => {
  const impossibleClear = payload.result.cleared && payload.result.durationMs < 45000;
  const impossibleScore =
    payload.result.score >
    payload.result.bestWave * MAX_REASONABLE_SCORE_PER_WAVE + BASE_SCORE_ALLOWANCE;
  return impossibleClear || impossibleScore;
};

const nicknameToEmail = (nickname: string) =>
  `guest-${Array.from(nickname)
    .map((character) => character.codePointAt(0)?.toString(16) ?? "00")
    .join("")}@local.td`;

interface MemoryRankingEntry {
  id: string;
  nickname: string;
  score: number;
  bestWave: number;
  cleared: boolean;
  playedAt: string;
}

const memoryRankings: MemoryRankingEntry[] = [
  {
    id: "memory-rank-1",
    nickname: "지휘관 김",
    score: 18420,
    bestWave: 20,
    cleared: true,
    playedAt: new Date("2026-03-12T08:20:00+09:00").toISOString()
  },
  {
    id: "memory-rank-2",
    nickname: "빙결전술",
    score: 17280,
    bestWave: 19,
    cleared: false,
    playedAt: new Date("2026-03-12T07:45:00+09:00").toISOString()
  }
];

@Injectable()
export class RankingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll() {
    if (!this.prisma.isAvailable()) {
      return this.getMemoryRankings();
    }

    const entries = await this.prisma.rankingEntry.findMany({
      include: {
        user: true
      },
      orderBy: [{ score: "desc" }, { bestWave: "desc" }, { createdAt: "asc" }],
      take: 50
    });

    return entries.map((entry, index) => ({
      id: entry.id,
      nickname: entry.user.nickname,
      score: entry.score,
      bestWave: entry.bestWave,
      cleared: entry.cleared,
      playedAt: entry.createdAt.toISOString(),
      rank: index + 1
    }));
  }

  async submit(payload: SubmitRankingDto) {
    const suspicious = suspiciousResult(payload);
    if (!this.prisma.isAvailable()) {
      if (!suspicious) {
        memoryRankings.push({
          id: `memory-rank-${memoryRankings.length + 1}`,
          nickname: payload.nickname,
          score: payload.result.score,
          bestWave: payload.result.bestWave,
          cleared: payload.result.cleared,
          playedAt: payload.result.playedAt
        });
      }

      return {
        accepted: !suspicious,
        suspicious,
        rankings: this.getMemoryRankings()
      };
    }

    const user = await this.prisma.user.upsert({
      where: {
        email: nicknameToEmail(payload.nickname)
      },
      update: {
        nickname: payload.nickname
      },
      create: {
        email: nicknameToEmail(payload.nickname),
        nickname: payload.nickname,
        role: "PLAYER"
      }
    });

    await this.prisma.userCurrency.upsert({
      where: {
        userId: user.id
      },
      update: {},
      create: {
        userId: user.id,
        gold: 0,
        gem: 0
      }
    });

    const finishedAt = new Date(payload.result.playedAt);
    const startedAt = new Date(finishedAt.getTime() - payload.result.durationMs);

    await this.prisma.gameRun.create({
      data: {
        userId: user.id,
        stageId: payload.result.stageId,
        score: payload.result.score,
        bestWave: payload.result.bestWave,
        cleared: payload.result.cleared,
        durationMs: payload.result.durationMs,
        suspicious,
        validationStatus: suspicious ? "SUSPICIOUS" : "ACCEPTED",
        startedAt,
        finishedAt
      }
    });

    if (!suspicious) {
      const season = await this.ensureActiveSeason();
      await this.prisma.rankingEntry.create({
        data: {
          seasonId: season.id,
          userId: user.id,
          score: payload.result.score,
          bestWave: payload.result.bestWave,
          cleared: payload.result.cleared
        }
      });
    }

    return {
      accepted: !suspicious,
      suspicious,
      rankings: await this.findAll()
    };
  }

  private getMemoryRankings() {
    return [...memoryRankings]
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        if (right.bestWave !== left.bestWave) {
          return right.bestWave - left.bestWave;
        }
        return left.playedAt.localeCompare(right.playedAt);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }

  private async ensureActiveSeason() {
    const activeSeason = await this.prisma.season.findFirst({
      where: {
        isActive: true
      }
    });

    if (activeSeason) {
      return activeSeason;
    }

    const now = new Date();
    const later = new Date(now);
    later.setDate(now.getDate() + 30);

    return this.prisma.season.create({
      data: {
        name: "프리시즌 1",
        isActive: true,
        startedAt: now,
        endedAt: later
      }
    });
  }
}
