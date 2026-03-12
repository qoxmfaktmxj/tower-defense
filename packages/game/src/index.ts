export { createGameBridge } from "./bridge/createGameBridge";
export { towerCatalog, getWaveSummary, gameModeCatalog, stageCatalog } from "./gameCatalog";
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
