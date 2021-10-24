/**
 * @name promise-all
 * @description example of using Promise.all for parallel promise execution when
 *              you need to make sure that ALL concurrent promises resolve before
 *              kicking off some other functionality.
 *  1. Benifits:
 *    - More efficient! We are now executing our concurrent operations in parallel!
 *  2. Drawbacks / things to note:
 *     - Potentially less clear what promises are in your array, especially if you
 *       have more than just the two in this example.
 *     - If even one promise fails the whole chain is broken, so make sure that
 *       Promise.all is really what you want to use for parallel promise execution
 */

// external dependencies:
const markdown = require('markdown').markdown;
const fs = require('fs');

// mock database (local file)
const mockDB = require('../mocks/db');
// custom error handler module imported locally
const errorDispatch = require('../utils/error-handling');

// constants
const approachName = 'PROMISE.ALL';
const { BLOG_PATH, DB_URL } = require('../constants/constants');

// EXAMPLE: PROMISE.ALL
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

// Almost identical to the createArticle, but passed different input.
function paCreateArticle(html) {
  const newArticle = {
    mdFileName: 'my-first-feature-article',
    title: 'My first feature article!',
    body: html[1],
    tags: ['welcome', 'news'],
  };
  return new Promise((resolve, reject) => {
    mockDB.create(newArticle, (err, result) => {
      if (err) return reject({ type: 'dbCreate', err });
      console.log(`${approachName}: Created article in db`);
      return resolve(result);
    });
  });
}

function promiseAll() {
  // Reusing the same functions & error handling from Approach #3
  const initialProms = [connectToDB(), getLocalArticle()];

  // Now that we've defined our functions, we may execute our code:
  Promise.all(initialProms)
    .then(paCreateArticle)
    .then((result) => {
      console.log(`${approachName}: created article`, result._id);
    })
    .catch((err) => errorDispatch(err, approachName));
  console.log('TESTING PROMISE.ALL');
}

module.exports = promiseAll;
