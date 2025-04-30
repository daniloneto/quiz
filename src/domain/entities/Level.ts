/**
 * Parameters for Level entity.
 */
export interface ILevelParams {
  level: number;
  minPoints: number;
  maxPoints: number;
}

/**
 * Domain entity representing a level with its point thresholds.
 */
export default class Level {
  level: number;
  minPoints: number;
  maxPoints: number;

  constructor({ level, minPoints, maxPoints }: ILevelParams) {
    this.level = level;
    this.minPoints = minPoints;
    this.maxPoints = maxPoints;
  }
}