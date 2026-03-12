import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";

class RankingResultDto {
  @IsString()
  stageId!: string;

  @IsBoolean()
  cleared!: boolean;

  @IsInt()
  @Min(0)
  score!: number;

  @IsInt()
  @Min(1)
  bestWave!: number;

  @IsInt()
  @Min(0)
  remainingLives!: number;

  @IsInt()
  @Min(0)
  goldSpent!: number;

  @IsInt()
  @Min(1000)
  durationMs!: number;

  @IsISO8601()
  playedAt!: string;

  @IsString()
  summary!: string;
}

export class SubmitRankingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(12)
  nickname!: string;

  @ValidateNested()
  @Type(() => RankingResultDto)
  result!: RankingResultDto;
}
