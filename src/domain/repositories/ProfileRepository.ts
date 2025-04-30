  /**
   * Find a profile by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
import { IProfileParams } from '../entities/Profile';
import { ILevelParams } from '../entities/Level';

/**
 * Abstract repository for profile operations.
 */
export default abstract class ProfileRepository {
  /** Find a profile by its ID. */
  abstract findById(id: string): Promise<IProfileParams | null>;

  /**
   * Retrieve all level configurations.
   * @returns {Promise<Array<object>>}
   */
  /** Retrieve all level configurations. */
  abstract getLevels(): Promise<ILevelParams[]>;

  /**
   * Update points and level for a profile.
   * @param {string} userId
   * @param {number} points
   * @param {number} level
   */
  /** Update points and level for a profile. */
  abstract updatePointsAndLevel(userId: string, points: number, level: number): Promise<boolean>;
}