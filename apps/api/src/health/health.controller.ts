import { Controller, Get, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    const database = await this.prisma.isHealthy().then(
      () => "connected",
      () => "disconnected"
    );

    return {
      status: "ok",
      service: "tower-defense-api",
      database,
      timestamp: new Date().toISOString()
    };
  }
}
