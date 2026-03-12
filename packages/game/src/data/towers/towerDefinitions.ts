import type { TowerDefinition } from "../../core/types/gameTypes";

export const towerDefinitions: Record<TowerDefinition["key"], TowerDefinition> = {
  arrow: {
    key: "arrow",
    displayName: "기관포 타워",
    color: 0x7ed5df,
    buildCost: 70,
    levels: [
      {
        damage: 16,
        range: 150,
        fireRateMs: 600,
        projectileSpeed: 360,
        projectileSize: 6
      },
      {
        damage: 26,
        range: 168,
        fireRateMs: 520,
        projectileSpeed: 380,
        projectileSize: 7,
        upgradeCost: 65
      },
      {
        damage: 38,
        range: 182,
        fireRateMs: 430,
        projectileSpeed: 410,
        projectileSize: 8,
        upgradeCost: 90
      },
      {
        damage: 54,
        range: 198,
        fireRateMs: 340,
        projectileSpeed: 440,
        projectileSize: 9,
        burstCount: 2,
        upgradeCost: 125
      },
      {
        damage: 88,
        range: 224,
        fireRateMs: 240,
        projectileSpeed: 480,
        projectileSize: 10,
        burstCount: 3,
        specialEffect: "overdrive",
        upgradeCost: 180
      }
    ]
  },
  cannon: {
    key: "cannon",
    displayName: "중화기 타워",
    color: 0xf0a64d,
    buildCost: 110,
    levels: [
      {
        damage: 42,
        range: 138,
        fireRateMs: 1200,
        projectileSpeed: 260,
        projectileSize: 9,
        splashRadius: 40
      },
      {
        damage: 64,
        range: 150,
        fireRateMs: 1080,
        projectileSpeed: 280,
        projectileSize: 10,
        splashRadius: 48,
        upgradeCost: 85
      },
      {
        damage: 92,
        range: 164,
        fireRateMs: 980,
        projectileSpeed: 300,
        projectileSize: 11,
        splashRadius: 56,
        upgradeCost: 120
      },
      {
        damage: 128,
        range: 176,
        fireRateMs: 860,
        projectileSpeed: 320,
        projectileSize: 12,
        splashRadius: 68,
        upgradeCost: 165
      },
      {
        damage: 210,
        range: 198,
        fireRateMs: 720,
        projectileSpeed: 340,
        projectileSize: 14,
        splashRadius: 92,
        specialEffect: "blast-nova",
        upgradeCost: 240
      }
    ]
  },
  frost: {
    key: "frost",
    displayName: "빙결 타워",
    color: 0x7f8cff,
    buildCost: 95,
    levels: [
      {
        damage: 12,
        range: 144,
        fireRateMs: 900,
        projectileSpeed: 280,
        projectileSize: 7,
        slowMultiplier: 0.62,
        slowDurationMs: 1100
      },
      {
        damage: 20,
        range: 156,
        fireRateMs: 760,
        projectileSpeed: 300,
        projectileSize: 8,
        slowMultiplier: 0.5,
        slowDurationMs: 1350,
        upgradeCost: 80
      },
      {
        damage: 30,
        range: 170,
        fireRateMs: 660,
        projectileSpeed: 320,
        projectileSize: 9,
        slowMultiplier: 0.42,
        slowDurationMs: 1600,
        upgradeCost: 110
      },
      {
        damage: 46,
        range: 186,
        fireRateMs: 560,
        projectileSpeed: 340,
        projectileSize: 10,
        slowMultiplier: 0.36,
        slowDurationMs: 1900,
        slowRadius: 54,
        upgradeCost: 150
      },
      {
        damage: 70,
        range: 208,
        fireRateMs: 440,
        projectileSpeed: 360,
        projectileSize: 12,
        slowMultiplier: 0.24,
        slowDurationMs: 2600,
        slowRadius: 84,
        splashRadius: 72,
        specialEffect: "freeze-nova",
        upgradeCost: 210
      }
    ]
  }
};
