import { ASSET_KEYS } from "../core/constants/assetKeys";
import type { EnemyDefinition, Point } from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";

const enemySpriteKeys: Record<EnemyDefinition["key"], string> = {
  grunt: ASSET_KEYS.enemies.grunt,
  runner: ASSET_KEYS.enemies.runner,
  tank: ASSET_KEYS.enemies.tank,
  boss: ASSET_KEYS.enemies.boss
};

export class Enemy {
  readonly definition: EnemyDefinition;

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Container;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly hpBarBg: Phaser.GameObjects.Rectangle;
  private readonly hpBarFill: Phaser.GameObjects.Rectangle;
  private readonly path: Point[];
  private readonly segmentLengths: number[];
  private readonly hpWidth: number;
  private readonly theme: GameModeThemeDefinition;
  private hp: number;
  private segmentIndex = 0;
  private segmentProgress = 0;
  private x: number;
  private y: number;
  private slowUntil = 0;
  private slowMultiplier = 1;
  private dead = false;

  constructor(
    scene: Phaser.Scene,
    definition: EnemyDefinition,
    path: Point[],
    segmentLengths: number[],
    theme: GameModeThemeDefinition
  ) {
    this.definition = definition;
    this.path = path;
    this.segmentLengths = segmentLengths;
    this.theme = theme;
    this.hp = definition.maxHp;
    this.hpWidth = definition.radius * 2;
    this.x = path[0]?.x ?? 0;
    this.y = path[0]?.y ?? 0;

    this.shadow = scene.add
      .ellipse(this.x, this.y + definition.radius + 2, definition.radius * 2.2, 11, 0x071014, 0.4)
      .setDepth(5);

    this.glow = scene.add.circle(0, 2, definition.radius * 0.92, definition.color, 0.14);
    this.sprite = scene.add
      .image(0, 0, enemySpriteKeys[definition.key])
      .setScale(this.theme.visuals.enemyScales[definition.key])
      .setOrigin(0.5);
    this.body = scene.add.container(this.x, this.y, [this.glow, this.sprite]).setDepth(6);

    this.hpBarBg = scene.add
      .rectangle(this.x, this.y - definition.radius - 11, this.hpWidth, 5, 0x081218, 0.92)
      .setDepth(7);
    this.hpBarFill = scene.add
      .rectangle(
        this.x - this.hpWidth / 2,
        this.y - definition.radius - 11,
        this.hpWidth,
        5,
        0x82f0af,
        0.96
      )
      .setOrigin(0, 0.5)
      .setDepth(8);
  }

  update(deltaMs: number, now: number): "active" | "escaped" {
    if (this.dead) {
      return "active";
    }

    let remaining = this.definition.speed * this.getSlowRatio(now) * (deltaMs / 1000);

    while (remaining > 0) {
      const currentSegmentLength = this.segmentLengths[this.segmentIndex];
      if (currentSegmentLength === undefined) {
        return "escaped";
      }

      const distanceLeft = currentSegmentLength - this.segmentProgress;
      if (remaining >= distanceLeft) {
        remaining -= distanceLeft;
        this.segmentIndex += 1;
        this.segmentProgress = 0;
        if (this.segmentIndex >= this.segmentLengths.length) {
          return "escaped";
        }
      } else {
        this.segmentProgress += remaining;
        remaining = 0;
      }
    }

    const segmentLength = this.segmentLengths[this.segmentIndex] ?? 1;
    const start = this.path[this.segmentIndex];
    const end = this.path[this.segmentIndex + 1];
    if (!start || !end) {
      return "escaped";
    }

    const ratio = this.segmentProgress / segmentLength;
    this.x = Phaser.Math.Linear(start.x, end.x, ratio);
    this.y = Phaser.Math.Linear(start.y, end.y, ratio);

    this.body.setPosition(this.x, this.y);
    this.body.setRotation(Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y) + Math.PI / 2);
    this.shadow.setPosition(this.x, this.y + this.definition.radius + 2);
    this.hpBarBg.setPosition(this.x, this.y - this.definition.radius - 11);
    this.hpBarFill.setPosition(this.x - this.hpWidth / 2, this.y - this.definition.radius - 11);
    this.applyVisualState(now);
    return "active";
  }

  applySlow(multiplier: number, durationMs: number, now: number) {
    if (this.dead) {
      return;
    }

    if (multiplier < this.slowMultiplier || now > this.slowUntil) {
      this.slowMultiplier = multiplier;
    }
    this.slowUntil = Math.max(this.slowUntil, now + durationMs);
    this.applyVisualState(now);
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    this.hpBarFill.width = (this.hp / this.definition.maxHp) * this.hpWidth;
    this.sprite.setTint(0xffd1bd);
    this.body.setScale(0.92);
    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: 1,
      scaleY: 1,
      duration: 100
    });
    this.body.scene.time.delayedCall(80, () => {
      if (!this.dead) {
        this.applyVisualState(this.body.scene.time.now);
      }
    });

    if (this.hp === 0) {
      this.dead = true;
    }
  }

  isDead() {
    return this.dead;
  }

  getProgress() {
    return this.segmentIndex * 10_000 + this.segmentProgress;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getRadius() {
    return this.definition.radius;
  }

  destroy() {
    this.shadow.destroy();
    this.body.destroy(true);
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
  }

  private getSlowRatio(now: number) {
    if (now > this.slowUntil) {
      this.slowMultiplier = 1;
      return 1;
    }

    return this.slowMultiplier;
  }

  private applyVisualState(now: number) {
    const slowed = this.getSlowRatio(now) < 1;
    this.glow.setFillStyle(slowed ? 0x94dfff : this.definition.color, slowed ? 0.24 : 0.14);
    this.sprite.setTint(slowed ? 0xb8ecff : 0xffffff);
  }
}
