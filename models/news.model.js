const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};
////////// here
exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  let queryStr = `SELECT articles.*, 
    COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id`;

  queryStr += `
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr).then((result) => {
    console.log(result);
    return result.rows;
  });
};

exports.selectArticleById = (id) => {
  return db
    .query(
      `SELECT articles.*, 
      COUNT(comments.article_id) AS comment_count
        FROM articles 
        LEFT JOIN comments
        ON articles.article_id = comments.article_id 
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      } else {
        return rows[0];
      }
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then((result) => {
    return result.rows;
  });
};

exports.selectCommentsById = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments
    WHERE article_id = $1;`,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comments not found" });
      } else {
        return result.rows;
      }
    });
};
