import { ILevelParams } from '../entities/Level';

/**
 * Domain service to calculate level based on points and level thresholds.
 */
export default class LevelCalculatorService {
  /**
   * Determine the level for given total points.
   */
  calculateLevel(points: number, levels: ILevelParams[]): number {
    for (const lvl of levels) {
      if (points >= lvl.minPoints && points <= lvl.maxPoints) {
        return lvl.level;
      }
    }
    return levels.length > 0 ? levels[0].level : 1;
  }
}