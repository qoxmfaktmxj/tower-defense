import Phaser from "phaser";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { GAME_EVENTS } from "../bridge/gameEvents";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameModeId, StageId } from "../core/types/gameTypes";
import { defaultGameModeId, getGameModeDefinition } from "../data/gameModes";
import { defaultStageId, getStageDefinition } from "../data/stages/stageDefinitions";
import { getWaveDefinitions } from "../data/waves/waveDefinitions";
import { resolveStageTheme } from "../data/stages/resolveStageTheme";
import { createStagePreview } from "./helpers/createStagePreview";

const FONT_FAMILY = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const LABEL_FONT_FAMILY =
  '"Kenney Future Narrow", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

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

    this.add.rectangle(480, 270, 960, 540, backgroundTint, 0.94);
    this.add.circle(148, 120, 170, stage.atmosphere.glowTint, stage.atmosphere.glowAlpha);
    this.add.circle(816, 404, 220, stage.atmosphere.glowTintAlt, stage.atmosphere.glowAlpha * 0.9);
    this.add.rectangle(480, 270, 960, 540, stage.atmosphere.hazeTint, stage.atmosphere.hazeAlpha);

    this.add
      .text(64, 62, "전장 브리핑", {
        fontFamily: FONT_FAMILY,
        fontSize: "38px",
        fontStyle: "700",
        color: "#324349"
      })
      .setDepth(2);
    this.add.text(64, 110, `${theme.name} 전장 출격 준비`, {
      fontFamily: FONT_FAMILY,
      fontSize: "19px",
      color: "#6f6784"
    });

    createStagePreview(this, stage, {
      x: 250,
      y: 286,
      width: 368,
      height: 244,
      backgroundTint: stage.atmosphere.panelTint,
      frameTint: stage.atmosphere.panelStrokeTint,
      accentTint: theme.visuals.endTint,
      secondaryTint: stage.atmosphere.pathGuideTint
    });

    this.add
      .rectangle(682, 260, 402, 268, stage.atmosphere.panelTint, 0.98)
      .setStrokeStyle(2, stage.atmosphere.panelStrokeTint, 0.82)
      .setDepth(1);

    this.add.text(510, 140, stage.name, {
      fontFamily: FONT_FAMILY,
      fontSize: "28px",
      fontStyle: "700",
      color: "#324349"
    });
    this.add.text(510, 176, `${stage.presentation.tagline} / 위험도 ${stage.presentation.threatLevel}`, {
      fontFamily: FONT_FAMILY,
      fontSize: "17px",
      color: "#6f6784"
    });
    this.add.text(
      510,
      226,
      `작전 구역\n${stage.presentation.sector}\n\n기상\n${stage.presentation.weather}\n\n추천 포대\n${stage.presentation.recommendedTowerLabel}\n\n전술 메모\n${stage.presentation.tacticalNote}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#4f646b",
        lineSpacing: 8,
        wordWrap: { width: 340 }
      }
    );

    this.add
      .rectangle(682, 454, 402, 68, stage.atmosphere.panelTint, 0.98)
      .setStrokeStyle(1, stage.atmosphere.panelStrokeTint, 0.72)
      .setDepth(1);
    this.add.text(510, 436, "OBJECTIVE", {
      fontFamily: LABEL_FONT_FAMILY,
      fontSize: "12px",
      color: "#756c87"
    });
    this.add.text(510, 454, `${totalWaves}웨이브를 방어하고 5웨이브마다 등장하는 보스를 저지하십시오.`, {
      fontFamily: FONT_FAMILY,
      fontSize: "15px",
      color: "#324349"
    });

    this.add
      .rectangle(682, 502, 300, 60, stage.atmosphere.panelTint, 0.98)
      .setStrokeStyle(2, stage.atmosphere.panelStrokeTint, 0.58)
      .setDepth(1);
    this.add
      .text(682, 490, "하단 제어 영역에서", {
        fontFamily: FONT_FAMILY,
        fontSize: "15px",
        color: "#6f6784"
      })
      .setOrigin(0.5);
    this.add
      .text(682, 512, "'출격 시작' 버튼을 누르십시오", {
        fontFamily: FONT_FAMILY,
        fontSize: "22px",
        fontStyle: "700",
        color: "#324349"
      })
      .setOrigin(0.5);

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
