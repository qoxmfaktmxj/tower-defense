import type { ProjectileConfig } from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { EnemyManager } from "./EnemyManager";

type ImpactCallback = (kind: ProjectileConfig["effectKind"], specialEffect: boolean) => void;

export class ProjectileManager {
  private readonly projectiles: Projectile[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemyManager: EnemyManager,
    private readonly theme: GameModeThemeDefinition,
    private readonly onImpact?: ImpactCallback
  ) {}

  spawn(x: number, y: number, target: Enemy, config: ProjectileConfig) {
    this.projectiles.push(
      new Projectile(this.scene, x, y, target, config, this.theme, this.onImpact)
    );
  }

  update(deltaMs: number, now: number) {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index]!;
      if (projectile.update(deltaMs, now, this.enemyManager)) {
        this.projectiles.splice(index, 1);
      }
    }
  }

  clear() {
    this.projectiles.forEach((projectile) => projectile.destroy());
    this.projectiles.length = 0;
  }
}
