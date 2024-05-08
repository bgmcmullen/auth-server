'use strict';

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken'); // import jwt

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false, },
    token: {
      type: DataTypes.VIRTUAL,

      get() {
        // Generate a new JWT with an updated expiration time
        return this.generateJWT();
      }
    }
  });

  // Method to generate a new JWT with an updated expiration time
  model.prototype.generateJWT = function () {
    const tokenExpiration = Math.floor(Date.now() / 1000) + 20; // set time limit
    return jwt.sign({ username: this.username, exp: tokenExpiration }, process.env.SECRET);
  };

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {


    const user = await this.findOne({ where: { username } })
    const valid = await bcrypt.compare(password, user.password)
    if (valid) { return user; }
    throw new Error('Invalid User');
  }

  // Bearer AUTH: Validating a token


  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, process.env.SECRET);
      const user = this.findOne({ where: { username: parsedToken.username } })
      if (user) { return user; }
      next("User Not Found");
    } catch (e) {
      next(e.message);
    }
  }

  return model;
}

module.exports = userSchema;
