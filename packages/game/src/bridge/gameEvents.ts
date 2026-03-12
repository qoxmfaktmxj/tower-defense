import type {
  GameRunFinishedPayload,
  GameSelection,
  GameStateSnapshot
} from "../core/types/gameTypes";

export interface GameErrorPayload {
  message: string;
}

export interface GameEventMap {
  onGameReady: undefined;
  onRunStarted: { stageId: string };
  onWaveChanged: { currentWave: number; totalWaves: number };
  onGoldChanged: { gold: number };
  onLifeChanged: { lives: number };
  onStateChanged: GameStateSnapshot;
  onSelectionChanged: GameSelection | null;
  onRunFinished: GameRunFinishedPayload;
  onError: GameErrorPayload;
}

export const GAME_EVENTS = {
  onGameReady: "onGameReady",
  onRunStarted: "onRunStarted",
  onWaveChanged: "onWaveChanged",
  onGoldChanged: "onGoldChanged",
  onLifeChanged: "onLifeChanged",
  onStateChanged: "onStateChanged",
  onSelectionChanged: "onSelectionChanged",
  onRunFinished: "onRunFinished",
  onError: "onError"
} as const;
