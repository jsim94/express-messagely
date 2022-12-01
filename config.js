/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

let DB;

if (process.env.NODE_ENV === "test") {
  DB = "messagely_test";
} else {
  DB = "messagely";
}
const DB_URI = `postgresql:///${DB}`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB,
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
