const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const app = require("../app");
const data = require("../db/data/test-data");
const { notify } = require("../app");

afterAll(() => db.end());

beforeEach(() => seed(data));

describe("GET /api/topics", () => {
  test("retrieve array of objects from /api/topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        console.log(topics);
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        expect(topics[0]).toHaveProperty("slug");
        expect(topics[0]).toHaveProperty("description");
        expect(topics[0]).not.toHaveProperty("wth");
      });
  });
});

describe.only("GET /api/articles/:article_id", () => {
  test("retrieve article object by id and check has correct properties", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        console.log(article);
        expect(article).toBeInstanceOf(Object);
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
      });
  });
});

describe("Error handling", () => {
  test("404 route not found", () => {
    return request(app)
      .get("/api/lolwhut")
      .expect(404)
      .then(({ body }) => {
        console.log(body);
        expect(body.msg).toBe("Route not found");
      });
  });
});