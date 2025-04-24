/**
 * Domain service to calculate level based on points and level thresholds.
 */
class LevelCalculatorService {
  /**
   * Determine the level for given total points.
   * @param {number} points
   * @param {Array<{level: number, minPoints: number, maxPoints: number}>} levels
   * @returns {number}
   */
  calculateLevel(points, levels) {
    for (const lvl of levels) {
      if (points >= lvl.minPoints && points <= lvl.maxPoints) {
        return lvl.level;
      }
    }
    return levels.length > 0 ? levels[0].level : 1;
  }
}

module.exports = LevelCalculatorService;