import { ASSET_KEYS } from "../core/constants/assetKeys";
import type {
  ProjectileConfig,
  SelectedTowerInfo,
  TowerDefinition,
  TowerKind
} from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";
import { EnemyManager } from "../managers/EnemyManager";
import { ProjectileManager } from "../managers/ProjectileManager";

const projectileSpriteKeys: Record<TowerKind, string> = {
  arrow: ASSET_KEYS.projectiles.arrow,
  cannon: ASSET_KEYS.projectiles.cannon,
  frost: ASSET_KEYS.effects.trail
};

const effectKinds: Record<TowerKind, ProjectileConfig["effectKind"]> = {
  arrow: "hit",
  cannon: "explosion",
  frost: "freeze"
};

const towerSpriteKeys: Record<TowerKind, string> = {
  arrow: ASSET_KEYS.towers.arrow,
  cannon: ASSET_KEYS.towers.cannon,
  frost: ASSET_KEYS.towers.frost
};

export class Tower {
  readonly slotId: string;
  readonly type: TowerKind;
  readonly displayName: string;

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Container;
  private readonly rangeRing: Phaser.GameObjects.Arc;
  private readonly aura: Phaser.GameObjects.Arc;
  private readonly overdriveRing: Phaser.GameObjects.Arc;
  private readonly badge: Phaser.GameObjects.Ellipse;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly badgeText: Phaser.GameObjects.Text;
  private readonly definition: TowerDefinition;
  private readonly theme: GameModeThemeDefinition;
  private readonly x: number;
  private readonly y: number;
  private cooldownMs = 0;
  private levelIndex = 0;
  private totalSpent: number;

  constructor(
    scene: Phaser.Scene,
    slotId: string,
    x: number,
    y: number,
    definition: TowerDefinition,
    theme: GameModeThemeDefinition,
    onSelect: (slotId: string) => void
  ) {
    this.slotId = slotId;
    this.type = definition.key;
    this.displayName = definition.displayName;
    this.definition = definition;
    this.theme = theme;
    this.x = x;
    this.y = y;
    this.totalSpent = definition.buildCost;

    this.shadow = scene.add
      .ellipse(x, y + 15, 40, 14, 0x071014, 0.42)
      .setDepth(4);
    this.rangeRing = scene.add
      .circle(x, y, this.currentLevel.range)
      .setStrokeStyle(2, 0xe6faff, 0.26)
      .setVisible(false)
      .setDepth(3);
    this.aura = scene.add
      .circle(x, y, 28, definition.color, 0.08)
      .setVisible(false)
      .setDepth(5);
    this.overdriveRing = scene.add
      .circle(x, y, 34, this.theme.visuals.overdriveTint, 0)
      .setStrokeStyle(2, this.theme.visuals.overdriveTint, 0)
      .setVisible(false)
      .setDepth(5.5);

    const plate = scene.add
      .circle(0, 2, 18, this.theme.visuals.towerPlateOuter, 0.95)
      .setStrokeStyle(2, 0x08161b, 0.8);
    const plateInner = scene.add.circle(0, 2, 12, this.theme.visuals.towerPlateInner, 0.58);
    this.sprite = scene.add
      .image(0, -4, towerSpriteKeys[this.type])
      .setScale(this.theme.visuals.towerScales[this.type])
      .setOrigin(0.5);
    this.badge = scene.add.ellipse(14, 14, 18, 18, 0x061319, 0.95);
    this.badgeText = scene.add
      .text(14, 14, "1", {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "12px",
        color: "#eff9ff"
      })
      .setOrigin(0.5);

    this.body = scene
      .add.container(x, y, [plate, plateInner, this.sprite, this.badge, this.badgeText])
      .setDepth(6);
    this.body.setSize(48, 48);
    this.body.setInteractive(new Phaser.Geom.Circle(0, 0, 24), Phaser.Geom.Circle.Contains);
    this.body.on("pointerdown", () => onSelect(this.slotId));
    this.refreshAppearance(false);
  }

  update(deltaMs: number, enemyManager: EnemyManager, projectileManager: ProjectileManager) {
    this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);

    const target = enemyManager.getLeadingEnemyInRange(this.x, this.y, this.currentLevel.range);
    if (!target) {
      return;
    }

    const targetPosition = target.getPosition();
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetPosition.x, targetPosition.y);
    this.body.setRotation(angle + Math.PI / 2);

    if (this.cooldownMs > 0) {
      return;
    }

    const projectile: ProjectileConfig = {
      color: this.definition.color,
      speed: this.currentLevel.projectileSpeed,
      size: this.currentLevel.projectileSize,
      damage: this.currentLevel.damage,
      spriteKey: projectileSpriteKeys[this.type],
      effectKind: effectKinds[this.type],
      splashRadius: this.currentLevel.splashRadius,
      slowMultiplier: this.currentLevel.slowMultiplier,
      slowDurationMs: this.currentLevel.slowDurationMs,
      slowRadius: this.currentLevel.slowRadius,
      burstCount: this.currentLevel.burstCount,
      specialEffect: this.currentLevel.specialEffect
    };

    const burstCount = this.currentLevel.burstCount ?? 1;
    for (let burstIndex = 0; burstIndex < burstCount; burstIndex += 1) {
      const radialOffset = burstCount === 1 ? 0 : (burstIndex - (burstCount - 1) / 2) * 6;
      const offsetX = Math.cos(angle + Math.PI / 2) * radialOffset;
      const offsetY = Math.sin(angle + Math.PI / 2) * radialOffset;
      projectileManager.spawn(this.x + offsetX, this.y + offsetY, target, projectile);
    }

    this.cooldownMs = this.currentLevel.fireRateMs;
    this.aura.setVisible(true);
    this.aura.setAlpha(this.currentLevel.specialEffect ? 0.28 : 0.22);
    this.aura.setScale(0.85);
    this.body.setScale(0.96);

    if (this.currentLevel.specialEffect) {
      this.playOverdrivePulse();
    }

    this.aura.scene.tweens.add({
      targets: this.aura,
      alpha: 0,
      scaleX: this.currentLevel.specialEffect ? 1.7 : 1.45,
      scaleY: this.currentLevel.specialEffect ? 1.7 : 1.45,
      duration: this.currentLevel.specialEffect ? 260 : 220,
      onComplete: () => {
        this.aura.setVisible(false);
        this.aura.setScale(1);
      }
    });
    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: 1,
      scaleY: 1,
      duration: 140
    });
  }

  setSelected(selected: boolean) {
    this.refreshAppearance(selected);
  }

  canUpgrade() {
    return this.levelIndex < this.definition.levels.length - 1;
  }

  getUpgradeCost() {
    return this.definition.levels[this.levelIndex + 1]?.upgradeCost ?? null;
  }

  upgrade() {
    const upgradeCost = this.getUpgradeCost();
    if (!upgradeCost) {
      return false;
    }

    this.levelIndex += 1;
    this.totalSpent += upgradeCost;
    this.badgeText.setText(String(this.levelIndex + 1));
    this.refreshAppearance(true);
    this.body.setScale(1.12);
    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: 1,
      scaleY: 1,
      duration: 180
    });
    if (this.currentLevel.specialEffect) {
      this.playOverdrivePulse(true);
    }
    return true;
  }

  getSellValue() {
    return Math.floor(this.totalSpent * 0.7);
  }

  getSelectedInfo(): SelectedTowerInfo {
    return {
      type: this.type,
      displayName: this.displayName,
      level: this.levelIndex + 1,
      sellValue: this.getSellValue(),
      upgradeCost: this.getUpgradeCost(),
      isMaxLevel: !this.canUpgrade(),
      specialEffect: this.currentLevel.specialEffect ?? null
    };
  }

  destroy() {
    this.shadow.destroy();
    this.body.destroy(true);
    this.rangeRing.destroy();
    this.aura.destroy();
    this.overdriveRing.destroy();
  }

  private refreshAppearance(selected: boolean) {
    const isOverdrive = Boolean(this.currentLevel.specialEffect);
    this.rangeRing.setRadius(this.currentLevel.range);
    this.rangeRing.setVisible(selected);
    this.aura.setVisible(selected);
    this.aura.setAlpha(selected ? 0.18 : 0);
    this.body.setScale(selected ? 1.08 : 1);
    this.badge.setFillStyle(selected ? 0xf4c15b : 0x061319, 0.95);
    this.badgeText.setColor(selected ? "#081218" : "#eff9ff");
    this.sprite.setScale(this.theme.visuals.towerScales[this.type] + (isOverdrive ? 0.06 : 0));
    this.sprite.setTint(
      isOverdrive
        ? this.theme.visuals.overdriveTint
        : selected
          ? this.theme.visuals.towerSelectedTint
          : 0xf3faff
    );
    this.overdriveRing.setVisible(isOverdrive);
    this.overdriveRing.setStrokeStyle(
      isOverdrive ? 2 : 0,
      this.theme.visuals.overdriveTint,
      isOverdrive ? (selected ? 0.48 : 0.22) : 0
    );
    this.overdriveRing.setAlpha(isOverdrive ? (selected ? 0.9 : 0.45) : 0);
  }

  private playOverdrivePulse(isUpgrade = false) {
    this.overdriveRing.setVisible(true);
    this.overdriveRing.setAlpha(isUpgrade ? 0.95 : 0.75);
    this.overdriveRing.setScale(isUpgrade ? 0.8 : 1);
    this.body.scene.tweens.add({
      targets: this.overdriveRing,
      alpha: 0.16,
      scaleX: isUpgrade ? 1.6 : 1.34,
      scaleY: isUpgrade ? 1.6 : 1.34,
      duration: isUpgrade ? 420 : 220,
      onComplete: () => {
        this.overdriveRing.setScale(1);
        this.overdriveRing.setAlpha(0.45);
      }
    });
  }

  private get currentLevel() {
    return this.definition.levels[this.levelIndex]!;
  }
}
