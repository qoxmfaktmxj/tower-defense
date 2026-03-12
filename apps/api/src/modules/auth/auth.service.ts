import { Inject, Injectable } from "@nestjs/common";
import { mockUser } from "../../data/mock-data";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async login(payload: LoginDto) {
    const nickname = payload.nickname?.trim() || mockUser.nickname;
    const user = await this.prisma.user.upsert({
      where: {
        email: payload.email
      },
      update: {
        nickname
      },
      create: {
        email: payload.email,
        nickname,
        role: "PLAYER"
      }
    });

    await this.ensureSupportData(user.id);
    return this.getSessionByEmail(payload.email);
  }

  async getSession() {
    const existingUser = await this.prisma.user.findFirst({
      include: {
        currencies: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    if (!existingUser) {
      await this.login({
        email: mockUser.email,
        nickname: mockUser.nickname
      });
      return this.getSessionByEmail(mockUser.email);
    }

    return {
      id: existingUser.id,
      email: existingUser.email,
      nickname: existingUser.nickname,
      role: existingUser.role,
      gold: existingUser.currencies?.gold ?? 0,
      gems: existingUser.currencies?.gem ?? 0
    };
  }

  private async getSessionByEmail(email: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email
      },
      include: {
        currencies: true
      }
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      gold: user.currencies?.gold ?? mockUser.gold,
      gems: user.currencies?.gem ?? mockUser.gems
    };
  }

  private async ensureSupportData(userId: string) {
    await this.prisma.userCurrency.upsert({
      where: {
        userId
      },
      update: {},
      create: {
        userId,
        gold: mockUser.gold,
        gem: mockUser.gems
      }
    });
    await this.prisma.playerProgress.upsert({
      where: {
        userId
      },
      update: {},
      create: {
        userId,
        currentStage: 1,
        stars: 0
      }
    });
  }
}
