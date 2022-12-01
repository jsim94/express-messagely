const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

let testUserToken;

describe("Auth Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });
    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "u1-to-u2",
    });
    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "u2-to-u1",
    });

    const result = await request(app).post("/auth/login").send({
      username: "test1",
      password: "password",
    });
    testUserToken = result.body.token;
  });

  describe("get users", function () {
    /** GET /users  */

    describe("get all", function () {
      test("logged in", async function () {
        let response = await request(app).get("/users").send({ _token: testUserToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.users).toEqual(expect.any(Array));
      });
      test("not logged in", async function () {
        let response = await request(app).get("/users");
        expect(response.statusCode).toBe(401);
      });
    });

    /** GET /users/test1  */

    describe("get one", function () {
      test("get one", async function () {
        let response = await request(app).get("/users/test1").send({ _token: testUserToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.user).toEqual({
          first_name: "Test1",
          join_at: expect.any(String),
          last_login_at: expect.any(String),
          last_name: "Testy1",
          phone: "+14155550000",
          username: "test1",
        });
      });
      test("get one", async function () {
        let response = await request(app).get("/users/test2").send({ _token: testUserToken });
        expect(response.statusCode).toBe(401);
      });
      test("get one", async function () {
        let response = await request(app).get("/users/test1");
        expect(response.statusCode).toBe(401);
      });
    });
  });

  describe("Get user messages", function () {
    describe("get to", function () {
      test("logged in", async function () {
        let response = await request(app).get("/users/test1/to").send({ _token: testUserToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.messages).toEqual(expect.any(Array));
      });

      test("wrong user", async function () {
        let response = await request(app).get("/users/test1/to");
        expect(response.statusCode).toBe(401);
      });
      test("not logged in", async function () {
        let response = await request(app).get("/users/test1/to");
        expect(response.statusCode).toBe(401);
      });
    });

    describe("get from", function () {
      test("logged in", async function () {
        let response = await request(app).get("/users/test1/from").send({ _token: testUserToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.messages).toEqual(expect.any(Array));
      });
      test("wrong user", async function () {
        let response = await request(app).get("/users/test2/from").send({ _token: testUserToken });
        expect(response.statusCode).toBe(401);
      });
      test("not logged in", async function () {
        let response = await request(app).get("/users/test1/from");
        expect(response.statusCode).toBe(401);
      });
    });
  });
});

afterAll(async function () {
  await db.end();
});
