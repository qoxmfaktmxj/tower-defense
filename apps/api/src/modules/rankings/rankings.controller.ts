import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { RankingsService } from "./rankings.service";
import { SubmitRankingDto } from "./dto/submit-ranking.dto";

@Controller("rankings")
export class RankingsController {
  constructor(@Inject(RankingsService) private readonly rankingsService: RankingsService) {}

  @Get()
  findAll() {
    return this.rankingsService.findAll();
  }

  @Post("submit")
  submit(@Body() payload: SubmitRankingDto) {
    return this.rankingsService.submit(payload);
  }
}
