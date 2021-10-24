/**
 * @name async-await
 * @description
 *   Advantages: cleaner code
 *    Essentially wrapping the whole promise chain in a
 *     function so it’s clearly defined what the chain
 *     is doing (asynchronously creating an article!)
 *    Easier to see what is asynchronous & blocking and what
 *     is not (for-loop is not asynchronous)
 *
 *   Disadvantages / things to note:
 *   Still using promises under the hood, and sometimes
 *    directly in conjunction (i.e. async/await with
 *    Promise.all)
 */

// external dependencies
const markdown = require('markdown').markdown;
const fs = require('fs');

// mock database (local file)
const mockDB = require('../mocks/db');
// custom error handler module imported locally
const errorDispatch = require('../utils/error-handling');

// constants
const approachName = 'ASYNC / AWAIT';
const { BLOG_PATH, DB_URL } = require('../constants/constants');

// EXAMPLE: ASYNC / AWAIT
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

async function createAsyncArticle() {
  try {
    // Reusing approach #3 functions (connectToDB, getLocalArticle, createArticle)
    await connectToDB(); // pauses local execution context
    let html = await getLocalArticle(); // pauses local execution context
    const newArticle = await createArticle(html); // pauses local execution context

    console.log(`${approachName}: success: `, newArticle._id);
  } catch (e) {
    errorDispatch(e, approachName);
  }
}

function asyncAwait() {
  createAsyncArticle();
  // when should we expect to see this console.log?
  // always after createAsyncArticle has completed?
  // OR anytime after createAsyncArticle is invoked?
  console.log(`${approachName}: hi`);
  console.log('TESTING ASYNC/AWAIT');
}
// asyncAwait();

module.exports = asyncAwait;
