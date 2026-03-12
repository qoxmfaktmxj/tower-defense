import Phaser from "phaser";
import { GAME_COMMANDS, type GameCommandMap } from "./gameCommands";
import { GAME_EVENTS, type GameEventMap } from "./gameEvents";
import { GAME_HEIGHT, GAME_WIDTH } from "../core/config/gameConfig";
import { BootScene } from "../scenes/BootScene";
import { GameScene } from "../scenes/GameScene";
import { MenuScene } from "../scenes/MenuScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { ResultScene } from "../scenes/ResultScene";
import { UiScene } from "../scenes/UiScene";
import type { GameBridgeConfig, GameSpeed, TowerKind } from "../core/types/gameTypes";

export interface GameBridge {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setGameSpeed: (speed: GameSpeed) => void;
  setSoundVolume: (volume: number) => void;
  buildTower: (slotId: string, towerType: TowerKind) => void;
  upgradeTower: (slotId: string) => void;
  sellTower: (slotId: string) => void;
  destroyGame: () => void;
  on: <T extends keyof GameEventMap>(
    event: T,
    handler: (payload: GameEventMap[T]) => void
  ) => () => void;
}

interface GameBridgeOptions extends GameBridgeConfig {
  container: HTMLElement;
}

export const createGameBridge = ({
  container,
  gameMode,
  stageId
}: GameBridgeOptions): GameBridge => {
  const bus = new Phaser.Events.EventEmitter();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: container,
    backgroundColor: "#081318",
    pixelArt: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    callbacks: {
      preBoot: (instance) => {
        instance.registry.set("bridgeBus", bus);
        instance.registry.set("soundVolume", 0.75);
        instance.registry.set("gameMode", gameMode);
        instance.registry.set("stageId", stageId);
      }
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, UiScene, ResultScene]
  });

  const emitCommand = <T extends keyof GameCommandMap>(
    command: T,
    payload?: GameCommandMap[T]
  ) => {
    bus.emit(GAME_COMMANDS[command], payload);
  };

  return {
    startGame: () => emitCommand("startGame"),
    pauseGame: () => emitCommand("pauseGame"),
    resumeGame: () => emitCommand("resumeGame"),
    setGameSpeed: (speed) => emitCommand("setGameSpeed", { speed }),
    setSoundVolume: (volume) => emitCommand("setSoundVolume", { volume }),
    buildTower: (slotId, towerType) => emitCommand("buildTower", { slotId, towerType }),
    upgradeTower: (slotId) => emitCommand("upgradeTower", { slotId }),
    sellTower: (slotId) => emitCommand("sellTower", { slotId }),
    destroyGame: () => {
      emitCommand("destroyGame");
      game.destroy(true);
    },
    on: (event, handler) => {
      const eventName = GAME_EVENTS[event];
      const wrapped = (payload: GameEventMap[typeof event]) => handler(payload);
      bus.on(eventName, wrapped);
      return () => {
        bus.off(eventName, wrapped);
      };
    }
  };
};
