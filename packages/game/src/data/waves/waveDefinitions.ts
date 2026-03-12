import type { WaveDefinition } from "../../core/types/gameTypes";

export const waveDefinitions: WaveDefinition[] = [
  {
    index: 1,
    groups: [{ enemyType: "grunt", count: 8, intervalMs: 620, initialDelayMs: 0 }]
  },
  {
    index: 2,
    groups: [
      { enemyType: "grunt", count: 10, intervalMs: 560, initialDelayMs: 0 },
      { enemyType: "runner", count: 4, intervalMs: 420, initialDelayMs: 1000 }
    ]
  },
  {
    index: 3,
    groups: [
      { enemyType: "grunt", count: 10, intervalMs: 520, initialDelayMs: 0 },
      { enemyType: "tank", count: 2, intervalMs: 1550, initialDelayMs: 1500 }
    ]
  },
  {
    index: 4,
    groups: [
      { enemyType: "runner", count: 10, intervalMs: 300, initialDelayMs: 0 },
      { enemyType: "grunt", count: 8, intervalMs: 450, initialDelayMs: 700 }
    ]
  },
  {
    index: 5,
    groups: [
      { enemyType: "tank", count: 4, intervalMs: 1320, initialDelayMs: 0 },
      { enemyType: "grunt", count: 8, intervalMs: 400, initialDelayMs: 600 }
    ]
  },
  {
    index: 6,
    groups: [
      { enemyType: "runner", count: 12, intervalMs: 280, initialDelayMs: 0 },
      { enemyType: "tank", count: 4, intervalMs: 1200, initialDelayMs: 1300 }
    ]
  },
  {
    index: 7,
    groups: [
      { enemyType: "grunt", count: 14, intervalMs: 320, initialDelayMs: 0 },
      { enemyType: "runner", count: 8, intervalMs: 250, initialDelayMs: 800 },
      { enemyType: "tank", count: 3, intervalMs: 1000, initialDelayMs: 1900 }
    ]
  },
  {
    index: 8,
    groups: [
      { enemyType: "tank", count: 5, intervalMs: 1060, initialDelayMs: 0 },
      { enemyType: "runner", count: 8, intervalMs: 220, initialDelayMs: 1500 }
    ]
  },
  {
    index: 9,
    groups: [
      { enemyType: "grunt", count: 14, intervalMs: 300, initialDelayMs: 0 },
      { enemyType: "runner", count: 12, intervalMs: 220, initialDelayMs: 900 },
      { enemyType: "tank", count: 4, intervalMs: 980, initialDelayMs: 2200 }
    ]
  },
  {
    index: 10,
    groups: [
      { enemyType: "tank", count: 4, intervalMs: 980, initialDelayMs: 0 },
      { enemyType: "boss", count: 1, intervalMs: 1000, initialDelayMs: 2600 },
      { enemyType: "runner", count: 10, intervalMs: 210, initialDelayMs: 5000 }
    ]
  },
  {
    index: 11,
    groups: [
      { enemyType: "grunt", count: 16, intervalMs: 280, initialDelayMs: 0 },
      { enemyType: "runner", count: 12, intervalMs: 200, initialDelayMs: 600 },
      { enemyType: "tank", count: 5, intervalMs: 920, initialDelayMs: 2400 }
    ]
  },
  {
    index: 12,
    groups: [
      { enemyType: "runner", count: 18, intervalMs: 180, initialDelayMs: 0 },
      { enemyType: "tank", count: 5, intervalMs: 860, initialDelayMs: 1800 },
      { enemyType: "grunt", count: 10, intervalMs: 260, initialDelayMs: 3200 }
    ]
  },
  {
    index: 13,
    groups: [
      { enemyType: "tank", count: 6, intervalMs: 880, initialDelayMs: 0 },
      { enemyType: "grunt", count: 16, intervalMs: 260, initialDelayMs: 1400 },
      { enemyType: "runner", count: 12, intervalMs: 180, initialDelayMs: 2600 }
    ]
  },
  {
    index: 14,
    groups: [
      { enemyType: "runner", count: 20, intervalMs: 170, initialDelayMs: 0 },
      { enemyType: "tank", count: 6, intervalMs: 820, initialDelayMs: 1800 },
      { enemyType: "boss", count: 1, intervalMs: 900, initialDelayMs: 4600 }
    ]
  },
  {
    index: 15,
    groups: [
      { enemyType: "grunt", count: 20, intervalMs: 240, initialDelayMs: 0 },
      { enemyType: "runner", count: 18, intervalMs: 170, initialDelayMs: 900 },
      { enemyType: "tank", count: 8, intervalMs: 780, initialDelayMs: 2800 }
    ]
  },
  {
    index: 16,
    groups: [
      { enemyType: "tank", count: 8, intervalMs: 760, initialDelayMs: 0 },
      { enemyType: "runner", count: 20, intervalMs: 170, initialDelayMs: 1500 },
      { enemyType: "grunt", count: 10, intervalMs: 220, initialDelayMs: 3200 }
    ]
  },
  {
    index: 17,
    groups: [
      { enemyType: "grunt", count: 22, intervalMs: 220, initialDelayMs: 0 },
      { enemyType: "runner", count: 20, intervalMs: 160, initialDelayMs: 800 },
      { enemyType: "tank", count: 8, intervalMs: 720, initialDelayMs: 2600 },
      { enemyType: "boss", count: 1, intervalMs: 900, initialDelayMs: 5200 }
    ]
  },
  {
    index: 18,
    groups: [
      { enemyType: "runner", count: 24, intervalMs: 150, initialDelayMs: 0 },
      { enemyType: "tank", count: 10, intervalMs: 700, initialDelayMs: 1500 },
      { enemyType: "grunt", count: 12, intervalMs: 200, initialDelayMs: 3400 }
    ]
  },
  {
    index: 19,
    groups: [
      { enemyType: "tank", count: 10, intervalMs: 660, initialDelayMs: 0 },
      { enemyType: "runner", count: 24, intervalMs: 150, initialDelayMs: 1200 },
      { enemyType: "boss", count: 2, intervalMs: 1200, initialDelayMs: 4300 }
    ]
  },
  {
    index: 20,
    groups: [
      { enemyType: "grunt", count: 24, intervalMs: 210, initialDelayMs: 0 },
      { enemyType: "runner", count: 24, intervalMs: 150, initialDelayMs: 1000 },
      { enemyType: "tank", count: 12, intervalMs: 620, initialDelayMs: 3200 },
      { enemyType: "boss", count: 3, intervalMs: 1200, initialDelayMs: 6200 }
    ]
  }
];
