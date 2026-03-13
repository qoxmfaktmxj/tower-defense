import test from "node:test";
import assert from "node:assert/strict";
import {
  getWaveDefinitions,
  TOTAL_WAVES_PER_STAGE
} from "../../packages/game/src/data/waves/waveDefinitions";
import { getWaveSummary } from "../../packages/game/src/gameCatalog";

test("each stage exposes a full 50-wave definition set", () => {
  const hanRiver = getWaveDefinitions("han-river-front");
  const metroGrid = getWaveDefinitions("metro-grid");
  const redCanyon = getWaveDefinitions("red-canyon");

  assert.equal(hanRiver.length, TOTAL_WAVES_PER_STAGE);
  assert.equal(metroGrid.length, TOTAL_WAVES_PER_STAGE);
  assert.equal(redCanyon.length, TOTAL_WAVES_PER_STAGE);
});

test("wave definitions are differentiated by stage theme", () => {
  const hanRiverFirstWave = getWaveDefinitions("han-river-front")[0];
  const metroGridFirstWave = getWaveDefinitions("metro-grid")[0];
  const redCanyonFirstWave = getWaveDefinitions("red-canyon")[0];

  assert.deepEqual(hanRiverFirstWave.groups, [
    { enemyType: "grunt", count: 18, intervalMs: 515, initialDelayMs: 0 }
  ]);
  assert.deepEqual(metroGridFirstWave.groups, [
    { enemyType: "runner", count: 16, intervalMs: 298, initialDelayMs: 0 },
    { enemyType: "grunt", count: 10, intervalMs: 387, initialDelayMs: 900 }
  ]);
  assert.deepEqual(redCanyonFirstWave.groups, [
    { enemyType: "tank", count: 4, intervalMs: 1252, initialDelayMs: 0 },
    { enemyType: "grunt", count: 12, intervalMs: 417, initialDelayMs: 1100 }
  ]);
});

test("boss appears on every fifth wave only", () => {
  for (const stageId of ["han-river-front", "metro-grid", "red-canyon"] as const) {
    for (const wave of getWaveDefinitions(stageId)) {
      const hasBoss = wave.groups.some((group) => group.enemyType === "boss");
      assert.equal(hasBoss, wave.index % 5 === 0, `${stageId} wave ${wave.index}`);
    }
  }
});

test("wave summary reflects the selected stage", () => {
  assert.equal(getWaveSummary(1, "han-river-front"), "보병 18기");
  assert.equal(getWaveSummary(1, "metro-grid"), "기동병 16기 / 보병 10기");
  assert.equal(getWaveSummary(1, "red-canyon"), "중장갑 4기 / 보병 12기");
  assert.equal(getWaveSummary(99, "red-canyon"), "모든 웨이브 완료");
});
