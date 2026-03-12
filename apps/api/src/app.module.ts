import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { NoticesModule } from "./modules/notices/notices.module";
import { RankingsModule } from "./modules/rankings/rankings.module";
import { ShopModule } from "./modules/shop/shop.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    NoticesModule,
    RankingsModule,
    ShopModule
  ]
})
export class AppModule {}
