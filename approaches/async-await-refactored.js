/**
 * @name async-await-refactored
 * @description a slightly refactored version of the async / await example
 *              where we are again doing our concurrent tasks in parallel
 * @see async-await approach for more details on advantages / disadvantages
 */

// external dependencies
const markdown = require('markdown').markdown;
const fs = require('fs');

// mock database (local file)
const mockDB = require('../mocks/db');
// custom error handler module imported locally
const errorDispatch = require('../utils/error-handling');

// constants
const approachName = 'ASYNC / AWAIT REFACTORED';
const { BLOG_PATH, DB_URL } = require('../constants/constants');

// EXAMPLE: ASYNC / AWAIT REFACTORED
function connectToDB() {
  return new Promise((resolve, reject) => {
    mockDB.connect(DB_URL, (err) => {
      if (err) return reject({ type: 'dbConnection', err });
      console.log(`${approachName}: Connected to DB`);
      return resolve();
    });
  });
}

function getLocalArticle() {
  return new Promise((resolve, reject) => {
    fs.readFile(BLOG_PATH, 'utf-8', (err, data) => {
      if (err) return reject({ type: 'fs', err });
      console.log(`${approachName}: Got article from file system`);
      return resolve(markdown.toHTML(data));
    });
  });
}

function createArticle(html) {
  return new Promise((resolve, reject) => {
    mockDB.create(
      {
        mdFileName: 'my-first-feature-article',
        title: 'My first feature article!',
        body: html,
        tags: ['welcome', 'news'],
      },
      (err, result) => {
        if (err) return reject({ type: 'dbCreate', err });
        console.log(`${approachName}: Created article in db`);
        return resolve(result);
      }
    );
  });
}

async function createBetterAsyncArticle() {
  try {
    const results = await Promise.all([connectToDB(), getLocalArticle()]); // pauses local execution context
    const newArticle = await createArticle(results[1]); // pauses local execution context

    console.log(`${approachName}: success: `, newArticle._id);
  } catch (e) {
    errorDispatch(e, approachName);
  }
}

module.exports = asyncAwaitRefactored;
