import { Enemy } from "../entities/Enemy";
import type {
  EnemyDefinition,
  EnemyKind,
  Point,
  StageDefinition
} from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";

interface EnemyManagerHooks {
  onEnemyKilled: (enemy: Enemy) => void;
  onEnemyEscaped: (enemy: Enemy) => void;
}

const segmentLengthsFromPath = (path: Point[]) =>
  path.slice(0, -1).map((point, index) => {
    const next = path[index + 1];
    return next ? Phaser.Math.Distance.Between(point.x, point.y, next.x, next.y) : 0;
  });

export class EnemyManager {
  private readonly enemies: Enemy[] = [];
  private readonly segmentLengths: number[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly stage: StageDefinition,
    private readonly definitions: Record<EnemyKind, EnemyDefinition>,
    private readonly theme: GameModeThemeDefinition,
    private readonly hooks: EnemyManagerHooks
  ) {
    this.segmentLengths = segmentLengthsFromPath(this.stage.path);
  }

  spawn(enemyType: EnemyKind) {
    const definition = this.definitions[enemyType];
    const enemy = new Enemy(this.scene, definition, this.stage.path, this.segmentLengths, this.theme);
    this.enemies.push(enemy);
  }

  update(deltaMs: number, now: number) {
    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = this.enemies[index]!;
      const status = enemy.update(deltaMs, now);
      if (status === "escaped") {
        this.enemies.splice(index, 1);
        this.hooks.onEnemyEscaped(enemy);
        enemy.destroy();
        continue;
      }

      if (enemy.isDead()) {
        this.enemies.splice(index, 1);
        this.hooks.onEnemyKilled(enemy);
        enemy.destroy();
      }
    }
  }

  getLeadingEnemyInRange(x: number, y: number, range: number) {
    return this.enemies
      .filter((enemy) => {
        const position = enemy.getPosition();
        return Phaser.Math.Distance.Between(x, y, position.x, position.y) <= range;
      })
      .sort((left, right) => right.getProgress() - left.getProgress())[0];
  }

  damageEnemy(enemy: Enemy, damage: number) {
    enemy.takeDamage(damage);
  }

  applySlow(enemy: Enemy, multiplier: number, durationMs: number, now: number) {
    enemy.applySlow(multiplier, durationMs, now);
  }

  applySlowArea(x: number, y: number, radius: number, multiplier: number, durationMs: number, now: number) {
    this.enemies.forEach((enemy) => {
      const position = enemy.getPosition();
      if (Phaser.Math.Distance.Between(x, y, position.x, position.y) <= radius) {
        enemy.applySlow(multiplier, durationMs, now);
      }
    });
  }

  damageArea(x: number, y: number, radius: number, damage: number) {
    this.enemies.forEach((enemy) => {
      const position = enemy.getPosition();
      if (Phaser.Math.Distance.Between(x, y, position.x, position.y) <= radius) {
        enemy.takeDamage(damage);
      }
    });
  }

  countAlive() {
    return this.enemies.length;
  }

  clear() {
    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies.length = 0;
  }
}
