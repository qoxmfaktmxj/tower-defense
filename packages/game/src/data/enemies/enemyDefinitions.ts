import type { EnemyDefinition } from "../../core/types/gameTypes";

export const enemyDefinitions: Record<EnemyDefinition["key"], EnemyDefinition> = {
  grunt: {
    key: "grunt",
    displayName: "보병",
    color: 0xf4d35e,
    maxHp: 62,
    speed: 58,
    reward: 12,
    radius: 11
  },
  runner: {
    key: "runner",
    displayName: "기동병",
    color: 0x58d68d,
    maxHp: 48,
    speed: 92,
    reward: 14,
    radius: 10
  },
  tank: {
    key: "tank",
    displayName: "중장갑",
    color: 0xe67e22,
    maxHp: 190,
    speed: 38,
    reward: 24,
    radius: 15
  },
  boss: {
    key: "boss",
    displayName: "지휘 돌격체",
    color: 0xe74c3c,
    maxHp: 620,
    speed: 34,
    reward: 120,
    radius: 18
  }
};
