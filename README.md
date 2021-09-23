# unit-09-express Promise Demo

## this is a markdown file!

#

# you

# can

# write

# simple

# stuff

# in

# here

#

# !!!!!!!

#

#

#

#

#

#

#

#

#

#

#

#

#

## before running

`npm install` to get depenencies

## approach options

There are 6 different approaches which can be tested:

1. `callbacks.js`: The first approach is raw callbacks using anonymous functions for handling the callback functionality
2. `callbacks-refactored.js`: A modularized approach to the callback pattern where we are using named callback functions for a slightly more readable implementation. Still has drawbacks - see approach file for more info.
3. `promises.js`: Introducing promises! Syntactic sugar around our asynchronous activity for better readablity in javascript-land. Promises also provide the added bonus of being prioritized in the microtask queue, above delayed functionality in the callback queue.
4. `promise-all.js`: Another implementation with promises, but this time utilizing Promise.all for parallel promise execution!
5. `async-await.js`: MOAR SUGAR! Async / Await provides additional syntactic sugar to the sweetness that is promises and enables us to wrap our whole asynchronous task in a special `async` function and use the `await` keyword to make our asynchronous code _read_ as more synchronously. DON'T BE FOOLED - it is **not** actually running synchronously in the main thread.
6. `async-await-refactored.js`: Slight improvement to our initial async / await method, this time incorporating Promise.all in conjunction with async / await for a both readable AND performant solution (we're back to executing our concurrent tasks in parallel!)

## to run

You can run one or more approaches at once using the `main.js` file. Open up that file and simple uncomment the approach(es) you wish to test, save the file, and run `node main.js` in your terminal.
