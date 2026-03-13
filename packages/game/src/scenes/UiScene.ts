import Phaser from "phaser";
import { GAME_EVENTS, type GameEventMap } from "../bridge/gameEvents";
import { SCENE_KEYS } from "../core/constants/sceneKeys";

const FONT_FAMILY = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export class UiScene extends Phaser.Scene {
  private hudText?: Phaser.GameObjects.Text;
  private helperText?: Phaser.GameObjects.Text;
  private selectionText?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.Ui);
  }

  create() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;

    this.add
      .rectangle(18, 18, 360, 34, 0xf8fffc, 0.84)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x938ba1, 0.42)
      .setDepth(29);
    this.hudText = this.add
      .text(30, 27, "", {
        fontFamily: FONT_FAMILY,
        fontSize: "15px",
        color: "#324349"
      })
      .setDepth(30);

    this.add
      .rectangle(714, 18, 228, 54, 0xf8fffc, 0.84)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x938ba1, 0.42)
      .setDepth(29);
    this.selectionText = this.add
      .text(930, 28, "선택 없음", {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        fontStyle: "700",
        color: "#324349",
        align: "right"
      })
      .setOrigin(1, 0)
      .setDepth(30);

    this.add
      .rectangle(18, 490, 360, 32, 0xf8fffc, 0.84)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x938ba1, 0.36)
      .setDepth(29);
    this.helperText = this.add
      .text(30, 498, "슬롯을 선택한 뒤 화면 안 버튼으로 포대를 배치하세요.", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        color: "#5b6f77"
      })
      .setDepth(30);

    const handleState = (snapshot: GameEventMap["onStateChanged"]) => {
      this.hudText?.setText(
        `골드 ${snapshot.gold} | 생명 ${snapshot.lives} | 웨이브 ${snapshot.currentWave}/${snapshot.totalWaves} | 속도 x${snapshot.speed}${snapshot.paused ? " | 일시 정지" : ""}`
      );
    };

    const handleSelection = (selection: GameEventMap["onSelectionChanged"]) => {
      if (!selection) {
        this.selectionText?.setText("선택 없음");
        return;
      }

      if (!selection.tower) {
        this.selectionText?.setText(`${selection.slotId}\n빈 슬롯`);
        return;
      }

      this.selectionText?.setText(
        `${selection.slotId}\n${selection.tower.displayName} Lv.${selection.tower.level}`
      );
    };

    bus.on(GAME_EVENTS.onStateChanged, handleState);
    bus.on(GAME_EVENTS.onSelectionChanged, handleSelection);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_EVENTS.onStateChanged, handleState);
      bus.off(GAME_EVENTS.onSelectionChanged, handleSelection);
    });
  }
}
