import Phaser from "phaser";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { GAME_EVENTS } from "../bridge/gameEvents";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameModeId, StageId } from "../core/types/gameTypes";
import { defaultGameModeId, getGameModeDefinition } from "../data/gameModes";
import { defaultStageId, getStageDefinition } from "../data/stages/stageDefinitions";
import { resolveStageTheme } from "../data/stages/resolveStageTheme";
import { getWaveDefinitions } from "../data/waves/waveDefinitions";
import { createStagePreview } from "./helpers/createStagePreview";

const FONT_FAMILY = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const LABEL_FONT = '"Kenney Future Narrow", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Menu);
  }

  create() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    const stageId = (this.game.registry.get("stageId") as StageId | undefined) ?? defaultStageId;
    const stage = getStageDefinition(stageId);
    const theme = resolveStageTheme(getGameModeDefinition(modeId), stage);
    const totalWaves = getWaveDefinitions(stageId).length;
    const backgroundTint = Phaser.Display.Color.HexStringToColor(theme.visuals.backgroundColor).color;

    this.add.rectangle(480, 270, 960, 540, backgroundTint, 1);
    this.add.rectangle(480, 270, 960, 540, 0x02070b, 0.28);
    this.add.circle(172, 118, 190, stage.atmosphere.glowTint, stage.atmosphere.glowAlpha + 0.04);
    this.add.circle(804, 410, 220, stage.atmosphere.glowTintAlt, stage.atmosphere.glowAlpha + 0.02);
    this.add.rectangle(480, 40, 960, 120, 0x02070b, 0.2);
    this.add.rectangle(480, 500, 960, 120, 0x02070b, 0.24);

    const grid = this.add.graphics();
    grid.lineStyle(1, stage.atmosphere.pathGuideTint, 0.08);
    for (let x = 0; x <= 960; x += 48) {
      grid.lineBetween(x, 0, x, 540);
    }
    for (let y = 0; y <= 540; y += 48) {
      grid.lineBetween(0, y, 960, y);
    }

    this.add.text(64, 58, "PRE-ENGAGEMENT", {
      fontFamily: LABEL_FONT,
      fontSize: "14px",
      color: "#7fdfff"
    });
    this.add.text(64, 88, stage.name, {
      fontFamily: FONT_FAMILY,
      fontSize: "38px",
      fontStyle: "700",
      color: "#eef7fc"
    });
    this.add.text(64, 132, `${stage.presentation.tagline} · ${stage.presentation.weather}`, {
      fontFamily: FONT_FAMILY,
      fontSize: "18px",
      color: "#9db2bf"
    });

    createStagePreview(this, stage, {
      x: 250,
      y: 292,
      width: 360,
      height: 236,
      backgroundTint: stage.atmosphere.panelTint,
      frameTint: stage.atmosphere.panelStrokeTint,
      accentTint: theme.visuals.endTint,
      secondaryTint: stage.atmosphere.pathGuideTint
    });

    this.add
      .rectangle(700, 286, 392, 274, stage.atmosphere.panelTint, 0.96)
      .setStrokeStyle(2, stage.atmosphere.panelStrokeTint, 0.82);

    this.add.text(520, 162, "작전 개요", {
      fontFamily: LABEL_FONT,
      fontSize: "12px",
      color: "#7fdfff"
    });
    this.add.text(
      520,
      188,
      `${stage.description}\n\n섹터 ${stage.presentation.sector}\n위험도 ${stage.presentation.threatLevel}\n추천 포대 ${stage.presentation.recommendedTowerLabel}\n총 웨이브 ${totalWaves}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: "18px",
        color: "#eef7fc",
        lineSpacing: 10,
        wordWrap: { width: 328 }
      }
    );

    this.add
      .rectangle(700, 454, 392, 70, 0x04090e, 0.82)
      .setStrokeStyle(1, stage.atmosphere.panelStrokeTint, 0.6);
    this.add.text(520, 432, "전술 메모", {
      fontFamily: LABEL_FONT,
      fontSize: "12px",
      color: "#7fdfff"
    });
    this.add.text(520, 452, stage.presentation.tacticalNote, {
      fontFamily: FONT_FAMILY,
      fontSize: "15px",
      color: "#c4d5df",
      lineSpacing: 6,
      wordWrap: { width: 330 }
    });

    this.add.text(480, 506, "출격 시작은 React 전술 HUD에서 진행합니다.", {
      fontFamily: FONT_FAMILY,
      fontSize: "16px",
      color: "#9db2bf"
    }).setOrigin(0.5);

    const launchGame = () => {
      this.scene.start(SCENE_KEYS.Game, { autoStart: true });
    };

    bus.emit(GAME_EVENTS.onGameReady, undefined);
    bus.on(GAME_COMMANDS.startGame, launchGame);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_COMMANDS.startGame, launchGame);
    });
  }
}
