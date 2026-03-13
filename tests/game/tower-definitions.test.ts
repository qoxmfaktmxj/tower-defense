import test from "node:test";
import assert from "node:assert/strict";
import { towerDefinitions } from "../../packages/game/src/data/towers/towerDefinitions";

test("tower damage values reflect the 20 percent buff", () => {
  assert.deepEqual(
    towerDefinitions.arrow.levels.map((level) => level.damage),
    [19, 31, 46, 65, 106]
  );
  assert.deepEqual(
    towerDefinitions.cannon.levels.map((level) => level.damage),
    [50, 77, 110, 154, 252]
  );
  assert.deepEqual(
    towerDefinitions.frost.levels.map((level) => level.damage),
    [14, 24, 36, 55, 84]
  );
});
