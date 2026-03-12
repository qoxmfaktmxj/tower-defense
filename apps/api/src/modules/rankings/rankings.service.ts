import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubmitRankingDto } from "./dto/submit-ranking.dto";

const suspiciousResult = (payload: SubmitRankingDto): boolean => {
  const impossibleClear = payload.result.cleared && payload.result.durationMs < 45000;
  const impossibleScore = payload.result.score > payload.result.bestWave * 2500 + 5000;
  return impossibleClear || impossibleScore;
};

const nicknameToEmail = (nickname: string) =>
  `guest-${Array.from(nickname)
    .map((character) => character.codePointAt(0)?.toString(16) ?? "00")
    .join("")}@local.td`;

@Injectable()
export class RankingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll() {
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
        name: "시범 시즌 1",
        isActive: true,
        startedAt: now,
        endedAt: later
      }
    });
  }
}
