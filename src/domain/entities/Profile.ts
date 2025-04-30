/**
 * Parameters for Profile entity.
 */
export interface IProfileParams {
  id: string;
  name: string;
  email: string;
  points?: number;
  level?: number;
  createdAt?: Date;
  lastLogin?: Date;
  activated?: boolean;
  admin?: boolean;
  token?: string;
}

/**
 * Domain entity representing a user profile.
 */
export default class Profile {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  createdAt: Date;
  lastLogin: Date;
  activated: boolean;
  admin: boolean;
  token: string;

  constructor({
    id,
    name,
    email,
    points = 0,
    level = 1,
    createdAt = new Date(),
    lastLogin = new Date(),
    activated = false,
    admin = false,
    token = ''
  }: IProfileParams) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.points = points;
    this.level = level;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
    this.activated = activated;
    this.admin = admin;
    this.token = token;
  }
}