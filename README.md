# jugger

utilities to handle concurrent or periodic tasks, replacing setInterval or setTimer

## Installation

Install with `npm install jugger`, then use it in your node or frontend projects like this:

```js
const jugger = require('jugger');

jugger.interval(() => {
  console.log('ping');
}, 1000);
```



## API

`interval(fn, ms, options)`
* `fn(control)` - the function that is run periodically
* `ms` - how many milliseconds between each invocation
* `options` - not implemented yet
* returns a `control` object

`interval` is similar to javascript `setInterval()`, but more user friendly. It has the following features:
* It will wait for the previous invocation to finish before invoking the next, preventing multiple invocations running concurrently causing race conditions
* It handles both regular functions and async functions
* It catches exceptions so they do not kill the interval timer
* The wait period can be dynamically controlled

```js
const jugger = require('jugger');

const interval1 = jugger.interval(async (control) => {
  // periodically poll a remove service,
  // if the service returns result, display the result
  // else delay the next invocation
  const result = await someService();
  if (result != null) {
    console.log(result);
  } else {
    control.wait(60000);
  }
}, 5000);
```

`swallow(fn)`
* `fn()` - the function to run
* returns nothing

`swallow` simplies runs a function, and swallows any error, including promise errors. It is especially useful when trying to log errors in a catch clause.

```js
const jugger = require('jugger');

async function someBusinessLogic() {
  try {
    // perform some logic
    const result = await someService();
    const output = result * 3 + 4;
    logger.log('success', output);
  } catch (e) {
    // we cannot afford the logging code to throw exception here, so we need to wrap it in swallow
    jugger.swallow(() => {
      logger.error(e);
    });
  }
}
```