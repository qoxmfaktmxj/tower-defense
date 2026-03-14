import Phaser from "phaser";
import { GameAudioController } from "../audio/GameAudioController";
import { GAME_COMMANDS } from "../bridge/gameCommands";
import { GAME_EVENTS } from "../bridge/gameEvents";
import { PATH_WIDTH } from "../core/config/gameConfig";
import { ASSET_KEYS } from "../core/constants/assetKeys";
import { SCENE_KEYS } from "../core/constants/sceneKeys";
import type {
  GameModeId,
  GameRunResult,
  GameSpeed,
  GameStateSnapshot,
  StageId,
  TowerKind
} from "../core/types/gameTypes";
import {
  defaultGameModeId,
  getGameModeDefinition,
  type GameModeThemeDefinition
} from "../data/gameModes";
import { enemyDefinitions } from "../data/enemies/enemyDefinitions";
import { defaultStageId, getStageDefinition } from "../data/stages/stageDefinitions";
import { resolveStageTheme } from "../data/stages/resolveStageTheme";
import { towerDefinitions } from "../data/towers/towerDefinitions";
import { getWaveDefinitions } from "../data/waves/waveDefinitions";
import { getWaveSummary } from "../gameCatalog";
import { EconomyManager } from "../managers/EconomyManager";
import { EnemyManager } from "../managers/EnemyManager";
import { ProjectileManager } from "../managers/ProjectileManager";
import { SelectionManager } from "../managers/SelectionManager";
import { TowerManager } from "../managers/TowerManager";
import { WaveManager } from "../managers/WaveManager";

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
  private audio?: GameAudioController;
  private ambientLoop?: Phaser.Time.TimerEvent;
  private speed: GameSpeed = 1;
  private started = false;
  private finished = false;
  private paused = false;
  private runStartedAt = 0;
  private statePushElapsed = 0;
  private stageWaves = getWaveDefinitions(defaultStageId);

  constructor() {
    super(SCENE_KEYS.Game);
  }

  create(data?: { autoStart?: boolean }) {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    const stageId = (this.game.registry.get("stageId") as StageId | undefined) ?? defaultStageId;
    this.modeId = (this.game.registry.get("gameMode") as GameModeId | undefined) ?? defaultGameModeId;
    this.stage = getStageDefinition(stageId);
    this.theme = resolveStageTheme(getGameModeDefinition(this.modeId), this.stage);
    this.stageWaves = getWaveDefinitions(this.stage.id);
    this.audio = new GameAudioController(
      (this.game.registry.get("soundVolume") as number | undefined) ?? 0.75
    );

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBackgroundColor(this.theme.visuals.backgroundColor);

    this.drawBattlefield();
    this.economy = new EconomyManager(this.stage.initialGold, this.stage.initialLives);
    this.selectionManager = new SelectionManager();
    this.enemyManager = new EnemyManager(this, this.stage, enemyDefinitions, this.theme, {
      onEnemyKilled: (enemy) => {
        this.economy.addReward(enemy.definition.reward);
        this.audio?.playEnemyDown(enemy.definition.key);
        this.emitState();
      },
      onEnemyEscaped: () => {
        this.economy.loseLife(1);
        this.audio?.playEnemyEscape();
        this.emitState();
        if (this.economy.getLives() <= 0) {
          this.finishRun(false);
        }
      }
    });
    this.projectileManager = new ProjectileManager(
      this,
      this.enemyManager,
      this.theme,
      (kind, specialEffect) => this.audio?.playImpact(kind, specialEffect)
    );
    this.towerManager = new TowerManager(
      this,
      this.stage,
      towerDefinitions,
      this.theme,
      this.enemyManager,
      this.projectileManager,
      (slotId) => this.selectSlot(slotId),
      (towerType, specialEffect) => this.audio?.playTowerFire(towerType, specialEffect)
    );
    this.waveManager = new WaveManager(this.stageWaves, this.enemyManager, {
      onWaveStarted: (wave, totalWaves) => {
        bus.emit(GAME_EVENTS.onWaveChanged, { currentWave: wave, totalWaves });
        if (wave % 5 === 0) {
          this.cameras.main.shake(220, 0.0028, true);
          this.cameras.main.flash(160, 255, 120, 110, true);
        } else {
          this.cameras.main.flash(90, 70, 130, 160, true);
        }
        this.audio?.playWaveStart(wave);
        this.emitState();
      },
      onWaveCleared: (wave) => {
        this.economy.addWaveClearBonus(wave);
        this.cameras.main.flash(80, 80, 170, 120, true);
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
      void this.audio?.resume();
      this.audio?.playUiConfirm();
      if (this.started) {
        this.scene.restart({ autoStart: true });
        return;
      }
      this.startRun();
    };
    const handlePause = () => {
      this.paused = true;
      this.audio?.playUiToggle(false);
      this.emitState();
    };
    const handleResume = () => {
      void this.audio?.resume();
      this.paused = false;
      this.audio?.playUiToggle(true);
      this.emitState();
    };
    const handleSpeed = (payload: { speed: GameSpeed }) => {
      this.speed = payload.speed;
      this.audio?.playSpeedShift(payload.speed);
      this.emitState();
    };
    const handleVolume = (payload: { volume: number }) => {
      this.game.registry.set("soundVolume", payload.volume);
      this.audio?.setVolume(payload.volume);
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
    bus.on(GAME_COMMANDS.setSoundVolume, handleVolume);
    bus.on(GAME_COMMANDS.buildTower, handleBuild);
    bus.on(GAME_COMMANDS.upgradeTower, handleUpgrade);
    bus.on(GAME_COMMANDS.sellTower, handleSell);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_COMMANDS.startGame, handleStart);
      bus.off(GAME_COMMANDS.pauseGame, handlePause);
      bus.off(GAME_COMMANDS.resumeGame, handleResume);
      bus.off(GAME_COMMANDS.setGameSpeed, handleSpeed);
      bus.off(GAME_COMMANDS.setSoundVolume, handleVolume);
      bus.off(GAME_COMMANDS.buildTower, handleBuild);
      bus.off(GAME_COMMANDS.upgradeTower, handleUpgrade);
      bus.off(GAME_COMMANDS.sellTower, handleSell);
      this.stopAmbientLoop();
      this.projectileManager.clear();
      this.enemyManager.clear();
      this.towerManager.clear();
      this.audio?.destroy();
    });

    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, objects: unknown[]) => {
      void this.audio?.resume();
      if (!objects.length) {
        this.selectionManager.clear();
        this.towerManager.setSelectedSlot(null);
        this.emitSelection();
      }
    });

    this.emitState();

    if (data?.autoStart) {
      handleStart();
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
    this.drawBackdrop();

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
    this.drawMarkers();
  }

  private drawBackdrop() {
    const backgroundTint = Phaser.Display.Color.HexStringToColor(
      this.theme.visuals.backgroundColor
    ).color;

    this.add.rectangle(480, 270, 960, 540, backgroundTint, 1).setDepth(-4);
    this.add.rectangle(480, 270, 960, 540, 0x02070b, 0.18).setDepth(-4);
    this.add
      .circle(164, 112, 190, this.stage.atmosphere.glowTint, this.stage.atmosphere.glowAlpha + 0.04)
      .setDepth(-3);
    this.add
      .circle(
        812,
        412,
        220,
        this.stage.atmosphere.glowTintAlt,
        this.stage.atmosphere.glowAlpha + 0.02
      )
      .setDepth(-3);
    this.add
      .rectangle(480, 270, 960, 540, this.stage.atmosphere.hazeTint, this.stage.atmosphere.hazeAlpha)
      .setDepth(-2);
    this.add.rectangle(480, 38, 960, 120, 0x02070b, 0.18).setDepth(-1.8);
    this.add.rectangle(480, 504, 960, 120, 0x02070b, 0.22).setDepth(-1.8);

    const grid = this.add.graphics().setDepth(-1);
    grid.lineStyle(1, this.stage.atmosphere.pathGuideTint, 0.08);
    for (let x = 0; x <= this.stage.width; x += 48) {
      grid.lineBetween(x, 0, x, this.stage.height);
    }
    for (let y = 0; y <= this.stage.height; y += 48) {
      grid.lineBetween(0, y, this.stage.width, y);
    }

    const scanlines = this.add.graphics().setDepth(-0.8);
    scanlines.lineStyle(1, 0xffffff, 0.02);
    for (let y = 12; y <= this.stage.height; y += 18) {
      scanlines.lineBetween(0, y, this.stage.width, y);
    }
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
    this.drawRoadLayer(PATH_WIDTH + 24, 0x03080d, 0.92, 1.6);
    this.drawRoadLayer(PATH_WIDTH + 10, 0x1b2b34, 0.96, 1.8);
    this.drawRoadLayer(PATH_WIDTH, this.theme.visuals.roadTint, 0.94, 2);
    this.drawRoadLayer(PATH_WIDTH - 16, 0xffffff, 0.08, 2.05);

    const guide = this.add.graphics().setDepth(2.2);
    guide.lineStyle(4, this.stage.atmosphere.pathGuideTint, this.stage.atmosphere.pathGuideAlpha);
    guide.beginPath();
    const [firstPoint, ...rest] = this.stage.path;
    guide.moveTo(firstPoint?.x ?? 0, firstPoint?.y ?? 0);
    rest.forEach((point) => guide.lineTo(point.x, point.y));
    guide.strokePath();

    this.drawLaneLights();
  }

  private drawRoadLayer(width: number, color: number, alpha: number, depth: number) {
    const radius = width / 2;

    this.stage.path.forEach((point) => {
      this.add.circle(point.x, point.y, radius, color, alpha).setDepth(depth);
    });

    this.stage.path.slice(0, -1).forEach((point, index) => {
      const next = this.stage.path[index + 1];
      if (!next) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(point.x, point.y, next.x, next.y);
      const angle = Phaser.Math.Angle.Between(point.x, point.y, next.x, next.y);
      const midpointX = (point.x + next.x) / 2;
      const midpointY = (point.y + next.y) / 2;

      this.add
        .rectangle(midpointX, midpointY, distance + width, width, color, alpha)
        .setRotation(angle)
        .setDepth(depth);
    });
  }

  private drawLaneLights() {
    const lights = this.add.graphics().setDepth(2.3);
    lights.fillStyle(this.stage.atmosphere.pathGuideTint, 0.3);

    this.stage.path.slice(0, -1).forEach((point, index) => {
      const next = this.stage.path[index + 1];
      if (!next) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(point.x, point.y, next.x, next.y);
      const count = Math.floor(distance / 52);
      for (let step = 1; step <= count; step += 1) {
        const ratio = step / (count + 1);
        const x = Phaser.Math.Linear(point.x, next.x, ratio);
        const y = Phaser.Math.Linear(point.y, next.y, ratio);
        lights.fillCircle(x, y, step % 2 === 0 ? 2.6 : 2);
      }
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

  private drawMarkers() {
    const startPoint = this.stage.path[0];
    const endPoint = this.stage.path[this.stage.path.length - 1];

    if (startPoint) {
      this.add.circle(startPoint.x, startPoint.y, 26, this.theme.visuals.startTint, 0.18).setDepth(4);
      this.add.circle(startPoint.x, startPoint.y, 18, this.theme.visuals.startTint, 0.9).setDepth(4);
      this.add
        .text(startPoint.x + 24, startPoint.y - 18, "진입", {
          fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
          fontSize: "14px",
          color: "#eef7fc"
        })
        .setDepth(4);
    }

    if (endPoint) {
      this.add.circle(endPoint.x, endPoint.y, 28, this.theme.visuals.endTint, 0.16).setDepth(4);
      this.add.circle(endPoint.x, endPoint.y, 20, this.theme.visuals.endTint, 0.92).setDepth(4);
      this.add
        .text(endPoint.x - 18, endPoint.y + 24, "도달", {
          fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
          fontSize: "14px",
          color: "#eef7fc"
        })
        .setDepth(4);
    }
  }

  private startRun() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;
    this.started = true;
    this.finished = false;
    this.paused = false;
    this.speed = 1;
    this.runStartedAt = Date.now();
    this.startAmbientLoop();
    this.waveManager.start();
    bus.emit(GAME_EVENTS.onRunStarted, { stageId: this.stage.id });
    this.emitState();
  }

  private startAmbientLoop() {
    this.stopAmbientLoop();
    this.ambientLoop = this.time.addEvent({
      delay: 1600,
      loop: true,
      callback: () => {
        if (!this.paused && this.started && !this.finished) {
          this.audio?.playAmbientPulse(this.stage.id);
        }
      }
    });
  }

  private stopAmbientLoop() {
    this.ambientLoop?.destroy();
    this.ambientLoop = undefined;
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
          : 1,
        this.stage.id
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
    this.stopAmbientLoop();
    if (cleared) {
      this.audio?.playVictory();
    } else {
      this.audio?.playDefeat();
    }
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
