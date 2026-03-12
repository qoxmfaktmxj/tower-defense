import type { GameRunResult } from "../types/game";

export interface SubmitGameResultDto {
  nickname: string;
  result: GameRunResult;
}
