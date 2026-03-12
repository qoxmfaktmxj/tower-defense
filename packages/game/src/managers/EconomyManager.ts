export class EconomyManager {
  private gold: number;
  private lives: number;
  private score = 0;
  private goldSpent = 0;

  constructor(initialGold: number, initialLives: number) {
    this.gold = initialGold;
    this.lives = initialLives;
  }

  spend(amount: number) {
    if (this.gold < amount) {
      return false;
    }

    this.gold -= amount;
    this.goldSpent += amount;
    return true;
  }

  addGold(amount: number) {
    this.gold += amount;
  }

  addReward(amount: number) {
    this.gold += amount;
    this.score += amount * 12;
  }

  addWaveClearBonus(wave: number) {
    this.score += wave * 45;
  }

  loseLife(amount: number) {
    this.lives = Math.max(0, this.lives - amount);
  }

  addClearBonus() {
    this.score += this.lives * 80;
  }

  getGold() {
    return this.gold;
  }

  getLives() {
    return this.lives;
  }

  getScore() {
    return this.score;
  }

  getGoldSpent() {
    return this.goldSpent;
  }
}
