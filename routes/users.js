const express = require("express");
const jwt = require("jsonwebtoken");

const ExpressError = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const User = require("../models/user");

const router = new express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.all();
    console.log(users);
    return res.json({ users: users });
  } catch (e) {
    return next(e);
  }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  try {
    const users = await User.get(username);
    if (!users) throw new ExpressError("Username not found", 404);
    return res.json({ user: users });
  } catch (e) {
    return next(e);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  try {
    const messages = await User.messagesTo(username);
    if (!messages) throw new ExpressError("No Results Found", 404);
    return res.json({ messages: messages });
  } catch (e) {
    return next(e);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  try {
    const messages = await User.messagesFrom(username);
    if (!messages) throw new ExpressError("No Results Found", 404);
    return res.json({ messages: messages });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
