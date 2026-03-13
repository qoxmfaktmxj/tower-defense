import Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants/assetKeys";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameModeId, StageId } from "../core/types/gameTypes";
import { defaultGameModeId, getGameModeDefinition } from "../data/gameModes";
import { defaultStageId, getStageDefinition } from "../data/stages/stageDefinitions";
import { resolveStageTheme } from "../data/stages/resolveStageTheme";
import { createStagePreview } from "./helpers/createStagePreview";

const FONT_FAMILY = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const LABEL_FONT_FAMILY =
  '"Kenney Future Narrow", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Preload);
  }

  preload() {
    const modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    const stageId = (this.game.registry.get("stageId") as StageId | undefined) ?? defaultStageId;
    const stage = getStageDefinition(stageId);
    const theme = resolveStageTheme(getGameModeDefinition(modeId), stage);
    const backgroundTint = Phaser.Display.Color.HexStringToColor(theme.visuals.backgroundColor).color;

    this.cameras.main.setBackgroundColor(theme.visuals.backgroundColor);

    this.add.rectangle(480, 270, 960, 540, backgroundTint, 1);
    this.add.circle(172, 128, 180, stage.atmosphere.glowTint, stage.atmosphere.glowAlpha);
    this.add.circle(806, 404, 210, stage.atmosphere.glowTintAlt, stage.atmosphere.glowAlpha * 0.9);
    this.add.rectangle(480, 270, 960, 540, stage.atmosphere.hazeTint, stage.atmosphere.hazeAlpha);

    this.add
      .text(112, 116, "전장 데이터를 정렬 중", {
        fontFamily: FONT_FAMILY,
        fontSize: "30px",
        fontStyle: "700",
        color: "#324349"
      })
      .setOrigin(0, 0.5);
    this.add
      .text(112, 158, `${stage.name} / ${stage.presentation.tagline}`, {
        fontFamily: FONT_FAMILY,
        fontSize: "18px",
        color: "#6f6784"
      })
      .setOrigin(0, 0.5);
    this.add
      .text(112, 208, stage.presentation.tacticalNote, {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#4f646b",
        wordWrap: { width: 360 }
      })
      .setOrigin(0, 0);

    createStagePreview(this, stage, {
      x: 720,
      y: 202,
      width: 330,
      height: 196,
      backgroundTint: stage.atmosphere.panelTint,
      frameTint: stage.atmosphere.panelStrokeTint,
      accentTint: theme.visuals.endTint,
      secondaryTint: stage.atmosphere.pathGuideTint
    });

    const createChip = (x: number, y: number, title: string, value: string, tint: number) => {
      this.add
        .rectangle(x, y, 170, 56, stage.atmosphere.panelTint, 0.98)
        .setOrigin(0, 0)
        .setStrokeStyle(2, tint, 0.8);
      this.add
        .text(x + 14, y + 12, title, {
          fontFamily: LABEL_FONT_FAMILY,
          fontSize: "12px",
          color: "#756c87"
        })
        .setOrigin(0, 0);
      this.add
        .text(x + 14, y + 30, value, {
          fontFamily: FONT_FAMILY,
          fontSize: "15px",
          color: "#324349"
        })
        .setOrigin(0, 0);
    };

    createChip(112, 308, "SECTOR", stage.presentation.sector, stage.atmosphere.panelStrokeTint);
    createChip(292, 308, "THREAT", stage.presentation.threatLevel, theme.visuals.endTint);
    createChip(472, 308, "RECOMMEND", stage.presentation.recommendedTowerLabel, theme.visuals.startTint);

    const progressText = this.add
      .text(112, 404, "0%", {
        fontFamily: LABEL_FONT_FAMILY,
        fontSize: "24px",
        color: "#324349"
      })
      .setOrigin(0, 0.5);
    this.add
      .rectangle(112, 446, 516, 20, stage.atmosphere.panelTint, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, stage.atmosphere.panelStrokeTint, 0.82);
    const progressBar = this.add
      .rectangle(116, 446, 0, 14, theme.visuals.startTint, 1)
      .setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      progressText.setText(`${Math.round(value * 100)}%`);
      progressBar.width = 508 * value;
    });

    this.load.on("complete", () => {
      progressText.setText("준비 완료");
    });

    this.load.image(ASSET_KEYS.terrain.grass, theme.assets.terrain.grass);
    this.load.image(ASSET_KEYS.terrain.grassAlt, theme.assets.terrain.grassAlt);
    this.load.image(ASSET_KEYS.terrain.roadHorizontal, theme.assets.terrain.roadHorizontal);
    this.load.image(ASSET_KEYS.terrain.roadVertical, theme.assets.terrain.roadVertical);
    this.load.image(ASSET_KEYS.terrain.roadCornerLl, theme.assets.terrain.roadCornerLl);
    this.load.image(ASSET_KEYS.terrain.roadCornerLr, theme.assets.terrain.roadCornerLr);
    this.load.image(ASSET_KEYS.terrain.roadCornerUl, theme.assets.terrain.roadCornerUl);
    this.load.image(ASSET_KEYS.terrain.roadCornerUr, theme.assets.terrain.roadCornerUr);
    this.load.image(ASSET_KEYS.terrain.sand, theme.assets.terrain.sand);
    this.load.image(ASSET_KEYS.slots.buildPad, theme.assets.slot);
    this.load.image(ASSET_KEYS.towers.arrow, theme.assets.towers.arrow);
    this.load.image(ASSET_KEYS.towers.cannon, theme.assets.towers.cannon);
    this.load.image(ASSET_KEYS.towers.frost, theme.assets.towers.frost);
    this.load.image(ASSET_KEYS.enemies.grunt, theme.assets.enemies.grunt);
    this.load.image(ASSET_KEYS.enemies.runner, theme.assets.enemies.runner);
    this.load.image(ASSET_KEYS.enemies.tank, theme.assets.enemies.tank);
    this.load.image(ASSET_KEYS.enemies.boss, theme.assets.enemies.boss);
    this.load.image(ASSET_KEYS.projectiles.arrow, theme.assets.projectiles.arrow);
    this.load.image(ASSET_KEYS.projectiles.cannon, theme.assets.projectiles.cannon);
    this.load.image(ASSET_KEYS.props.crateMetal, theme.assets.props.crateMetal);
    this.load.image(ASSET_KEYS.props.sandbag, theme.assets.props.sandbag);
    this.load.image(ASSET_KEYS.props.treeLarge, theme.assets.props.treeLarge);
    this.load.image(ASSET_KEYS.props.treeSmall, theme.assets.props.treeSmall);
    this.load.image(ASSET_KEYS.props.barricade, theme.assets.props.barricade);
    this.load.image(ASSET_KEYS.effects.hit, theme.assets.effects.hit);
    this.load.image(ASSET_KEYS.effects.explosion, theme.assets.effects.explosion);
    this.load.image(ASSET_KEYS.effects.freeze, theme.assets.effects.freeze);
    this.load.image(ASSET_KEYS.effects.trail, theme.assets.projectiles.frost);
  }

  create() {
    this.time.delayedCall(240, () => {
      this.scene.start(SCENE_KEYS.Menu);
    });
  }
}
