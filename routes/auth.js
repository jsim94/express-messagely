const express = require("express");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
const User = require("../models/user");

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  const username = req.body.username;

  try {
    if (await User.authenticate(username, req.body.password)) {
      await User.updateLoginTimestamp(username);

      return res.json({ token: jwt.sign({ username }, SECRET_KEY) });
    }
    throw new ExpressError("Invalid username or password", 400);
  } catch (e) {
    return next(e);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    const user = await User.register(req.body);
    const username = user.username;

    return res.json({ token: jwt.sign({ username }, SECRET_KEY) });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
