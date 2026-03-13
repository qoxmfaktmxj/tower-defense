import test from "node:test";
import assert from "node:assert/strict";
import { EconomyManager } from "../../packages/game/src/managers/EconomyManager";

test("EconomyManager tracks spend, rewards, lives, and score", () => {
  const economy = new EconomyManager(260, 20);

  assert.equal(economy.spend(70), true);
  assert.equal(economy.getGold(), 190);
  assert.equal(economy.getGoldSpent(), 70);

  assert.equal(economy.spend(300), false);
  assert.equal(economy.getGold(), 190);
  assert.equal(economy.getGoldSpent(), 70);

  economy.addReward(15);
  assert.equal(economy.getGold(), 205);
  assert.equal(economy.getScore(), 180);

  economy.addWaveClearBonus(4);
  assert.equal(economy.getScore(), 360);

  economy.loseLife(3);
  assert.equal(economy.getLives(), 17);

  economy.addClearBonus();
  assert.equal(economy.getScore(), 1720);
});

