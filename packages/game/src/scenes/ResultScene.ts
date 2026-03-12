import Phaser from "phaser";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameRunResult } from "../core/types/gameTypes";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Result);
  }

  create(data: { result: GameRunResult }) {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const result = data.result;

    this.add.rectangle(480, 270, 960, 540, 0x02080b, 0.72).setDepth(40);
    this.add
      .rectangle(480, 270, 450, 300, 0x0f1b22, 0.98)
      .setStrokeStyle(2, result.cleared ? 0x69d7f2 : 0xf4c15b, 0.75)
      .setDepth(41);

    this.add
      .text(480, 168, result.cleared ? "방어 성공" : "방어 실패", {
        fontFamily: "Kenney Future, Pretendard, sans-serif",
        fontSize: "34px",
        color: result.cleared ? "#b9f1f6" : "#ffd89a"
      })
      .setOrigin(0.5)
      .setDepth(42);
    this.add
      .text(480, 236, result.summary, {
        fontFamily: "Pretendard, Noto Sans KR, sans-serif",
        fontSize: "18px",
        color: "#9ed8df",
        align: "center"
      })
      .setOrigin(0.5)
      .setDepth(42);
    this.add
      .text(
        480,
        300,
        `점수 ${result.score}\n최고 웨이브 ${result.bestWave}\n남은 생명 ${result.remainingLives}`,
        {
          fontFamily: "Pretendard, Noto Sans KR, sans-serif",
          fontSize: "22px",
          color: "#edf6f8",
          align: "center",
          lineSpacing: 10
        }
      )
      .setOrigin(0.5)
      .setDepth(42);

    const restartButton = this.add
      .rectangle(480, 404, 220, 56, 0x69d7f2, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(42);
    this.add
      .text(480, 404, "다시 출격", {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "24px",
        color: "#09161a"
      })
      .setOrigin(0.5)
      .setDepth(43);

    const restartRun = () => {
      this.scene.stop(SCENE_KEYS.Result);
      if (this.scene.isActive(SCENE_KEYS.Ui)) {
        this.scene.stop(SCENE_KEYS.Ui);
      }
      this.scene.start(SCENE_KEYS.Game, { autoStart: true });
    };

    bus.on(GAME_COMMANDS.startGame, restartRun);
    restartButton.on("pointerdown", restartRun);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_COMMANDS.startGame, restartRun);
    });
  }
}
