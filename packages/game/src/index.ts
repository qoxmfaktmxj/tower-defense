export { createGameBridge } from "./bridge/createGameBridge";
export { towerCatalog, getWaveSummary, gameModeCatalog, stageCatalog } from "./gameCatalog";
export { getStageDefinition } from "./data/stages/stageDefinitions";
export { getWaveDefinitions, TOTAL_WAVES_PER_STAGE } from "./data/waves/waveDefinitions";
export type { GameBridge } from "./bridge/createGameBridge";
export type {
  GameBridgeConfig,
  GameModeId,
  GameRunFinishedPayload,
  GameSelection,
  GameStateSnapshot,
  StageId,
  TowerKind
} from "./core/types/gameTypes";
