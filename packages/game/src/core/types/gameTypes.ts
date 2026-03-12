export type TowerKind = "arrow" | "cannon" | "frost";
export type EnemyKind = "grunt" | "runner" | "tank" | "boss";
export type GameSpeed = 1 | 2;
export type GameModeId = "mode-a";
export type StageId = "han-river-front" | "metro-grid" | "red-canyon";
export type StageTerrainKind = "grassAlt" | "sand";
export type StagePropKind =
  | "crateMetal"
  | "sandbag"
  | "treeLarge"
  | "treeSmall"
  | "barricade";
export type TowerSpecialEffect = "overdrive" | "blast-nova" | "freeze-nova";

export interface Point {
  x: number;
  y: number;
}

export interface BuildSlotDefinition {
  id: string;
  x: number;
  y: number;
}

export interface EnemyDefinition {
  key: EnemyKind;
  displayName: string;
  color: number;
  maxHp: number;
  speed: number;
  reward: number;
  radius: number;
}

export interface TowerLevelDefinition {
  damage: number;
  range: number;
  fireRateMs: number;
  projectileSpeed: number;
  projectileSize: number;
  upgradeCost?: number;
  splashRadius?: number;
  slowMultiplier?: number;
  slowDurationMs?: number;
  slowRadius?: number;
  burstCount?: number;
  specialEffect?: TowerSpecialEffect;
}

export interface TowerDefinition {
  key: TowerKind;
  displayName: string;
  color: number;
  buildCost: number;
  levels: TowerLevelDefinition[];
}

export interface WaveGroupDefinition {
  enemyType: EnemyKind;
  count: number;
  intervalMs: number;
  initialDelayMs: number;
}

export interface WaveDefinition {
  index: number;
  groups: WaveGroupDefinition[];
}

export interface StageDecorationZone {
  kind: StageTerrainKind;
  x: number;
  y: number;
  cols: number;
  rows: number;
  alpha?: number;
}

export interface StagePropDefinition {
  kind: StagePropKind;
  x: number;
  y: number;
  scale?: number;
  angle?: number;
  alpha?: number;
  depth?: number;
}

export interface StageDefinition {
  id: StageId;
  name: string;
  description: string;
  width: number;
  height: number;
  initialGold: number;
  initialLives: number;
  path: Point[];
  buildSlots: BuildSlotDefinition[];
  zones?: StageDecorationZone[];
  props?: StagePropDefinition[];
}

export interface GameStateSnapshot {
  stageId: StageId;
  stageName: string;
  gameMode: GameModeId;
  modeName: string;
  gold: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  nextWaveSummary: string;
  speed: GameSpeed;
  score: number;
  running: boolean;
  paused: boolean;
  enemiesAlive: number;
}

export interface SelectedTowerInfo {
  type: TowerKind;
  displayName: string;
  level: number;
  sellValue: number;
  upgradeCost: number | null;
  isMaxLevel: boolean;
  specialEffect: TowerSpecialEffect | null;
}

export interface GameSelection {
  slotId: string;
  tower?: SelectedTowerInfo;
}

export interface GameRunFinishedPayload {
  result: GameRunResult;
}

export interface GameRunResult {
  stageId: StageId;
  cleared: boolean;
  score: number;
  bestWave: number;
  remainingLives: number;
  goldSpent: number;
  durationMs: number;
  playedAt: string;
  summary: string;
}

export interface ProjectileConfig {
  color: number;
  speed: number;
  size: number;
  damage: number;
  spriteKey: string;
  effectKind: "hit" | "explosion" | "freeze";
  splashRadius?: number;
  slowMultiplier?: number;
  slowDurationMs?: number;
  slowRadius?: number;
  burstCount?: number;
  specialEffect?: TowerSpecialEffect;
}

export interface GameBridgeConfig {
  gameMode: GameModeId;
  stageId: StageId;
}
