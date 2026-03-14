import Phaser from "phaser";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameModeId, GameRunResult } from "../core/types/gameTypes";
import { defaultGameModeId, getGameModeDefinition } from "../data/gameModes";
import { getStageDefinition } from "../data/stages/stageDefinitions";
import { resolveStageTheme } from "../data/stages/resolveStageTheme";
import { createStagePreview } from "./helpers/createStagePreview";

const FONT_FAMILY = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const LABEL_FONT = '"Kenney Future Narrow", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Result);
  }

  create(data: { result: GameRunResult }) {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    const result = data.result;
    const stage = getStageDefinition(result.stageId);
    const theme = resolveStageTheme(getGameModeDefinition(modeId), stage);
    const backgroundTint = Phaser.Display.Color.HexStringToColor(theme.visuals.backgroundColor).color;
    const accent = result.cleared ? theme.visuals.startTint : theme.visuals.endTint;

    this.add.rectangle(480, 270, 960, 540, backgroundTint, 0.72).setDepth(40);
    this.add.rectangle(480, 270, 960, 540, 0x02070b, 0.44).setDepth(40);
    this.add.circle(160, 120, 180, stage.atmosphere.glowTint, 0.1).setDepth(40);
    this.add.circle(812, 410, 210, stage.atmosphere.glowTintAlt, 0.1).setDepth(40);

    this.add
      .rectangle(480, 270, 728, 394, 0x071118, 0.96)
      .setStrokeStyle(2, accent, 0.72)
      .setDepth(41);

    this.add.text(480, 112, result.cleared ? "방어 성공" : "방어 실패", {
      fontFamily: FONT_FAMILY,
      fontSize: "34px",
      fontStyle: "700",
      color: "#eef7fc"
    }).setOrigin(0.5).setDepth(42);

    this.add.text(480, 152, `${stage.name} · ${stage.presentation.tagline}`, {
      fontFamily: FONT_FAMILY,
      fontSize: "18px",
      color: "#9db2bf"
    }).setOrigin(0.5).setDepth(42);

    createStagePreview(this, stage, {
      x: 252,
      y: 274,
      width: 256,
      height: 174,
      backgroundTint: stage.atmosphere.panelTint,
      frameTint: stage.atmosphere.panelStrokeTint,
      accentTint: theme.visuals.endTint,
      secondaryTint: stage.atmosphere.pathGuideTint
    }).setDepth(42);

    this.add.text(
      414,
      198,
      `${result.summary}\n\n점수 ${result.score}\n최고 웨이브 ${result.bestWave}\n잔여 생명 ${result.remainingLives}\n전투 시간 ${formatDuration(result.durationMs)}\n사용 골드 ${result.goldSpent}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: "18px",
        color: "#eef7fc",
        lineSpacing: 10
      }
    ).setDepth(42);

    this.add.text(414, 390, "전술 메모", {
      fontFamily: LABEL_FONT,
      fontSize: "12px",
      color: "#7fdfff"
    }).setDepth(42);
    this.add.text(414, 414, stage.presentation.tacticalNote, {
      fontFamily: FONT_FAMILY,
      fontSize: "15px",
      color: "#c4d5df",
      lineSpacing: 6,
      wordWrap: { width: 294 }
    }).setDepth(42);

    const restartButton = this.add
      .rectangle(480, 468, 236, 58, accent, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(42);
    this.add.text(480, 468, "다시 출격", {
      fontFamily: FONT_FAMILY,
      fontSize: "23px",
      fontStyle: "700",
      color: "#041016"
    }).setOrigin(0.5).setDepth(43);

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
