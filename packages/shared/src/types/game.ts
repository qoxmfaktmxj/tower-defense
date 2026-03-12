export type TowerKind = "arrow" | "cannon" | "frost";
export type EnemyKind = "grunt" | "runner" | "tank" | "boss";

export interface GameRunResult {
  stageId: string;
  cleared: boolean;
  score: number;
  bestWave: number;
  remainingLives: number;
  goldSpent: number;
  durationMs: number;
  playedAt: string;
  summary: string;
}
