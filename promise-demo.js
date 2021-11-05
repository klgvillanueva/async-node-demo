/* =====================================================================================================================
 * CALLBACKS AND PROMISES BY EXAMPLE *

 ## BACKGROUND                                                                                                          
 Codesmith is changing the way they create blog articles and post articles to their site. In the past, markdown files were stored on a server and used to generate HTML. Now that Codesmith is generating more articles written by more people, we are transferring these files to a database. The database is live now, and we need a script to add all of these articles to the DB. In order to distill those parts of our task that are most relevant to handling asynchronous activity, we will present a simplified version of this  problem.                                          
.
.
.
 ## TASKS                                                                                                               
 + Step 1: Connect to the database                                                                                                
 + Step 2: Fetch a markdown file from the file system                                                                   
 + Step 3: Save fetched article to the database
.
.
.       
 >> How do the results of these three steps rely on one another?                                                        
 + Step 3 depends on both Step 1 and Step 2 being completed  
 + Step 2 is independent from Step 1! 
   - DB access not needed in order to fetch articles from the file system
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
======================================================================================================================= */

/* ==========================
* SETTING UP THE ENVIRONMENT *
============================ */

// - external dependencies
const path = require('path'); // built-in module
const fs = require('fs'); // built-in module
const markdown = require('markdown').markdown; // npm module

// mock database (just using a local file)
const mockDB = require('./mocks/db');

// fs constants:
const BLOG_PATH = path.join(
  __dirname,
  './blog-posts/my-first-feature-article.md'
);

// db constants:
const DB_URL = 'my-mock-db';

/* ======================================================
* APPROACH #1: CALLBACKS *
======================================================== */

// We must connect to the DB before saving a new article in the DB
mockDB.connect(DB_URL, (err) => {
  // Callback 1: Now that we are connected, we can proceed!
  if (err) return console.log('db error: ', err.message); // handle db connection error
  console.log('Connected to DB');
  // before we create a new article, we need to get the content of the article
  fs.readFile(BLOG_PATH, 'utf-8', (err, data) => {
    // Once we've fetched the md file, we can proceed!
    if (err) return console.log('readfile error: ', err);
    console.log('Got article from file system');
    mockDB.create(
      {
        mdFileName: 'my-first-feature-article',
        title: 'My first feature article!',
        body: markdown.toHTML(data),
        tags: ['welcome', 'news'],
      },
      (err, result) => {
        // Once we've created and saved the article in the DB, we can proceed!
        if (err) return console.log(err);
        console.log('Created article in db: ', result);
      }
    );
  });
});

// console.log('TESTING CALLBACKS');

/*
What's wrong with this approach?
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  >> 1. Hard to read and see what's going on!
    + the nesting is hard to follow!!! What if we had even more nesting?
    + one homogeneous-looking block of code
  
  >> 2. We aren't grouping related code together.
    + Error handling happens separately in each callback!
  
  >> 3. Independent/Concurrent asynchronous activity isn't performed simultaneously!
*/

/* ============================================================
* Approach #1 REFACTORED: define our callbacks before executing our code: *
============================================================== */

function dbConnectCB(err) {
  if (err) return console.log('db connection error: ', err.message);
  console.log('Connected to DB');
  fs.readFile(BLOG_PATH, 'utf-8', readFileCB);
}

function readFileCB(err, data) {
  if (err) return console.log('readFile error: ', err.message);
  console.log('Got article from file system');
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
  if (err) return console.log(err);
  console.log('Created article in db: ', result);
}

// Now that we've defined all of our callbacks, let's execute our code!

mockDB.connect(DB_URL, dbConnectCB);
// console.log('TESTING REFACTORED CALLBACKS');

/*
  1. What's better?
  2. What still stinks?
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    .
    1. Better:
      - There's not quite so much nesting now.
      - Better organization, imo.
    2. Still Sucks:
      - IF I LOOK AT WHERE CODE IS EXECUTED, I HAVE NO CLUE WHAT'S GOING ON
        INSIDE THE CALLBACK!
      - Still not grouping related code together. Error handling happens all over
        the place
      - Still not performing independent asynchronous activity independently
*/

/* ============================================================
* Approach #2 : PROMISES *
============================================================== */

function connectToDB() {
  return new Promise((resolve, reject) => {
    mockDB.connect(DB_URL, (err) => {
      if (err) return reject({ type: 'dbConnection', err });
      console.log('Connected to DB');
      return resolve();
    });
  });
}

function getLocalArticle() {
  return new Promise((resolve, reject) => {
    fs.readFile(BLOG_PATH, 'utf-8', (err, data) => {
      if (err) return reject({ type: 'fs', err });
      console.log('Got article from file system');
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
        console.log('Created article in db');
        return resolve(result);
      }
    );
  });
}

// error handlers (pretty trivial in this case, but a good design pattern to
// be aware of):

const errors = {
  dbConnection: (err) => console.log(`DB CONNECTION ERROR: ${err.message}`.red),
  dbCreate: (err) => console.log(`DB CREATE ARTICLE ERROR: ${err.message}`.red),
  fs: (err) => console.log(`FILE SYSTEM ERROR: ${err.message}`.red),
};

function errorDispatch(info) {
  if (errors.hasOwnProperty(info.type)) return errors[info.type](info.err);
  else return console.log(`UNIDENTIFIED ERROR: ${info}`.red);
}

// Now that we've created our functions, we can execute our code:

connectToDB()
  .then(getLocalArticle)
  .then(createArticle)
  .then((result) => {
    console.log('created article', result);
  })
  .catch(errorDispatch);

// console.log('TESTING PROMISES');

// PROMISES WHITEBOARD

connectToDB()
  // return Promise Connect
  .then(getLocalArticle)
  // return Promise GetArticle
  .then(createArticle)
  // return Promise createArticle
  .then((result) => {
    console.log('created article', result);
  })
  // return Promise Log
  .catch(errorDispatch);
// return Promise Error
console.log('TESTING PROMISES');

/*
Promise Connect
{
  status: fullfilled
  value: undefined
  onFulfillment: [getLocalArticle],
  onRejected: [],
}
*/

/*
Promise getArticle 
{
  status: reject,
  value: { type: 'fs', err }
  onFulfillment: [createArticle(HTML)],
  onRejected: [],
}
*/

/*
Promise createArticle 
{
  status: fulfilled
  value: result
  onFulfillment: [anonFunc(result)],
  onRejected: [],
}
*/

/*
Promise Log
{
  status: rejected
  value: { type: 'fs', err }
  onFulfillment: [],
  onRejected: [errorDispatch({ type: 'fs', err })],
}
*/

/*
Promise Catch
{
  status: fullfilled
  value: undefined
  onFulfillment: [],
  onRejected: [],
}
*/

/*

  1. Benefits?
  2. Drawbacks?
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  Benefits:
  1. Everything is a function now. We are describing our actions with verbs!
  2. We can pass the results of previous asynch functions as parameters to
    subsequent asynch functions
  3. No excessive nesting
  4. When we execute our code, every action we perform is clear!
  5. We can group our error handling, or separate it if we prefer!

  Drawbacks:
  1. Clunky syntax, slightly more verbose
  2. Still not performing independent async activity simultaneously
  3. *Arguably not a drawback* Haven't entirely escaped callbacks: still using
      them internally
*/

/*----------------------------------------------------------------------------*/

/*
  We can actually do a bit better. Recall:
     Step 1: Connect to DB
     Step 2: Fetch markdown to convert it to HTML
  Don't rely on one another.
  Using only callbacks, writing logic to do both of these things simultaneously
  would have been difficult. Not so with promises!
*/
/* ============================================================
* Approach #2 : PROMISE.ALL *
============================================================== */
// Almost identical to the createArticle from above, but passed different input.
function paCreateArticle(results) {
  const newArticle = {
    mdFileName: 'my-first-feature-article',
    title: 'My first feature article!',
    body: results[1],
    tags: ['welcome', 'news'],
  };
  return new Promise((resolve, reject) => {
    mockDB.create(newArticle, (err, result) => {
      if (err) return reject({ type: 'dbCreate', err });
      console.log('Created article in db');
      return resolve(result);
    });
  });
}

// Reusing same functions from Approach #3.
const initialProms = [connectToDB(), getLocalArticle()];

// const results = [undefined, HTML]

// We will reuse the same error handling from Approach #3

// Now that we've defined our functions, we may execute our code:
Promise.all(initialProms)
  .then(paCreateArticle)
  .then((result) => {
    console.log('created article', result);
  })
  .catch(errorDispatch);

// console.log('TESTING PROMISE.ALL');

/*
Promise Proms
{
  status: pending,
  value: [undefined, htmlArticle]
  onFulfillment: [paCreateArticle(valueArray)],
  onRejected: [],
}
*/

/*

  1. Benefits?
  2. Drawbacks?
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  .
  1. Benefits:
      - More efficient!
  2. Drawbacks:
      - Potentially less clear what promises are in your array.
      - If one promise fails, you're doomed
*/

/* ============================================================
* Approach #4 : ASYNC / AWAIT *
============================================================== */
async function createAsyncArticle() {
  // Reusing same functions (connectToDB, getLocalArticle,
  //  createArticle) from Approach #2.
  await connectToDB(); // pauses local execution context
  let html = await getLocalArticle(); // pauses local execution context
  return await createArticle(html); // pauses local execution context
}

// USE TRY CATCH

// createAsyncArticle()
//   .then((result) => console.log('success: ', result))
//   .catch(errorDispatch);

// when should we expect to see this console.log?
// always after createAsyncArticle has completed?
// OR anytime after createAsyncArticle is invoked?
// console.log('hi');
// console.log('TESTING ASYNC/AWAIT');

/**
 * Could we still do better?
 *
 *
 * What happened to our Promise.all with async/await?
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

/* ============================================================
* Approach #4 REFACTORED: ASYNC / AWAIT with PROMISE.ALL*
============================================================== */

async function createBetterAsyncArticle() {
  // Reusing same function (paCreateArticle) and array (initialProms) from Approach #4.
  const results = await Promise.all(initialProms);
  return await paCreateArticle(results);
}

TRY / CATCH;

// createBetterAsyncArticle()
//   .then((result) => console.log('success: ', result))
//   .catch(errorDispatch);
// console.log('TESTING REFACTORED ASYNC/AWAIT');

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * So, what do we like? What do we not like?
 *
 * Advantages: cleaner code
 * Essentially wrapping the whole promise chain in a
 *  function so it’s clearly defined what the chain
 *  is doing (asynchronously creating an article!)
 * Easier to see what is asynchronous & blocking and what
 *  is not (for-loop is not asynchronous)
 *
 * Disadvantages / things to note:
 * Still using promises under the hood, and sometimes
 *  directly in conjunction (see async/await with
 *  Promise.all)
 */
