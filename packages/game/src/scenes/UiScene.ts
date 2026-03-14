import Phaser from "phaser";
import { GAME_EVENTS, type GameEventMap } from "../bridge/gameEvents";
import { SCENE_KEYS } from "../core/constants/sceneKeys";

const FONT_FAMILY = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export class UiScene extends Phaser.Scene {
  private helperText?: Phaser.GameObjects.Text;
  private selectionText?: Phaser.GameObjects.Text;
  private waveBanner?: Phaser.GameObjects.Container;
  private waveBannerText?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.Ui);
  }

  create() {
    const bus = this.game.registry.get("bridgeBus") as Phaser.Events.EventEmitter;

    const selectionPanel = this.add
      .rectangle(828, 38, 224, 54, 0x061017, 0.72)
      .setStrokeStyle(1, 0x3bb8d7, 0.4)
      .setDepth(28);
    this.selectionText = this.add
      .text(930, 38, "선택 없음", {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        fontStyle: "700",
        color: "#eff7fb",
        align: "right"
      })
      .setOrigin(1, 0.5)
      .setDepth(29);

    const helperPanel = this.add
      .rectangle(210, 502, 384, 34, 0x061017, 0.72)
      .setStrokeStyle(1, 0x3bb8d7, 0.24)
      .setDepth(28);
    this.helperText = this.add
      .text(26, 503, "슬롯 선택 후 하단 액션 바에서 포대를 배치하십시오.", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        color: "#a9bcc8"
      })
      .setOrigin(0, 0.5)
      .setDepth(29);

    const bannerBackground = this.add
      .rectangle(480, 74, 300, 52, 0x061017, 0.84)
      .setStrokeStyle(1, 0x3bb8d7, 0.42)
      .setDepth(28)
      .setVisible(false);
    this.waveBannerText = this.add
      .text(480, 74, "", {
        fontFamily: FONT_FAMILY,
        fontSize: "18px",
        fontStyle: "700",
        color: "#eff7fb"
      })
      .setOrigin(0.5)
      .setDepth(29)
      .setVisible(false);
    this.waveBanner = this.add.container(0, 0, [bannerBackground, this.waveBannerText]).setDepth(28);

    const handleWaveChanged = ({ currentWave, totalWaves }: GameEventMap["onWaveChanged"]) => {
      const bossWave = currentWave % 5 === 0;
      const bannerText = bossWave
        ? `경보 · 보스 웨이브 ${currentWave}/${totalWaves}`
        : `웨이브 ${currentWave}/${totalWaves}`;

      bannerBackground.setStrokeStyle(1, bossWave ? 0xff6c63 : 0x3bb8d7, 0.66);
      this.waveBannerText?.setText(bannerText);
      this.waveBanner?.setVisible(true).setAlpha(0).setScale(0.94);
      bannerBackground.setVisible(true);
      this.waveBannerText?.setVisible(true);

      this.tweens.add({
        targets: this.waveBanner,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        yoyo: false,
        onComplete: () => {
          this.time.delayedCall(1000, () => {
            this.tweens.add({
              targets: this.waveBanner,
              alpha: 0,
              duration: 220,
              onComplete: () => {
                this.waveBanner?.setVisible(false);
                bannerBackground.setVisible(false);
                this.waveBannerText?.setVisible(false);
              }
            });
          });
        }
      });
    };

    const handleSelection = (selection: GameEventMap["onSelectionChanged"]) => {
      if (!selection) {
        this.selectionText?.setText("선택 없음");
        this.helperText?.setText("슬롯 선택 후 하단 액션 바에서 포대를 배치하십시오.");
        return;
      }

      if (!selection.tower) {
        this.selectionText?.setText(`${selection.slotId} · 빈 슬롯`);
        this.helperText?.setText(`${selection.slotId} 선택됨 · Q/W/E로 포대 배치`);
        return;
      }

      this.selectionText?.setText(`${selection.slotId} · ${selection.tower.displayName} Lv.${selection.tower.level}`);
      this.helperText?.setText(
        `${selection.tower.displayName} 선택됨 · U 업그레이드 · S 판매`
      );
    };

    const handleState = (snapshot: GameEventMap["onStateChanged"]) => {
      if (snapshot.paused) {
        helperPanel.setStrokeStyle(1, 0xf1c35a, 0.36);
      } else {
        helperPanel.setStrokeStyle(1, 0x3bb8d7, 0.24);
      }
    };

    bus.on(GAME_EVENTS.onWaveChanged, handleWaveChanged);
    bus.on(GAME_EVENTS.onSelectionChanged, handleSelection);
    bus.on(GAME_EVENTS.onStateChanged, handleState);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(GAME_EVENTS.onWaveChanged, handleWaveChanged);
      bus.off(GAME_EVENTS.onSelectionChanged, handleSelection);
      bus.off(GAME_EVENTS.onStateChanged, handleState);
    });
  }
}
