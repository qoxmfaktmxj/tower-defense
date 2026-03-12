import Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants/assetKeys";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type { GameModeId, StageId } from "../core/types/gameTypes";
import {
  defaultGameModeId,
  getGameModeDefinition
} from "../data/gameModes";
import { defaultStageId, getStageDefinition } from "../data/stages/stageDefinitions";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Preload);
  }

  preload() {
    const modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    const stageId = (this.game.registry.get("stageId") as StageId | undefined) ?? defaultStageId;
    const mode = getGameModeDefinition(modeId);
    const stage = getStageDefinition(stageId);

    this.cameras.main.setBackgroundColor(mode.visuals.backgroundColor);

    this.add.rectangle(480, 270, 960, 540, 0x071118, 1);
    this.add.circle(780, 120, 180, 0x25c3f1, 0.08);
    this.add.circle(180, 410, 210, 0x74d88b, 0.05);

    const title = this.add
      .text(480, 194, "전장 동기화 중", {
        fontFamily: "Kenney Future, Pretendard, sans-serif",
        fontSize: "28px",
        color: "#eff9ff"
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(480, 236, `${mode.name} · ${stage.name} 자산을 불러오는 중입니다.`, {
        fontFamily: "Pretendard, Noto Sans KR, sans-serif",
        fontSize: "18px",
        color: "#8bd6df"
      })
      .setOrigin(0.5);
    const progressText = this.add
      .text(480, 304, "0%", {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "22px",
        color: "#eff9ff"
      })
      .setOrigin(0.5);
    const progressBarBg = this.add
      .rectangle(480, 344, 340, 18, 0x14313b, 1)
      .setStrokeStyle(2, 0x68d4ef, 0.9);
    const progressBar = this.add.rectangle(312, 344, 0, 14, 0x68d4ef, 1).setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      progressText.setText(`${Math.round(value * 100)}%`);
      progressBar.width = 336 * value;
    });

    this.load.on("complete", () => {
      title.destroy();
      subtitle.destroy();
      progressText.destroy();
      progressBar.destroy();
      progressBarBg.destroy();
    });

    this.load.image(ASSET_KEYS.terrain.grass, mode.assets.terrain.grass);
    this.load.image(ASSET_KEYS.terrain.grassAlt, mode.assets.terrain.grassAlt);
    this.load.image(ASSET_KEYS.terrain.roadHorizontal, mode.assets.terrain.roadHorizontal);
    this.load.image(ASSET_KEYS.terrain.roadVertical, mode.assets.terrain.roadVertical);
    this.load.image(ASSET_KEYS.terrain.roadCornerLl, mode.assets.terrain.roadCornerLl);
    this.load.image(ASSET_KEYS.terrain.roadCornerLr, mode.assets.terrain.roadCornerLr);
    this.load.image(ASSET_KEYS.terrain.roadCornerUl, mode.assets.terrain.roadCornerUl);
    this.load.image(ASSET_KEYS.terrain.roadCornerUr, mode.assets.terrain.roadCornerUr);
    this.load.image(ASSET_KEYS.terrain.sand, mode.assets.terrain.sand);
    this.load.image(ASSET_KEYS.slots.buildPad, mode.assets.slot);
    this.load.image(ASSET_KEYS.towers.arrow, mode.assets.towers.arrow);
    this.load.image(ASSET_KEYS.towers.cannon, mode.assets.towers.cannon);
    this.load.image(ASSET_KEYS.towers.frost, mode.assets.towers.frost);
    this.load.image(ASSET_KEYS.enemies.grunt, mode.assets.enemies.grunt);
    this.load.image(ASSET_KEYS.enemies.runner, mode.assets.enemies.runner);
    this.load.image(ASSET_KEYS.enemies.tank, mode.assets.enemies.tank);
    this.load.image(ASSET_KEYS.enemies.boss, mode.assets.enemies.boss);
    this.load.image(ASSET_KEYS.projectiles.arrow, mode.assets.projectiles.arrow);
    this.load.image(ASSET_KEYS.projectiles.cannon, mode.assets.projectiles.cannon);
    this.load.image(ASSET_KEYS.props.crateMetal, mode.assets.props.crateMetal);
    this.load.image(ASSET_KEYS.props.sandbag, mode.assets.props.sandbag);
    this.load.image(ASSET_KEYS.props.treeLarge, mode.assets.props.treeLarge);
    this.load.image(ASSET_KEYS.props.treeSmall, mode.assets.props.treeSmall);
    this.load.image(ASSET_KEYS.props.barricade, mode.assets.props.barricade);
    this.load.image(ASSET_KEYS.effects.hit, mode.assets.effects.hit);
    this.load.image(ASSET_KEYS.effects.explosion, mode.assets.effects.explosion);
    this.load.image(ASSET_KEYS.effects.freeze, mode.assets.effects.freeze);
    this.load.image(ASSET_KEYS.effects.trail, mode.assets.projectiles.frost);
  }

  create() {
    this.time.delayedCall(240, () => {
      this.scene.start(SCENE_KEYS.Menu);
    });
  }
}
