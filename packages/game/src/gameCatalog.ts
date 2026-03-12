import type { EnemyKind, TowerKind } from "./core/types/gameTypes";
import { gameModeCatalog } from "./data/gameModes";
import { stageCatalog } from "./data/stages/stageDefinitions";
import { towerDefinitions } from "./data/towers/towerDefinitions";
import { waveDefinitions } from "./data/waves/waveDefinitions";

export interface TowerCatalogEntry {
  key: TowerKind;
  displayName: string;
  buildCost: number;
  description: string;
  hotkey: string;
}

const towerDescriptions: Record<TowerKind, string> = {
  arrow: "빠른 연사와 높은 사거리로 초반부터 안정적인 화력을 제공합니다.",
  cannon: "강한 폭발 피해로 중장갑과 보스 처리에 강한 포격 특화 타워입니다.",
  frost: "피해와 둔화를 동시에 걸어 후반 웨이브 흐름을 끊어내는 제어형 타워입니다."
};

const towerHotkeys: Record<TowerKind, string> = {
  arrow: "Q",
  cannon: "W",
  frost: "E"
};

const enemyDisplayNames: Record<EnemyKind, string> = {
  grunt: "보병",
  runner: "기동병",
  tank: "중장갑",
  boss: "지휘 돌격체"
};

export const towerCatalog: TowerCatalogEntry[] = (Object.keys(towerDefinitions) as TowerKind[]).map(
  (towerKind) => ({
    key: towerKind,
    displayName: towerDefinitions[towerKind].displayName,
    buildCost: towerDefinitions[towerKind].buildCost,
    description: towerDescriptions[towerKind],
    hotkey: towerHotkeys[towerKind]
  })
);

export const getWaveSummary = (waveNumber: number): string => {
  const wave = waveDefinitions.find((entry) => entry.index === waveNumber);
  if (!wave) {
    return "모든 웨이브 완료";
  }

  return wave.groups
    .map((group) => `${enemyDisplayNames[group.enemyType]} ${group.count}기`)
    .join(" · ");
};

export { gameModeCatalog, stageCatalog };
