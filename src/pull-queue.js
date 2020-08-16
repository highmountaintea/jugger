export const Wait = 'wait';

/**
 * A Queue abstraction that handles concurrencies well
 * @param {*} opts options
 */
export function create(opts) {
  let options = Object.assign({ concurrency: 1, buffer: 10 }, opts);
  const { concurrency, buffer } = options;
  let handler = null;

  let queue = [];
  let numActive = 0;
  let timer = null;

  function size() {
    return queue.length;
  }

  function active() {
    return numActive;
  }

  function idle() {
    return size() === 0 && active() === 0;
  }

  function onDemand(fn) {
    handler = fn;
    checkDemand(); // eslint-disable-line no-use-before-define
  }

  async function runDemand() {
    let result = Wait;
    try {
      result = await handler();
      if (Array.isArray(result)) {
        for (let i of result) queue.push(i); // eslint-disable-line
      }
    } catch (e) {
      // console.log(e);
      // swallow, cannot allow uncaught promise???
    } finally {
      numActive -= 1;
      // console.log(result);
      switch (result) {
        case Wait:
          setDemandTimer(); // eslint-disable-line no-use-before-define
          break;
        default:
          process.nextTick(checkDemand); // eslint-disable-line no-use-before-define
      }
    }
  }

  function checkDemand() {
    while (queue.length < buffer && numActive < concurrency) {
      numActive += 1;
      runDemand();
    }
  }

  function setDemandTimer() {
    if (timer != null) return;
    timer = setTimeout(() => {
      timer = null;
      checkDemand();
    }, 500);
  }

  function remove(upto) {
    let result = [];
    while (queue.length > 0 && result.length < upto) {
      let item = queue.shift();
      result.push(item);
    }
    checkDemand();
    return result;
  }

  return { remove, idle, size, active, onDemand, Wait };
}
