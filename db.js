/** Database connection for messagely. */

const { Pool } = require("pg");
const { DB } = require("./config");

const pool = new Pool({
  host: "localhost",
  database: DB,
  password: "admin",
});

module.exports = pool;
