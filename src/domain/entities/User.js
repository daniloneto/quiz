class User {
  constructor({ id, username, passwordHash, activated = false, createdAt = new Date() }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.activated = activated;
    this.createdAt = createdAt;
  }
}

module.exports = User;