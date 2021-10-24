/**
 * @name callbacks-refactored
 * @description
 *    1. Better:
 *       - There's not quite so much nesting now.
 *       - Better organization, ish.
 *    2. Still Sucks:
 *       - IF I LOOK AT WHERE CODE IS EXECUTED, I HAVE NO CLUE WHAT'S GOING ON
 *         INSIDE THE CALLBACK!
 *       - Still not grouping related code together. Error handling happens all over
 *         the place
 *       - Still not performing concurrent asynchronous activity in parallel
 */

// external dependencies
const markdown = require('markdown').markdown;
const fs = require('fs');

// mock database (just using a local file)
const mockDB = require('../mocks/db');

// constants
const approachName = 'CALLBACKS';
const { BLOG_PATH, DB_URL } = require('../constants/constants');

// EXAMPLE: CALLBACKS REFACTORED
function dbConnectCB(err) {
  if (err)
    return console.log(`${approachName}: db connection error: `, err.message);
  console.log(`${approachName}: Connected to DB`);
  fs.readFile(BLOG_PATH, 'utf-8', readFileCB);
}

function readFileCB(err, data) {
  if (err) return console.log(`${approachName}: readFile error: `, err.message);
  console.log(`${approachName}: Got article from file system`);
  mockDB.create(
    {
      mdFileName: 'my-first-feature-article',
      title: 'My first feature article!',
      body: markdown.toHTML(data),
      tags: ['welcome', 'news'],
    },
    createArtCB
  );
}

function createArtCB(err, result) {
  if (err) return console.log(`${approachName}: db create error: `, err);
  console.log(`${approachName}: Created article in db: `, result._id);
}

function callbacksRefactored() {
  // Now that we've defined all of our callbacks, let's execute our code!
  mockDB.connect(DB_URL, dbConnectCB);
  console.log('CALLBACKS-REFACTORED LOG// mock database (local file)');
}

module.exports = callbacksRefactored;
