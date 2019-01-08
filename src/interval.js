/**
 * runs the designated function periodically. This utility will wait for one invocation to
 * finish before it runs the next in line. It always waits for ms amount of time between the end
 * of one invocation and the beginning of the next
 * @param {*} fn function to invoke every interval
 * @param {*} ms invocation interval in milliseconds
 * @param {*} options not implemented yet
 */
export function interval(fn, ms, options) { // eslint-disable-line no-unused-vars
  if (ms == null || typeof ms !== 'number') throw new Error('invalid ms');

  const settings = {
    ms: ms,
    halted: false,
  };

  function wait(newms) {
    try {
      if (newms != null && typeof newms === 'number') settings.nextMs = newms;
    } catch (e) {
      // swallow
    }
  }

  function newInterval(newms) {
    try {
      if (newms != null && typeof newms === 'number') settings.ms = newms;
    } catch (e) {
      // swallow
    }
  }

  function pause() {
  }

  function resume() {
  }

  function halt() {
    settings.halted = true;
  }

  function thread() {
    function queueNext() {
      // stop if halted is set
      if (settings.halted) return;

      // figure out how long to wait
      let nextMs;
      if (settings.nextMs != null) {
        nextMs = settings.nextMs;
        delete settings.nextMs;
      } else {
        nextMs = settings.ms;
      }

      // call
      setTimeout(thread, nextMs);
    }

    let result;
    try {
      const control = { wait, newInterval, pause, resume, halt };
      result = fn(control);
    } catch (e) {
      // swallow, may invoke error handler in the future when options is implemented
    }
    Promise.resolve(result).finally(queueNext);
  }

  setTimeout(thread, settings.ms);

  return { wait, newInterval, pause, resume, halt };
}
