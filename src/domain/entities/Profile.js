class Profile {
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
  }) {
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

module.exports = Profile;