/**
 * @name callbacks
 * @description
 *   Drawbacks:
 *    1. Hard to read and see what's going on!
 *       - the nesting is hard to follow! What if we had even more nesting?
 *       - one homogeneous-looking block of code
 *    2. We aren't grouping related code together.
 *       - Error handling happens separately in each callback!
 *    3. Concurrent asynchronous activity isn't performed in parallel!
 */

// external dependencies
const markdown = require('markdown').markdown;
const fs = require('fs');

// mock database (just using a local file)
const mockDB = require('../mocks/db');

// constants
const approachName = 'CALLBACKS';
const { BLOG_PATH, DB_URL } = require('../constants/constants');

// EXAMPLE: CALLBACKS
// We must connect to the DB before saving a new article in the DB
function callbacks() {
  mockDB.connect(DB_URL, (err) => {
    // Callback 1: Now that we are connected, we can proceed!
    if (err) return console.log(`${approachName}: db error: `, err.message); // handle db connection error
    console.log(`${approachName}: Connected to DB`);

    // before we create a new article, we need to get the content of the article
    fs.readFile(BLOG_PATH, 'utf-8', (err, data) => {
      // Callback 2: Once we've fetched the md file, we can proceed!
      if (err) return console.log(`${approachName}: readfile error: `, err);
      console.log(`${approachName}: Got article from file system`);

      // now that we're connected to the db AND have the article, we can create the article record in the db
      mockDB.create(
        {
          mdFileName: 'my-first-feature-article',
          title: 'My first feature article!',
          body: markdown.toHTML(data),
          tags: ['welcome', 'news'],
        },
        (err, result) => {
          // Callback 3: Once we've created the article in the DB, we can proceed!
          if (err)
            return console.log(`${approachName}: db create error: `, err);
          console.log(`${approachName}: Created article in db: `, result._id);
        }
      );
    });
  });
  console.log('TESTING CALLBACKS');
}

module.exports = callbacks;
