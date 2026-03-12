import type { EnemyKind, WaveDefinition } from "../core/types/gameTypes";
import { WAVE_GAP_MS } from "../core/config/gameConfig";
import { EnemyManager } from "./EnemyManager";

interface SpawnEntry {
  enemyType: EnemyKind;
  spawnAtMs: number;
}

interface WaveManagerHooks {
  onWaveStarted: (wave: number, totalWaves: number) => void;
  onWaveCleared: (wave: number) => void;
  onAllWavesFinished: () => void;
}

export class WaveManager {
  private currentWaveIndex = -1;
  private spawnQueue: SpawnEntry[] = [];
  private elapsedMs = 0;
  private waitingMs = 0;
  private completed = false;

  constructor(
    private readonly waves: WaveDefinition[],
    private readonly enemyManager: EnemyManager,
    private readonly hooks: WaveManagerHooks
  ) {}

  start() {
    this.completed = false;
    this.currentWaveIndex = -1;
    this.waitingMs = 0;
    this.startNextWave();
  }

  update(deltaMs: number) {
    if (this.completed) {
      return;
    }

    if (this.waitingMs > 0) {
      this.waitingMs -= deltaMs;
      if (this.waitingMs <= 0) {
        this.startNextWave();
      }
      return;
    }

    this.elapsedMs += deltaMs;
    while (this.spawnQueue[0] && this.spawnQueue[0].spawnAtMs <= this.elapsedMs) {
      const next = this.spawnQueue.shift();
      if (next) {
        this.enemyManager.spawn(next.enemyType);
      }
    }

    if (this.spawnQueue.length === 0 && this.enemyManager.countAlive() === 0) {
      const currentWave = this.currentWaveIndex + 1;
      this.hooks.onWaveCleared(currentWave);

      if (this.currentWaveIndex >= this.waves.length - 1) {
        this.completed = true;
        this.hooks.onAllWavesFinished();
        return;
      }

      this.waitingMs = WAVE_GAP_MS;
    }
  }

  getCurrentWave() {
    return Math.max(this.currentWaveIndex + 1, 0);
  }

  getTotalWaves() {
    return this.waves.length;
  }

  isFinished() {
    return this.completed;
  }

  private startNextWave() {
    this.currentWaveIndex += 1;
    this.elapsedMs = 0;
    const wave = this.waves[this.currentWaveIndex];
    if (!wave) {
      this.completed = true;
      this.hooks.onAllWavesFinished();
      return;
    }

    let offset = 0;
    this.spawnQueue = [];

    wave.groups.forEach((group) => {
      offset += group.initialDelayMs;
      for (let count = 0; count < group.count; count += 1) {
        this.spawnQueue.push({
          enemyType: group.enemyType,
          spawnAtMs: offset + count * group.intervalMs
        });
      }
      offset += group.count * group.intervalMs + 400;
    });

    this.hooks.onWaveStarted(this.currentWaveIndex + 1, this.waves.length);
  }
}
