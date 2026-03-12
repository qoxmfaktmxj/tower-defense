import Phaser from "phaser";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { GAME_EVENTS } from "../bridge/gameEvents";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameModeId, StageId } from "../core/types/gameTypes";
import { defaultGameModeId, getGameModeDefinition } from "../data/gameModes";
import { defaultStageId, getStageDefinition } from "../data/stages/stageDefinitions";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Menu);
  }

  create() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    const stageId = (this.game.registry.get("stageId") as StageId | undefined) ?? defaultStageId;
    const mode = getGameModeDefinition(modeId);
    const stage = getStageDefinition(stageId);

    this.add.rectangle(480, 270, 960, 540, 0x071118, 0.88);
    this.add.circle(800, 110, 150, 0x25c3f1, 0.1);
    this.add.circle(160, 420, 180, 0xf4c15b, 0.08);
    this.add
      .text(56, 68, "타워 디펜스", {
        fontFamily: "Kenney Future, Pretendard, sans-serif",
        fontSize: "36px",
        color: "#f4fbfd"
      })
      .setDepth(2);
    this.add.text(56, 118, `${mode.name} · ${stage.name}`, {
      fontFamily: "Pretendard, Noto Sans KR, sans-serif",
      fontSize: "18px",
      color: "#9ed8df"
    });
    this.add.text(
      56,
      188,
      `작전 개요\n- 총 20개 웨이브를 방어합니다.\n- 타워는 5레벨까지 강화할 수 있습니다.\n- 5레벨 달성 시 오버드라이브 효과가 발동합니다.`,
      {
        fontFamily: "Pretendard, Noto Sans KR, sans-serif",
        fontSize: "20px",
        color: "#e7f5f8",
        lineSpacing: 10
      }
    );

    const startButton = this.add
      .rectangle(210, 432, 268, 64, 0x69d7f2, 1)
      .setStrokeStyle(3, 0xf4c15b, 0.82)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(210, 432, "전투 시작", {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "28px",
        color: "#081218"
      })
      .setOrigin(0.5);

    const launchGame = () => {
      this.scene.start(SCENE_KEYS.Game, { autoStart: true });
    };

    bus.emit(GAME_EVENTS.onGameReady, undefined);
    bus.on(GAME_COMMANDS.startGame, launchGame);
    startButton.on("pointerdown", launchGame);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_COMMANDS.startGame, launchGame);
    });
  }
}
