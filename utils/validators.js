const validator = require('validator');

function validateUsername(username) {
  return validator.isAlphanumeric(username) && validator.isLength(username, { min: 3, max: 30 });
}

function validatePassword(password) {
  return validator.isLength(password, { min: 6 });
}

module.exports = { validateUsername, validatePassword };
