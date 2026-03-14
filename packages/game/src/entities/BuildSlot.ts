import { ASSET_KEYS } from "../core/constants/assetKeys";
import type { BuildSlotDefinition } from "../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../data/gameModes";

export class BuildSlot {
  readonly id: string;
  readonly x: number;
  readonly y: number;

  private readonly glow: Phaser.GameObjects.Arc;
  private readonly ring: Phaser.GameObjects.Arc;
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
      .circle(this.x, this.y, 34, this.theme.visuals.slotGlowTint, 0.18)
      .setDepth(3)
      .setVisible(false);
    this.ring = scene.add
      .circle(this.x, this.y, 24)
      .setStrokeStyle(2, this.theme.visuals.slotGlowTint, 0.28)
      .setDepth(3.4);
    this.pad = scene.add
      .image(this.x, this.y, ASSET_KEYS.slots.buildPad)
      .setScale(0.94)
      .setTint(this.theme.visuals.slotAvailableTint)
      .setAlpha(0.88)
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
      this.ring.setStrokeStyle(2, this.theme.visuals.slotSelectedTint, 0.64);
      this.pad.setScale(this.selected ? 1.06 : 1);
    });
    this.pad.on("pointerout", () => {
      this.glow.setVisible(this.selected);
      this.ring.setStrokeStyle(
        2,
        this.selected ? this.theme.visuals.slotSelectedTint : this.theme.visuals.slotGlowTint,
        this.selected ? 0.7 : 0.28
      );
      this.pad.setScale(this.selected ? 1.02 : 0.94);
    });

    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.1, to: 0.24 },
      duration: 920,
      yoyo: true,
      repeat: -1
    });
  }

  setOccupied(occupied: boolean) {
    this.occupied = occupied;
    this.pad.setTint(
      occupied ? this.theme.visuals.slotOccupiedTint : this.theme.visuals.slotAvailableTint
    );
    this.pad.setAlpha(occupied ? 0.96 : 0.88);
    this.ring.setStrokeStyle(
      2,
      occupied ? this.theme.visuals.slotOccupiedTint : this.theme.visuals.slotGlowTint,
      occupied ? 0.42 : 0.28
    );
  }

  setSelected(selected: boolean) {
    this.selected = selected;
    this.glow.setVisible(selected);
    this.glow.setFillStyle(
      selected ? this.theme.visuals.slotSelectedTint : this.theme.visuals.slotGlowTint,
      selected ? 0.26 : 0.16
    );
    this.ring.setStrokeStyle(
      2,
      selected ? this.theme.visuals.slotSelectedTint : this.theme.visuals.slotGlowTint,
      selected ? 0.74 : this.occupied ? 0.42 : 0.28
    );
    this.pad.setScale(selected ? 1.02 : 0.94);
  }

  destroy() {
    this.glow.destroy();
    this.ring.destroy();
    this.pad.destroy();
    this.label.destroy();
  }
}
