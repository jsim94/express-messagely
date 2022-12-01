/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = bcrypt.hashSync(password, 12);
    const time = new Date().toISOString();
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone, time, time]
    );

    const user = result.rows[0];

    return user;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      ` SELECT password
        FROM users 
        WHERE username = $1`,
      [username]
    );
    if (results.rows.length === 0) return false;
    const userPassword = results.rows[0].password;

    return bcrypt.compareSync(password, userPassword);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      ` UPDATE users
        SET last_login_at = $1
        WHERE username = $2`,
      [new Date().toISOString(), username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
       FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      ` SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      ` SELECT m.id, u.username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
        FROM messages AS m
          JOIN users AS u
          ON m.to_username = u.username
        WHERE from_username = $1`,
      [username]
    );

    return result.rows.map((msg) => {
      return {
        id: msg.id,
        body: msg.body,
        sent_at: msg.sent_at,
        read_at: msg.read_at,
        to_user: {
          username: msg.username,
          first_name: msg.first_name,
          last_name: msg.last_name,
          phone: msg.phone,
        },
      };
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      ` SELECT m.id, u.username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
        FROM messages AS m
          JOIN users AS u
          ON m.from_username = u.username
        WHERE to_username = $1`,
      [username]
    );

    return result.rows.map((msg) => {
      return {
        id: msg.id,
        body: msg.body,
        sent_at: msg.sent_at,
        read_at: msg.read_at,
        from_user: {
          username: msg.username,
          first_name: msg.first_name,
          last_name: msg.last_name,
          phone: msg.phone,
        },
      };
    });
  }
}

module.exports = User;
