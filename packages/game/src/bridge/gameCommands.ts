import type { GameSpeed, TowerKind } from "../core/types/gameTypes";

export interface GameCommandMap {
  startGame: undefined;
  pauseGame: undefined;
  resumeGame: undefined;
  setGameSpeed: { speed: GameSpeed };
  setSoundVolume: { volume: number };
  destroyGame: undefined;
  buildTower: { slotId: string; towerType: TowerKind };
  upgradeTower: { slotId: string };
  sellTower: { slotId: string };
}

export const GAME_COMMANDS = {
  startGame: "command:startGame",
  pauseGame: "command:pauseGame",
  resumeGame: "command:resumeGame",
  setGameSpeed: "command:setGameSpeed",
  setSoundVolume: "command:setSoundVolume",
  destroyGame: "command:destroyGame",
  buildTower: "command:buildTower",
  upgradeTower: "command:upgradeTower",
  sellTower: "command:sellTower"
} as const;
