import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private available = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.available = true;
    } catch (error) {
      this.available = false;
      this.logger.warn("Database connection failed. API will start in degraded mode.");
      this.logger.debug(String(error));
    }
  }

  async onModuleDestroy() {
    if (!this.available) {
      return;
    }

    await this.$disconnect();
  }

  isAvailable() {
    return this.available;
  }

  async isHealthy() {
    if (!this.available) {
      throw new Error("database unavailable");
    }

    await this.$queryRaw`SELECT 1`;
    return true;
  }
}
