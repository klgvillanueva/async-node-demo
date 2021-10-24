/**
 * @name promises
 * @description example of wrapping our callbacks in promises to achieve better readability
 *    Benefits:
 *      1. Everything is a function now. We are describing our actions with verbs!
 *      2. We can pass the results of previous async functions as parameters to
 *         subsequent functions
 *      3. No excessive nesting
 *      4. When we execute our code, every action we perform is clear!
 *      5. We can group our error handling, or separate it if we prefer
 *    Drawbacks:
 *      1. Somewhat clunky / verbose syntax when wrapping our functionality in promises
 *      2. Still not performing concurrent async activity in parallel
 *      3. *Arguably not a drawback* Haven't entirely escaped callbacks: still using
 *         them internally, just wrapping them with this proimise functionality
 */

// external dependencies
const markdown = require('markdown').markdown;
const fs = require('fs');

// mock database (local file)
const mockDB = require('../mocks/db');
// custom error handler module imported locally
const errorDispatch = require('../utils/error-handling');

// constants
const approachName = 'PROMISES';
const { BLOG_PATH, DB_URL } = require('../constants/constants');

// EXAMPLE: PROMISES
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

function promises() {
  // Now that we've created our functions, we can execute our code:
  connectToDB()
    .then(getLocalArticle)
    .then(createArticle)
    .then((result) => {
      console.log(`${approachName}: created article`, result._id);
    })
    .catch((err) => errorDispatch(err, approachName));
  console.log('TESTING PROMISES');
}

module.exports = promises;
