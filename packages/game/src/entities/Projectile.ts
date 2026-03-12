import { ASSET_KEYS } from "../core/constants/assetKeys";
import type { ProjectileConfig } from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";
import { Enemy } from "./Enemy";
import { EnemyManager } from "../managers/EnemyManager";

export class Projectile {
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly config: ProjectileConfig;
  private readonly target: Enemy;
  private readonly theme: GameModeThemeDefinition;
  private x: number;
  private y: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    config: ProjectileConfig,
    theme: GameModeThemeDefinition
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.target = target;
    this.config = config;
    this.theme = theme;
    this.sprite = this.createProjectile(scene, x, y, config);
  }

  update(deltaMs: number, now: number, enemyManager: EnemyManager) {
    if (this.target.isDead()) {
      this.destroy();
      return true;
    }

    const targetPosition = this.target.getPosition();
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetPosition.x, targetPosition.y);
    const step = this.config.speed * (deltaMs / 1000);

    this.x += Math.cos(angle) * step;
    this.y += Math.sin(angle) * step;
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setRotation(angle + Math.PI / 2);

    const hitDistance =
      this.config.size + this.target.getRadius() + (this.config.splashRadius ? 6 : 2);
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      targetPosition.x,
      targetPosition.y
    );

    if (distanceToTarget > hitDistance) {
      return false;
    }

    if (this.config.splashRadius) {
      enemyManager.damageArea(
        targetPosition.x,
        targetPosition.y,
        this.config.splashRadius,
        this.config.damage
      );
    } else {
      enemyManager.damageEnemy(this.target, this.config.damage);
    }

    if (this.config.slowMultiplier && this.config.slowDurationMs) {
      if (this.config.slowRadius) {
        enemyManager.applySlowArea(
          targetPosition.x,
          targetPosition.y,
          this.config.slowRadius,
          this.config.slowMultiplier,
          this.config.slowDurationMs,
          now
        );
      } else {
        enemyManager.applySlow(this.target, this.config.slowMultiplier, this.config.slowDurationMs, now);
      }
    }

    if (this.config.specialEffect === "blast-nova" && this.config.splashRadius) {
      enemyManager.damageArea(
        targetPosition.x,
        targetPosition.y,
        this.config.splashRadius + 26,
        Math.floor(this.config.damage * 0.38)
      );
    }

    if (this.config.specialEffect === "freeze-nova" && this.config.slowRadius) {
      enemyManager.damageArea(
        targetPosition.x,
        targetPosition.y,
        this.config.slowRadius,
        Math.floor(this.config.damage * 0.22)
      );
    }

    this.playImpactEffect(targetPosition.x, targetPosition.y);
    this.destroy();
    return true;
  }

  destroy() {
    this.sprite.destroy();
  }

  private playImpactEffect(x: number, y: number) {
    const effectKey =
      this.config.effectKind === "explosion"
        ? ASSET_KEYS.effects.explosion
        : this.config.effectKind === "freeze"
          ? ASSET_KEYS.effects.freeze
          : ASSET_KEYS.effects.hit;

    const effectTint =
      this.config.effectKind === "explosion"
        ? this.theme.visuals.explosionTint
        : this.config.effectKind === "freeze"
          ? this.theme.visuals.freezeTint
          : this.theme.visuals.hitTint;

    const effect = this.scene.add
      .image(x, y, effectKey)
      .setDepth(9)
      .setAlpha(0.92)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(effectTint);
    const size =
      this.config.effectKind === "explosion"
        ? 88
        : this.config.effectKind === "freeze"
          ? 74
          : 46;

    const scaleBoost = this.config.specialEffect ? 1.25 : 1;

    effect.setDisplaySize(size * scaleBoost, size * scaleBoost);
    effect.setAngle(Phaser.Math.Between(-18, 18));

    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scaleX: 1.32 * scaleBoost,
      scaleY: 1.32 * scaleBoost,
      duration: this.config.specialEffect ? 320 : 260,
      onComplete: () => effect.destroy()
    });

    if (!this.config.specialEffect) {
      return;
    }

    const ringColor =
      this.config.specialEffect === "freeze-nova"
        ? this.theme.visuals.freezeTint
        : this.theme.visuals.overdriveTint;
    const ring = this.scene.add
      .circle(x, y, this.config.splashRadius ?? this.config.slowRadius ?? 42)
      .setFillStyle(ringColor, 0)
      .setStrokeStyle(3, ringColor, 0.7)
      .setDepth(8.5);

    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.22,
      scaleY: 1.22,
      duration: 280,
      onComplete: () => ring.destroy()
    });
  }

  private createProjectile(scene: Phaser.Scene, x: number, y: number, config: ProjectileConfig) {
    const projectile = scene.add
      .image(x, y, config.spriteKey)
      .setDepth(7)
      .setBlendMode(
        config.effectKind === "freeze" ? Phaser.BlendModes.SCREEN : Phaser.BlendModes.NORMAL
      );

    const scale =
      config.effectKind === "explosion"
        ? 0.7 + config.size * 0.02
        : config.effectKind === "freeze"
          ? 0.75 + config.size * 0.03
          : 0.65 + config.size * 0.03;

    projectile.setScale(config.specialEffect ? scale * 1.1 : scale);
    projectile.setTint(this.theme.visuals.projectileTints[this.resolveTowerKind(config)]);
    return projectile;
  }

  private resolveTowerKind(config: ProjectileConfig) {
    if (config.effectKind === "freeze") {
      return "frost";
    }
    if (config.effectKind === "explosion") {
      return "cannon";
    }
    return "arrow";
  }
}
