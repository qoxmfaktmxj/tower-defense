import Phaser from "phaser";
import { GAME_EVENTS, type GameEventMap } from "../bridge/gameEvents";
import { SCENE_KEYS } from "../core/constants/sceneKeys";

export class UiScene extends Phaser.Scene {
  private hudText?: Phaser.GameObjects.Text;
  private helperText?: Phaser.GameObjects.Text;
  private selectionText?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.Ui);
  }

  create() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;

    this.hudText = this.add
      .text(20, 18, "", {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "18px",
        color: "#f6fbfc"
      })
      .setDepth(30);

    this.helperText = this.add
      .text(20, 500, "슬롯을 클릭한 뒤 Q / W / E 또는 우측 패널로 타워를 배치하세요.", {
        fontFamily: "Pretendard, Noto Sans KR, sans-serif",
        fontSize: "14px",
        color: "#9ed8df"
      })
      .setDepth(30);

    this.selectionText = this.add
      .text(650, 18, "선택 없음", {
        fontFamily: "Kenney Future Narrow, Pretendard, sans-serif",
        fontSize: "18px",
        color: "#f6fbfc",
        align: "right"
      })
      .setDepth(30);

    const handleState = (snapshot: GameEventMap["onStateChanged"]) => {
      this.hudText?.setText(
        `${snapshot.modeName} · ${snapshot.stageName}   골드 ${snapshot.gold}   생명 ${snapshot.lives}   웨이브 ${snapshot.currentWave}/${snapshot.totalWaves}   점수 ${snapshot.score}   속도 x${snapshot.speed}${snapshot.paused ? "   일시정지" : ""}`
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
