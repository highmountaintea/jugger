/**
 * runs the passed in function, and swllow any error or uncaught promise error
 * @param {*} fn the function to run
 */
export function swallow(fn) {
  let result;
  try {
    result = fn();
  } catch (e) {
    // swallow
  }
  Promise.resolve(result).catch(() => {
    // needs to swallow if a promise, otherwise it will kill the whole system
  });
}
