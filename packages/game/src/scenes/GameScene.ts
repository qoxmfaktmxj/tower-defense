import Phaser from "phaser";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { GAME_EVENTS } from "../bridge/gameEvents";
import { ASSET_KEYS } from "../core/constants/assetKeys";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type {
  GameModeId,
  GameRunResult,
  GameSpeed,
  GameStateSnapshot,
  Point,
  StageId,
  TowerKind
} from "../core/types/gameTypes";
import {
  defaultGameModeId,
  getGameModeDefinition,
  type GameModeThemeDefinition
} from "../data/gameModes";
import { enemyDefinitions } from "../data/enemies/enemyDefinitions";
import {
  defaultStageId,
  getStageDefinition
} from "../data/stages/stageDefinitions";
import { towerDefinitions } from "../data/towers/towerDefinitions";
import { waveDefinitions } from "../data/waves/waveDefinitions";
import { getWaveSummary } from "../gameCatalog";
import { EconomyManager } from "../managers/EconomyManager";
import { EnemyManager } from "../managers/EnemyManager";
import { ProjectileManager } from "../managers/ProjectileManager";
import { SelectionManager } from "../managers/SelectionManager";
import { TowerManager } from "../managers/TowerManager";
import { WaveManager } from "../managers/WaveManager";

type Direction = "north" | "south" | "east" | "west";

export class GameScene extends Phaser.Scene {
  private stage = getStageDefinition(defaultStageId);
  private modeId: GameModeId = defaultGameModeId;
  private theme: GameModeThemeDefinition = getGameModeDefinition(defaultGameModeId);
  private economy!: EconomyManager;
  private enemyManager!: EnemyManager;
  private projectileManager!: ProjectileManager;
  private towerManager!: TowerManager;
  private selectionManager!: SelectionManager;
  private waveManager!: WaveManager;
  private speed: GameSpeed = 1;
  private started = false;
  private finished = false;
  private paused = false;
  private runStartedAt = 0;
  private statePushElapsed = 0;

  constructor() {
    super(SCENE_KEYS.Game);
  }

  create(data?: { autoStart?: boolean }) {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const stageId = (this.game.registry.get("stageId") as StageId | undefined) ?? defaultStageId;
    this.modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    this.stage = getStageDefinition(stageId);
    this.theme = getGameModeDefinition(this.modeId);

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBackgroundColor(this.theme.visuals.backgroundColor);

    this.drawBattlefield();
    this.economy = new EconomyManager(this.stage.initialGold, this.stage.initialLives);
    this.selectionManager = new SelectionManager();
    this.enemyManager = new EnemyManager(this, this.stage, enemyDefinitions, this.theme, {
      onEnemyKilled: (enemy) => {
        this.economy.addReward(enemy.definition.reward);
        this.emitState();
      },
      onEnemyEscaped: () => {
        this.economy.loseLife(1);
        this.emitState();
        if (this.economy.getLives() <= 0) {
          this.finishRun(false);
        }
      }
    });
    this.projectileManager = new ProjectileManager(this, this.enemyManager, this.theme);
    this.towerManager = new TowerManager(
      this,
      this.stage,
      towerDefinitions,
      this.theme,
      this.enemyManager,
      this.projectileManager,
      (slotId) => this.selectSlot(slotId)
    );
    this.waveManager = new WaveManager(waveDefinitions, this.enemyManager, {
      onWaveStarted: (wave, totalWaves) => {
        bus.emit(GAME_EVENTS.onWaveChanged, { currentWave: wave, totalWaves });
        this.emitState();
      },
      onWaveCleared: (wave) => {
        this.economy.addWaveClearBonus(wave);
        this.emitState();
      },
      onAllWavesFinished: () => {
        if (this.enemyManager.countAlive() === 0) {
          this.finishRun(true);
        }
      }
    });

    if (this.scene.isActive(SCENE_KEYS.Result)) {
      this.scene.stop(SCENE_KEYS.Result);
    }
    if (this.scene.isActive(SCENE_KEYS.Ui)) {
      this.scene.stop(SCENE_KEYS.Ui);
    }
    this.scene.launch(SCENE_KEYS.Ui);

    const handleStart = () => {
      if (this.started) {
        this.scene.restart({ autoStart: true });
        return;
      }
      this.startRun();
    };
    const handlePause = () => {
      this.paused = true;
      this.emitState();
    };
    const handleResume = () => {
      this.paused = false;
      this.emitState();
    };
    const handleSpeed = (payload: { speed: GameSpeed }) => {
      this.speed = payload.speed;
      this.emitState();
    };
    const handleBuild = (payload: { slotId: string; towerType: TowerKind }) => {
      const message = this.towerManager.buildTower(payload.slotId, payload.towerType, this.economy);
      if (message) {
        this.emitError(message);
      }
      this.emitSelection();
      this.emitState();
    };
    const handleUpgrade = (payload: { slotId: string }) => {
      const message = this.towerManager.upgradeTower(payload.slotId, this.economy);
      if (message) {
        this.emitError(message);
      }
      this.emitSelection();
      this.emitState();
    };
    const handleSell = (payload: { slotId: string }) => {
      const message = this.towerManager.sellTower(payload.slotId, this.economy);
      if (message) {
        this.emitError(message);
      }
      this.emitSelection();
      this.emitState();
    };

    bus.on(GAME_COMMANDS.startGame, handleStart);
    bus.on(GAME_COMMANDS.pauseGame, handlePause);
    bus.on(GAME_COMMANDS.resumeGame, handleResume);
    bus.on(GAME_COMMANDS.setGameSpeed, handleSpeed);
    bus.on(GAME_COMMANDS.buildTower, handleBuild);
    bus.on(GAME_COMMANDS.upgradeTower, handleUpgrade);
    bus.on(GAME_COMMANDS.sellTower, handleSell);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_COMMANDS.startGame, handleStart);
      bus.off(GAME_COMMANDS.pauseGame, handlePause);
      bus.off(GAME_COMMANDS.resumeGame, handleResume);
      bus.off(GAME_COMMANDS.setGameSpeed, handleSpeed);
      bus.off(GAME_COMMANDS.buildTower, handleBuild);
      bus.off(GAME_COMMANDS.upgradeTower, handleUpgrade);
      bus.off(GAME_COMMANDS.sellTower, handleSell);
      this.projectileManager.clear();
      this.enemyManager.clear();
      this.towerManager.clear();
    });

    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, objects: unknown[]) => {
      if (!objects.length) {
        this.selectionManager.clear();
        this.towerManager.setSelectedSlot(null);
        this.emitSelection();
      }
    });

    this.emitState();

    if (data?.autoStart) {
      this.startRun();
    }
  }

  update(_time: number, delta: number) {
    if (!this.started || this.finished || this.paused) {
      return;
    }

    const scaledDelta = delta * this.speed;
    const now = this.time.now;

    this.waveManager.update(scaledDelta);
    this.enemyManager.update(scaledDelta, now);
    this.projectileManager.update(scaledDelta, now);
    this.towerManager.update(scaledDelta);

    if (!this.finished && this.waveManager.isFinished() && this.enemyManager.countAlive() === 0) {
      this.finishRun(true);
      return;
    }

    this.statePushElapsed += delta;
    if (this.statePushElapsed >= 120) {
      this.emitState();
      this.statePushElapsed = 0;
    }
  }

  private drawBattlefield() {
    const tileSize = 64;

    for (let y = tileSize / 2; y < this.stage.height + tileSize; y += tileSize) {
      for (let x = tileSize / 2; x < this.stage.width + tileSize; x += tileSize) {
        const useAlt = ((x / tileSize) + (y / tileSize)) % 3 === 0;
        this.add
          .image(x, y, useAlt ? ASSET_KEYS.terrain.grassAlt : ASSET_KEYS.terrain.grass)
          .setDisplaySize(tileSize, tileSize)
          .setTint(useAlt ? this.theme.visuals.grassAltTint : this.theme.visuals.grassTint)
          .setDepth(0);
      }
    }

    this.drawZones();
    this.drawRoad();
    this.placeProps();

    const startPoint = this.stage.path[0];
    const endPoint = this.stage.path[this.stage.path.length - 1];

    if (startPoint) {
      this.add.circle(startPoint.x, startPoint.y, 18, this.theme.visuals.startTint, 0.86).setDepth(4);
      this.add
        .text(startPoint.x + 24, startPoint.y - 18, "진입", {
          fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
          fontSize: "14px",
          color: "#eff9ff"
        })
        .setDepth(4);
    }

    if (endPoint) {
      this.add.circle(endPoint.x, endPoint.y, 20, this.theme.visuals.endTint, 0.9).setDepth(4);
      this.add
        .text(endPoint.x - 18, endPoint.y + 24, "도달", {
          fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
          fontSize: "14px",
          color: "#eff9ff"
        })
        .setDepth(4);
    }

    this.add
      .text(20, 18, `${this.stage.name} · ${this.theme.label}`, {
        fontFamily: "Kenney Future, Pretendard, sans-serif",
        fontSize: "24px",
        color: "#eff9ff"
      })
      .setDepth(5);
    this.add
      .text(20, 48, this.stage.description, {
        fontFamily: "Pretendard, Noto Sans KR, sans-serif",
        fontSize: "15px",
        color: "#9fd9e2"
      })
      .setDepth(5);
  }

  private drawZones() {
    const zones = this.stage.zones ?? [];
    zones.forEach((zone) => {
      const textureKey = zone.kind === "sand" ? ASSET_KEYS.terrain.sand : ASSET_KEYS.terrain.grassAlt;
      for (let row = 0; row < zone.rows; row += 1) {
        for (let col = 0; col < zone.cols; col += 1) {
          this.add
            .image(zone.x + col * 64, zone.y + row * 64, textureKey)
            .setDisplaySize(64, 64)
            .setTint(this.theme.visuals.patchTint)
            .setDepth(0.5)
            .setAlpha(zone.alpha ?? 0.9);
        }
      }
    });
  }

  private drawRoad() {
    const step = 48;

    this.stage.path.slice(0, -1).forEach((point, index) => {
      const next = this.stage.path[index + 1];
      if (!next) {
        return;
      }

      const direction = this.getDirection(point, next);
      const roadKey =
        direction === "east" || direction === "west"
          ? ASSET_KEYS.terrain.roadHorizontal
          : ASSET_KEYS.terrain.roadVertical;
      const distance = Phaser.Math.Distance.Between(point.x, point.y, next.x, next.y);
      const steps = Math.max(1, Math.ceil(distance / step));

      for (let offset = 0; offset <= steps; offset += 1) {
        const ratio = offset / steps;
        const x = Phaser.Math.Linear(point.x, next.x, ratio);
        const y = Phaser.Math.Linear(point.y, next.y, ratio);
        this.add
          .image(x, y, roadKey)
          .setDisplaySize(64, 64)
          .setTint(this.theme.visuals.roadTint)
          .setDepth(2);
      }
    });

    this.stage.path.slice(1, -1).forEach((point, index) => {
      const previous = this.stage.path[index];
      const next = this.stage.path[index + 2];
      if (!previous || !next) {
        return;
      }

      this.add
        .image(point.x, point.y, this.getCornerKey(previous, point, next))
        .setDisplaySize(64, 64)
        .setTint(this.theme.visuals.roadTint)
        .setDepth(3);
    });
  }

  private placeProps() {
    const props = this.stage.props ?? [];
    props.forEach((prop) => {
      const assetKey = ASSET_KEYS.props[prop.kind];
      this.add
        .image(prop.x, prop.y, assetKey)
        .setScale(prop.scale ?? 1)
        .setAngle(prop.angle ?? 0)
        .setDepth(prop.depth ?? 1.5)
        .setTint(this.theme.visuals.propTint)
        .setAlpha(prop.alpha ?? 0.96);
    });
  }

  private getDirection(from: Point, to: Point): Direction {
    if (from.x === to.x) {
      return from.y < to.y ? "south" : "north";
    }

    return from.x < to.x ? "east" : "west";
  }

  private getCornerKey(previous: Point, current: Point, next: Point) {
    const first = this.getDirection(previous, current);
    const second = this.getDirection(current, next);
    const directions = new Set<Direction>([first, second]);

    if (directions.has("north") && directions.has("east")) {
      return ASSET_KEYS.terrain.roadCornerLl;
    }
    if (directions.has("north") && directions.has("west")) {
      return ASSET_KEYS.terrain.roadCornerLr;
    }
    if (directions.has("south") && directions.has("east")) {
      return ASSET_KEYS.terrain.roadCornerUl;
    }

    return ASSET_KEYS.terrain.roadCornerUr;
  }

  private startRun() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    this.started = true;
    this.finished = false;
    this.paused = false;
    this.speed = 1;
    this.runStartedAt = Date.now();
    this.waveManager.start();
    bus.emit(GAME_EVENTS.onRunStarted, { stageId: this.stage.id });
    this.emitState();
  }

  private selectSlot(slotId: string) {
    this.selectionManager.select(slotId);
    this.towerManager.setSelectedSlot(slotId);
    this.emitSelection();
  }

  private emitSelection() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    bus.emit(GAME_EVENTS.onSelectionChanged, this.selectionManager.getSelection(this.towerManager));
  }

  private emitState() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const snapshot: GameStateSnapshot = {
      stageId: this.stage.id,
      stageName: this.stage.name,
      gameMode: this.modeId,
      modeName: this.theme.name,
      gold: this.economy.getGold(),
      lives: this.economy.getLives(),
      currentWave: this.waveManager.getCurrentWave(),
      totalWaves: this.waveManager.getTotalWaves(),
      nextWaveSummary: getWaveSummary(
        this.started
          ? Math.min(this.waveManager.getCurrentWave() + 1, this.waveManager.getTotalWaves())
          : 1
      ),
      speed: this.speed,
      score: this.economy.getScore(),
      running: this.started && !this.finished,
      paused: this.paused,
      enemiesAlive: this.enemyManager.countAlive()
    };

    bus.emit(GAME_EVENTS.onGoldChanged, { gold: snapshot.gold });
    bus.emit(GAME_EVENTS.onLifeChanged, { lives: snapshot.lives });
    bus.emit(GAME_EVENTS.onStateChanged, snapshot);
  }

  private emitError(message: string) {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    bus.emit(GAME_EVENTS.onError, { message });
  }

  private finishRun(cleared: boolean) {
    if (this.finished) {
      return;
    }

    if (cleared) {
      this.economy.addClearBonus();
    }

    this.finished = true;
    this.paused = false;
    this.emitState();

    const result: GameRunResult = {
      stageId: this.stage.id,
      cleared,
      score: this.economy.getScore(),
      bestWave: cleared ? this.waveManager.getTotalWaves() : this.waveManager.getCurrentWave(),
      remainingLives: this.economy.getLives(),
      goldSpent: this.economy.getGoldSpent(),
      durationMs: Math.max(Date.now() - this.runStartedAt, 48_000),
      playedAt: new Date().toISOString(),
      summary: cleared
        ? `${this.stage.name} ${this.waveManager.getTotalWaves()}웨이브 방어 성공`
        : `${this.stage.name} ${this.waveManager.getCurrentWave()}웨이브에서 방어 실패`
    };

    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    bus.emit(GAME_EVENTS.onRunFinished, {
      result
    });

    this.scene.launch(SCENE_KEYS.Result, { result });
  }
}
