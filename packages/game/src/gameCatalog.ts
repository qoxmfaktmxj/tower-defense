import type { EnemyKind, StageId, TowerKind } from "./core/types/gameTypes";
import { gameModeCatalog } from "./data/gameModes";
import { stageCatalog } from "./data/stages/stageDefinitions";
import { towerDefinitions } from "./data/towers/towerDefinitions";
import { getWaveDefinitions } from "./data/waves/waveDefinitions";

export interface TowerCatalogEntry {
  key: TowerKind;
  displayName: string;
  buildCost: number;
  description: string;
  hotkey: string;
}

const towerDescriptions: Record<TowerKind, string> = {
  arrow: "빠른 연사와 긴 사거리로 초반 라인을 안정적으로 묶어 주는 기본 포대입니다.",
  cannon: "강한 범위 화력으로 중장갑과 보스를 정리하는 핵심 중화기 포대입니다.",
  frost: "둔화와 범위 제어를 동시에 걸어 전장 흐름을 제어하는 지원형 포대입니다."
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

export const getWaveSummary = (waveNumber: number, stageId: StageId = "han-river-front"): string => {
  const wave = getWaveDefinitions(stageId).find((entry) => entry.index === waveNumber);
  if (!wave) {
    return "모든 웨이브 완료";
  }

  return wave.groups
    .map((group) => `${enemyDisplayNames[group.enemyType]} ${group.count}기`)
    .join(" / ");
};

export { gameModeCatalog, stageCatalog };
