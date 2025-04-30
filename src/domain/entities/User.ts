/**
 * Parameters for User entity.
 */
export interface IUserParams {
  id: string;
  username: string;
  passwordHash: string;
  activated?: boolean;
  createdAt?: Date;
}

/**
 * Domain entity representing a user.
 */
export default class User {
  id: string;
  username: string;
  passwordHash: string;
  activated: boolean;
  createdAt: Date;

  constructor({ id, username, passwordHash, activated = false, createdAt = new Date() }: IUserParams) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.activated = activated;
    this.createdAt = createdAt;
  }
}