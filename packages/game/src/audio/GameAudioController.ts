import type {
  EnemyKind,
  StageId,
  TowerKind
} from "../core/types/gameTypes";

type ImpactKind = "hit" | "explosion" | "freeze";

interface ToneSpec {
  frequency: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  delay?: number;
  slideTo?: number;
}

type BrowserAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export class GameAudioController {
  private readonly context: AudioContext | null;
  private readonly masterGain: GainNode | null;
  private volume = 0.75;
  private lastEventAt = new Map<string, number>();

  constructor(initialVolume = 0.75) {
    if (typeof window === "undefined") {
      this.context = null;
      this.masterGain = null;
      return;
    }

    const browserWindow = window as BrowserAudioWindow;
    const AudioContextCtor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
    if (!AudioContextCtor) {
      this.context = null;
      this.masterGain = null;
      return;
    }

    this.context = new AudioContextCtor();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.setVolume(initialVolume);
  }

  async resume() {
    if (!this.context || this.context.state !== "suspended") {
      return;
    }

    try {
      await this.context.resume();
    } catch {
      // Ignore resume failures; the game should still function silently.
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(volume, 1));

    if (!this.context || !this.masterGain) {
      return;
    }

    const currentTime = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(currentTime);
    this.masterGain.gain.setTargetAtTime(this.volume * 0.18, currentTime, 0.02);
  }

  playUiConfirm() {
    this.playSequence([
      { frequency: 440, duration: 0.06, gain: 0.24, type: "triangle" },
      { frequency: 660, duration: 0.08, gain: 0.18, type: "triangle", delay: 0.04 }
    ]);
  }

  playUiToggle(active: boolean) {
    this.playSequence([
      {
        frequency: active ? 520 : 340,
        slideTo: active ? 720 : 220,
        duration: 0.08,
        gain: 0.16,
        type: "sine"
      }
    ]);
  }

  playSpeedShift(speed: 1 | 2) {
    this.playSequence([
      {
        frequency: speed === 2 ? 760 : 500,
        slideTo: speed === 2 ? 980 : 420,
        duration: 0.09,
        gain: 0.18,
        type: "triangle"
      }
    ]);
  }

  playWaveStart(wave: number) {
    const gain = wave >= 10 ? 0.26 : 0.18;
    this.playSequence([
      { frequency: 330, duration: 0.09, gain, type: "triangle" },
      { frequency: 440, duration: 0.09, gain, type: "triangle", delay: 0.06 },
      { frequency: 554, duration: 0.11, gain: gain + 0.02, type: "triangle", delay: 0.12 }
    ]);
  }

  playTowerFire(tower: TowerKind, special = false) {
    if (!this.canPlay(`tower:${tower}`, special ? 30 : 55)) {
      return;
    }

    if (tower === "arrow") {
      this.playSequence([
        {
          frequency: special ? 880 : 760,
          slideTo: special ? 680 : 560,
          duration: special ? 0.1 : 0.07,
          gain: special ? 0.16 : 0.12,
          type: "triangle"
        }
      ]);
      return;
    }

    if (tower === "cannon") {
      this.playSequence([
        {
          frequency: special ? 130 : 110,
          slideTo: 58,
          duration: special ? 0.18 : 0.14,
          gain: special ? 0.28 : 0.22,
          type: "square"
        },
        {
          frequency: 62,
          duration: 0.1,
          gain: special ? 0.16 : 0.12,
          type: "sawtooth",
          delay: 0.02
        }
      ]);
      return;
    }

    this.playSequence([
      {
        frequency: special ? 520 : 420,
        slideTo: 220,
        duration: special ? 0.16 : 0.12,
        gain: special ? 0.18 : 0.14,
        type: "sine"
      }
    ]);
  }

  playImpact(kind: ImpactKind, special = false) {
    if (!this.canPlay(`impact:${kind}`, special ? 18 : 30)) {
      return;
    }

    if (kind === "explosion") {
      this.playSequence([
        {
          frequency: special ? 180 : 150,
          slideTo: 42,
          duration: special ? 0.22 : 0.18,
          gain: special ? 0.3 : 0.22,
          type: "sawtooth"
        },
        {
          frequency: 92,
          slideTo: 36,
          duration: 0.14,
          gain: 0.12,
          type: "square",
          delay: 0.01
        }
      ]);
      return;
    }

    if (kind === "freeze") {
      this.playSequence([
        {
          frequency: special ? 620 : 520,
          slideTo: 180,
          duration: special ? 0.2 : 0.14,
          gain: special ? 0.2 : 0.15,
          type: "sine"
        }
      ]);
      return;
    }

    this.playSequence([
      {
        frequency: special ? 640 : 560,
        slideTo: 260,
        duration: special ? 0.08 : 0.06,
        gain: special ? 0.16 : 0.12,
        type: "triangle"
      }
    ]);
  }

  playEnemyDown(enemy: EnemyKind) {
    if (!this.canPlay(`enemy:${enemy}`, enemy === "boss" ? 120 : 45)) {
      return;
    }

    const frequency =
      enemy === "boss" ? 180 : enemy === "tank" ? 220 : enemy === "runner" ? 480 : 360;
    this.playSequence([
      {
        frequency,
        slideTo: Math.max(90, frequency * 0.55),
        duration: enemy === "boss" ? 0.18 : 0.08,
        gain: enemy === "boss" ? 0.2 : 0.11,
        type: enemy === "boss" ? "square" : "triangle"
      }
    ]);
  }

  playEnemyEscape() {
    this.playSequence([
      { frequency: 260, slideTo: 150, duration: 0.12, gain: 0.16, type: "square" }
    ]);
  }

  playAmbientPulse(stageId: StageId) {
    if (!this.canPlay(`ambient:${stageId}`, 1200)) {
      return;
    }

    const profile =
      stageId === "metro-grid"
        ? { a: 220, b: 330, type: "triangle" as const }
        : stageId === "red-canyon"
          ? { a: 146, b: 220, type: "sawtooth" as const }
          : { a: 174, b: 261, type: "sine" as const };

    this.playSequence([
      { frequency: profile.a, duration: 0.32, gain: 0.05, type: profile.type },
      { frequency: profile.b, duration: 0.24, gain: 0.035, type: profile.type, delay: 0.12 }
    ]);
  }

  playVictory() {
    this.playSequence([
      { frequency: 392, duration: 0.12, gain: 0.2, type: "triangle" },
      { frequency: 523, duration: 0.14, gain: 0.22, type: "triangle", delay: 0.08 },
      { frequency: 659, duration: 0.18, gain: 0.24, type: "triangle", delay: 0.16 }
    ]);
  }

  playDefeat() {
    this.playSequence([
      { frequency: 220, duration: 0.16, gain: 0.18, type: "square" },
      { frequency: 164, duration: 0.22, gain: 0.2, type: "square", delay: 0.08 },
      { frequency: 110, duration: 0.28, gain: 0.22, type: "sawtooth", delay: 0.18 }
    ]);
  }

  destroy() {
    if (!this.context) {
      return;
    }

    void this.context.close().catch(() => {
      // Ignore teardown errors.
    });
  }

  private playSequence(tones: ToneSpec[]) {
    if (!this.context || !this.masterGain || this.context.state !== "running") {
      return;
    }

    const now = this.context.currentTime;
    let offset = 0;
    tones.forEach((tone) => {
      offset += tone.delay ?? 0;
      this.playTone(now + offset, tone);
    });
  }

  private playTone(startTime: number, tone: ToneSpec) {
    if (!this.context || !this.masterGain) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    oscillator.type = tone.type ?? "sine";
    oscillator.frequency.setValueAtTime(tone.frequency, startTime);
    if (tone.slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(tone.slideTo, 1),
        startTime + tone.duration
      );
    }

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(tone.gain, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.duration);
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + tone.duration + 0.04);
  }

  private canPlay(key: string, cooldownMs: number) {
    const now = Date.now();
    const previous = this.lastEventAt.get(key) ?? 0;
    if (now - previous < cooldownMs) {
      return false;
    }

    this.lastEventAt.set(key, now);
    return true;
  }
}
