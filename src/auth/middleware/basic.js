'use strict';

const base64 = require('base-64');
const { users } = require('../models/index.js');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { 
    res.status(403).send('Invalid Login');
    return;
  }

  
  let basic = req.headers.authorization;
  let [authType, authString] = basic.split(' ')

  if (authType ===  "Bearer"){
    res.status(403).send('Invalid Login');
    return;
  }


  let decodedString = base64.decode(authString);
  let [username, pass] = decodedString.split(':');

  try {
    req.user = await users.authenticateBasic(username, pass)
    next();
  } catch (e) {
    console.error(e);
    res.status(403).send('Invalid Login');
  }

}

