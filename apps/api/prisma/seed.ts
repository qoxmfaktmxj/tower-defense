import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { mockNotices, mockProducts, mockRankings, mockUser } from "../src/data/mock-data";

const prisma = new PrismaClient();

const noticeCategoryMap = {
  업데이트: "UPDATE",
  점검: "MAINTENANCE",
  이벤트: "EVENT"
} as const;

const nicknameToEmail = (nickname: string) =>
  `seed-${Array.from(nickname)
    .map((character) => character.codePointAt(0)?.toString(16) ?? "00")
    .join("")}@local.td`;

async function main() {
  await prisma.rankingEntry.deleteMany();
  await prisma.gameRun.deleteMany();
  await prisma.order.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.season.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.userCurrency.deleteMany();
  await prisma.user.deleteMany();

  const commander = await prisma.user.create({
    data: {
      email: mockUser.email,
      nickname: mockUser.nickname,
      role: mockUser.role,
      currencies: {
        create: {
          gold: mockUser.gold,
          gem: mockUser.gems
        }
      },
      progress: {
        create: {
          currentStage: 1,
          stars: 3
        }
      }
    }
  });

  const season = await prisma.season.create({
    data: {
      name: "시범 시즌 1",
      isActive: true,
      startedAt: new Date("2026-03-01T00:00:00+09:00"),
      endedAt: new Date("2026-03-31T23:59:59+09:00")
    }
  });

  await prisma.notice.createMany({
    data: mockNotices.map((notice) => ({
      title: notice.title,
      summary: notice.summary,
      body: notice.body,
      category: noticeCategoryMap[notice.category],
      isPublished: true,
      publishedAt: new Date(notice.publishedAt)
    }))
  });

  await prisma.product.createMany({
    data: mockProducts.map((product) => ({
      code: product.code,
      name: product.name,
      description: product.description,
      badge: product.badge ?? null,
      price: product.price,
      currencyType: product.currencyType,
      isActive: true
    }))
  });

  for (const ranking of mockRankings) {
    const user = await prisma.user.create({
      data: {
        email: nicknameToEmail(ranking.nickname),
        nickname: ranking.nickname,
        role: "PLAYER",
        currencies: {
          create: {
            gold: 0,
            gem: 0
          }
        },
        progress: {
          create: {
            currentStage: 1,
            stars: 0
          }
        }
      }
    });

    await prisma.rankingEntry.create({
      data: {
        seasonId: season.id,
        userId: user.id,
        score: ranking.score,
        bestWave: ranking.bestWave,
        cleared: ranking.cleared,
        createdAt: new Date(ranking.playedAt)
      }
    });

    await prisma.gameRun.create({
      data: {
        userId: user.id,
        stageId: "han-river-front",
        score: ranking.score,
        bestWave: ranking.bestWave,
        cleared: ranking.cleared,
        durationMs: 92_000,
        suspicious: false,
        validationStatus: "ACCEPTED",
        startedAt: new Date(new Date(ranking.playedAt).getTime() - 92_000),
        finishedAt: new Date(ranking.playedAt)
      }
    });
  }

  await prisma.gameRun.create({
    data: {
      userId: commander.id,
      stageId: "han-river-front",
      score: 8_420,
      bestWave: 8,
      cleared: false,
      durationMs: 74_000,
      suspicious: false,
      validationStatus: "ACCEPTED",
      startedAt: new Date("2026-03-12T10:00:00+09:00"),
      finishedAt: new Date("2026-03-12T10:01:14+09:00")
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
