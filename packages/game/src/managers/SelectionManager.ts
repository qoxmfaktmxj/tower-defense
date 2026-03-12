import type { GameSelection } from "../core/types/gameTypes";
import { TowerManager } from "./TowerManager";

export class SelectionManager {
  private selectedSlotId: string | null = null;

  select(slotId: string) {
    this.selectedSlotId = slotId;
  }

  clear() {
    this.selectedSlotId = null;
  }

  getSelection(towerManager: TowerManager): GameSelection | null {
    if (!this.selectedSlotId) {
      return null;
    }

    const tower = towerManager.getSelectionInfo(this.selectedSlotId);
    return {
      slotId: this.selectedSlotId,
      tower: tower ?? undefined
    };
  }

  getSelectedSlotId() {
    return this.selectedSlotId;
  }
}
