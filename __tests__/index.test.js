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
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        expect(topics[0]).not.toHaveProperty("wth");
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200 - retrieves array of objects representing articles in db and loops through checking properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.author).toEqual(expect.any(String));
          expect(article.title).toEqual(expect.any(String));
          expect(article.topic).toEqual(expect.any(String));
          expect(article.created_at).toEqual(expect.any(String));
          expect(article.votes).toEqual(expect.any(Number));
          expect(article.article_id).toEqual(expect.any(Number));
          expect(article.comment_count).toEqual(expect.any(String));
        });
      });
  });
  test("status 200 - returns articles sorted by default created at desc", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("status 200 - returns articles sorted by created_at ordered asc ", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", {
          descending: false,
        });
      });
  });
  test("status 200 - responds with sorted by title ordered asc ", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("title", {
          descending: false,
        });
      });
  });

  test("400 - ORDER query not valid", () => {
    return request(app)
      .get("/api/articles?order=NOTVALID")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Not valid query");
      });
  });
  test("status 200 - returns articles sorted by votes: def desc", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("votes", {
          descending: true,
        });
      });
  });
  test("status 200 - returns articles sorted by title: def desc", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("title", {
          descending: true,
        });
      });
  });
  test("status 200 - returns articles sorted by author: def desc ", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("author", {
          descending: true,
        });
      });
  });
  test("400 - SortBy query not valid", () => {
    return request(app)
      .get("/api/articles?order=NOTVALID")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Not valid query");
      });
  });
  test("status 200 - returns articles filtered by topic cats ", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(1);
      });
  });
  test("status 200 - returns articles filtered by topic cats ", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(11);
      });
  });
  test("status 404 - topic doesnt exist", () => {
    return request(app)
      .get("/api/articles?topic=nottopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found");
      });
  });
  test("404 - route not found ", () => {
    return request(app)
      .get("/api/articless")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("retrieve article object by id and check has correct properties", () => {
    return request(app)
      .get("/api/articles/5")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toBeInstanceOf(Object);
        expect(article.author).toEqual(expect.any(String));
        expect(article.title).toEqual(expect.any(String));
        expect(article.article_id).toEqual(expect.any(Number));
        expect(article.body).toEqual(expect.any(String));
        expect(article.topic).toEqual(expect.any(String));
        expect(article.created_at).toEqual(expect.any(String));
        expect(article.votes).toEqual(expect.any(Number));
        expect(article.comment_count).toEqual(expect.any(String));
      });
  });
  test("status 400 - Bad request, query string but must be number", () => {
    return request(app)
      .get("/api/articles/invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });
  test("status 404 - not found, query number but no such article exists with id", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then((err) => {
        expect(err.res.statusMessage).toBe("Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("status 200, responds with updated article", () => {
    const articleUpdate = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/4")
      .send(articleUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 4,
          title: "Student SUES Mitch!",
          topic: "mitch",
          author: "rogersop",
          body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
          created_at: "2020-05-06T01:14:00.000Z",
          votes: 1,
        });
      });
  });
  test("status 200, responds with updated article after subtracting votes", () => {
    const articleUpdate = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(articleUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 0,
        });
      });
  });
  test("status 200, responds with updated article after subtracting votes to take below 0", () => {
    const articleUpdate = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/5")
      .send(articleUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          body: "Bastet walks amongst us, and the cats are taking arms!",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: -100,
        });
      });
  });
  test("status 400 - Bad request, query string but must be number", () => {
    return request(app)
      .get("/api/articles/syd")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });
  test("status 404 -Not found, number but doesnt exist in db", () => {
    const articleUpdate = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/10000")
      .send(articleUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });
});

describe("GET /api/users", () => {
  test("status 200, responds with array of objects - representing users in database", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(3);
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
        });
      });
  });
  test("status 404, route not found", () => {
    return request(app)
      .get("/api/userz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 - responds with array of objects representing comments from that article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment.comment_id).toEqual(expect.any(Number));
          expect(comment.votes).toEqual(expect.any(Number));
          expect(comment.created_at).toEqual(expect.any(String));
          expect(comment.author).toEqual(expect.any(String));
          expect(comment.body).toEqual(expect.any(String));
        });
      });
  });
});

describe("POST /api/article/:article_id/comments", () => {
  test("200 - should insert comment by article_id and return posted comment", () => {
    const newComment = {
      username: "rogersop",
      body: "As you were x",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            author: "rogersop",
            body: "As you were x",
          })
        );
      });
  });
  test("400 - user doesnt exist in db, failed post", () => {
    const newComment = {
      username: "LiamG",
      body: "As you were x",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("User doesn't exist");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("delete comment 1 by id and respond with 204 and no content", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("Error handle - invalid id/not found id.", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Not a valid comment id");
      });
  });
});

describe("GET /api", () => {
  test("responds with 200 and json endpoints listing all available endpoints on api ", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toBeInstanceOf(Object);
      });
  });
});

describe("Error handling", () => {
  test("404 route not found", () => {
    return request(app)
      .get("/api/lolwhut")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
  test("404 Comments not found", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comments not found");
      });
  });
});
