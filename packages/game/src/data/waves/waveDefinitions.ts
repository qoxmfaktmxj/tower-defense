import type { StageId, WaveDefinition, WaveGroupDefinition } from "../../core/types/gameTypes";

export const TOTAL_WAVES_PER_STAGE = 50;
const ENEMY_COUNT_MULTIPLIER = 2;

const createWave = (index: number, groups: WaveGroupDefinition[]): WaveDefinition => ({
  index,
  groups
});

const createGroup = (
  enemyType: WaveGroupDefinition["enemyType"],
  count: number,
  intervalMs: number,
  initialDelayMs: number
): WaveGroupDefinition => ({
  enemyType,
  count: Math.max(1, Math.round(count * ENEMY_COUNT_MULTIPLIER)),
  intervalMs,
  initialDelayMs
});

const isBossWave = (waveIndex: number) => waveIndex % 5 === 0;

const getBossCount = (waveIndex: number) => 1 + Math.floor((waveIndex - 5) / 15);

const buildStageWaves = (factory: (waveIndex: number) => WaveDefinition) =>
  Array.from({ length: TOTAL_WAVES_PER_STAGE }, (_, index) => factory(index + 1));

const createHanRiverWave = (waveIndex: number): WaveDefinition => {
  const bossWave = isBossWave(waveIndex);
  const gruntCount = 8 + Math.floor(waveIndex * 1.6);
  const runnerCount = 4 + Math.floor(waveIndex * 0.95);
  const tankCount = 1 + Math.floor(waveIndex / 5);

  if (bossWave) {
    const groups = [
      createGroup("grunt", gruntCount + 2, Math.max(180, 430 - waveIndex * 4), 0),
      createGroup("tank", tankCount + 1, Math.max(600, 980 - waveIndex * 6), 900),
      createGroup("boss", getBossCount(waveIndex), 1350, 2200)
    ];

    if (waveIndex >= 15) {
      groups.push(
        createGroup("runner", Math.max(6, Math.floor(runnerCount * 0.6)), Math.max(120, 220 - waveIndex), 3600)
      );
    }

    return createWave(waveIndex, groups);
  }

  const groups = [createGroup("grunt", gruntCount, Math.max(190, 520 - waveIndex * 5), 0)];

  if (waveIndex >= 2) {
    groups.push(createGroup("runner", runnerCount, Math.max(135, 320 - waveIndex * 3), 800));
  }

  if (waveIndex >= 4) {
    groups.push(createGroup("tank", tankCount, Math.max(640, 1280 - waveIndex * 8), 2200));
  }

  return createWave(waveIndex, groups);
};

const createMetroGridWave = (waveIndex: number): WaveDefinition => {
  const bossWave = isBossWave(waveIndex);
  const runnerCount = 7 + Math.floor(waveIndex * 1.4);
  const gruntCount = 4 + Math.floor(waveIndex * 1.1);
  const tankCount = Math.max(1, Math.floor(waveIndex / 6));

  if (bossWave) {
    const groups = [
      createGroup("runner", runnerCount + 3, Math.max(120, 250 - waveIndex * 2), 0),
      createGroup("boss", getBossCount(waveIndex), 1300, 1800),
      createGroup("tank", tankCount + 1, Math.max(620, 980 - waveIndex * 5), 3100)
    ];

    if (waveIndex >= 10) {
      groups.push(createGroup("grunt", Math.max(8, Math.floor(gruntCount * 0.85)), Math.max(170, 260 - waveIndex), 4300));
    }

    return createWave(waveIndex, groups);
  }

  const groups = [createGroup("runner", runnerCount, Math.max(125, 300 - waveIndex * 2), 0)];

  if (waveIndex >= 1) {
    groups.push(createGroup("grunt", gruntCount, Math.max(185, 390 - waveIndex * 3), 900));
  }

  if (waveIndex >= 3) {
    groups.push(createGroup("tank", tankCount, Math.max(640, 1220 - waveIndex * 7), 2500));
  }

  return createWave(waveIndex, groups);
};

const createRedCanyonWave = (waveIndex: number): WaveDefinition => {
  const bossWave = isBossWave(waveIndex);
  const tankCount = 2 + Math.floor(waveIndex * 0.28);
  const gruntCount = 5 + Math.floor(waveIndex * 1.05);
  const runnerCount = 3 + Math.floor(waveIndex * 0.85);

  if (bossWave) {
    const groups = [
      createGroup("tank", tankCount + 2, Math.max(620, 1120 - waveIndex * 7), 0),
      createGroup("boss", getBossCount(waveIndex), 1250, 2200),
      createGroup("grunt", gruntCount + 2, Math.max(180, 340 - waveIndex * 2), 3900)
    ];

    if (waveIndex >= 15) {
      groups.push(createGroup("runner", Math.max(6, Math.floor(runnerCount * 0.9)), Math.max(135, 230 - waveIndex), 5400));
    }

    return createWave(waveIndex, groups);
  }

  const groups = [createGroup("tank", tankCount, Math.max(640, 1260 - waveIndex * 8), 0)];

  if (waveIndex >= 1) {
    groups.push(createGroup("grunt", gruntCount, Math.max(190, 420 - waveIndex * 3), 1100));
  }

  if (waveIndex >= 3) {
    groups.push(createGroup("runner", runnerCount, Math.max(150, 260 - waveIndex * 2), 2800));
  }

  return createWave(waveIndex, groups);
};

const hanRiverFrontWaves = buildStageWaves(createHanRiverWave);
const metroGridWaves = buildStageWaves(createMetroGridWave);
const redCanyonWaves = buildStageWaves(createRedCanyonWave);

export const waveDefinitionsByStage: Record<StageId, WaveDefinition[]> = {
  "han-river-front": hanRiverFrontWaves,
  "metro-grid": metroGridWaves,
  "red-canyon": redCanyonWaves
};

export const waveDefinitions = waveDefinitionsByStage["han-river-front"];

export const getWaveDefinitions = (stageId: StageId) =>
  waveDefinitionsByStage[stageId] ?? waveDefinitions;
