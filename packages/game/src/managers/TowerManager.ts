import { BuildSlot } from "../entities/BuildSlot";
import { Tower } from "../entities/Tower";
import type {
  SelectedTowerInfo,
  StageDefinition,
  TowerDefinition,
  TowerKind
} from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";
import { EconomyManager } from "./EconomyManager";
import { EnemyManager } from "./EnemyManager";
import { ProjectileManager } from "./ProjectileManager";

export class TowerManager {
  private readonly slots = new Map<string, BuildSlot>();
  private readonly towers = new Map<string, Tower>();
  private readonly onSelect: (slotId: string) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    stage: StageDefinition,
    private readonly towerDefs: Record<TowerKind, TowerDefinition>,
    private readonly theme: GameModeThemeDefinition,
    private readonly enemyManager: EnemyManager,
    private readonly projectileManager: ProjectileManager,
    onSelect: (slotId: string) => void
  ) {
    this.onSelect = onSelect;
    stage.buildSlots.forEach((slot) => {
      this.slots.set(slot.id, new BuildSlot(scene, slot, this.theme, onSelect));
    });
  }

  buildTower(slotId: string, towerType: TowerKind, economy: EconomyManager) {
    const slot = this.slots.get(slotId);
    const definition = this.towerDefs[towerType];
    if (!slot) {
      return "선택한 슬롯을 찾을 수 없습니다.";
    }
    if (this.towers.has(slotId)) {
      return "이미 타워가 배치된 슬롯입니다.";
    }
    if (!economy.spend(definition.buildCost)) {
      return "골드가 부족합니다.";
    }

    const tower = new Tower(
      this.scene,
      slotId,
      slot.x,
      slot.y,
      definition,
      this.theme,
      this.onSelect
    );
    this.towers.set(slotId, tower);
    slot.setOccupied(true);
    return null;
  }

  upgradeTower(slotId: string, economy: EconomyManager) {
    const tower = this.towers.get(slotId);
    if (!tower) {
      return "업그레이드할 타워가 없습니다.";
    }

    const upgradeCost = tower.getUpgradeCost();
    if (!upgradeCost) {
      return "이미 최대 레벨입니다.";
    }
    if (!economy.spend(upgradeCost)) {
      return "골드가 부족합니다.";
    }

    tower.upgrade();
    return null;
  }

  sellTower(slotId: string, economy: EconomyManager) {
    const tower = this.towers.get(slotId);
    const slot = this.slots.get(slotId);
    if (!tower || !slot) {
      return "판매할 타워가 없습니다.";
    }

    economy.addGold(tower.getSellValue());
    tower.destroy();
    this.towers.delete(slotId);
    slot.setOccupied(false);
    return null;
  }

  update(deltaMs: number) {
    this.towers.forEach((tower) => {
      tower.update(deltaMs, this.enemyManager, this.projectileManager);
    });
  }

  setSelectedSlot(slotId: string | null) {
    this.slots.forEach((slot, key) => {
      slot.setSelected(slotId === key);
    });
    this.towers.forEach((tower, key) => {
      tower.setSelected(slotId === key);
    });
  }

  getSelectionInfo(slotId: string): SelectedTowerInfo | null {
    return this.towers.get(slotId)?.getSelectedInfo() ?? null;
  }

  clear() {
    this.slots.forEach((slot) => slot.destroy());
    this.towers.forEach((tower) => tower.destroy());
    this.slots.clear();
    this.towers.clear();
  }
}
