/**
 * Domain entity representing a level with its point thresholds.
 */
class Level {
  /**
   * @param {object} params
   * @param {number} params.level - Level number.
   * @param {number} params.minPoints - Minimum points for this level.
   * @param {number} params.maxPoints - Maximum points for this level.
   */
  constructor({ level, minPoints, maxPoints }) {
    this.level = level;
    this.minPoints = minPoints;
    this.maxPoints = maxPoints;
  }
}

module.exports = Level;