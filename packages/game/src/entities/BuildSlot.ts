import { ASSET_KEYS } from "../core/constants/assetKeys";
import type { BuildSlotDefinition } from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";

export class BuildSlot {
  readonly id: string;
  readonly x: number;
  readonly y: number;

  private readonly glow: Phaser.GameObjects.Arc;
  private readonly pad: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;
  private occupied = false;
  private selected = false;
  private readonly theme: GameModeThemeDefinition;

  constructor(
    scene: Phaser.Scene,
    definition: BuildSlotDefinition,
    theme: GameModeThemeDefinition,
    onSelect: (slotId: string) => void
  ) {
    this.id = definition.id;
    this.x = definition.x;
    this.y = definition.y;
    this.theme = theme;

    this.glow = scene.add
      .circle(this.x, this.y, 30, this.theme.visuals.slotGlowTint, 0.16)
      .setDepth(3)
      .setVisible(false);
    this.pad = scene.add
      .image(this.x, this.y, ASSET_KEYS.slots.buildPad)
      .setScale(0.92)
      .setTint(this.theme.visuals.slotAvailableTint)
      .setAlpha(0.86)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    this.label = scene.add
      .text(this.x, this.y + 1, this.id, {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "13px",
        color: "#f1fbff"
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.pad.on("pointerdown", () => onSelect(this.id));
    this.pad.on("pointerover", () => {
      this.glow.setVisible(true);
      this.pad.setScale(this.selected ? 1.04 : 0.98);
    });
    this.pad.on("pointerout", () => {
      this.glow.setVisible(this.selected);
      this.pad.setScale(this.selected ? 1 : 0.92);
    });
  }

  setOccupied(occupied: boolean) {
    this.occupied = occupied;
    this.pad.setTint(
      occupied ? this.theme.visuals.slotOccupiedTint : this.theme.visuals.slotAvailableTint
    );
    this.pad.setAlpha(occupied ? 0.92 : 0.86);
  }

  setSelected(selected: boolean) {
    this.selected = selected;
    this.glow.setVisible(selected);
    this.glow.setFillStyle(
      selected ? this.theme.visuals.slotSelectedTint : this.theme.visuals.slotGlowTint,
      selected ? 0.26 : 0.16
    );
    this.pad.setScale(selected ? 1 : 0.92);
  }

  destroy() {
    this.glow.destroy();
    this.pad.destroy();
    this.label.destroy();
  }
}
