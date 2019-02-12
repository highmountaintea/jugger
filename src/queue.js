/**
 * A Queue abstraction that handles concurrencies well
 * @param {*} opts options
 */
export function Queue(opts) { // eslint-disable-line no-unused-vars
  if (opts == null) throw new Error('options required');
  let options = Object.assign({ limit: 2000, fetchBelow: 10 }, opts);
  const { concurrency, consume, fetch, limit } = options; // eslint-disable-line no-unused-vars
  if (concurrency == null) throw new Error('concurrency required');
  if (consume == null) throw new Error('consume(item) handler required');

  let activeCount = 0;
  let queue = [];

  function count() {
    return queue.length;
  }

  function idle() {
    return queue.length === 0 && activeCount === 0;
  }

  async function doConsume(item) {
    try {
      await consume(item);
    } catch (e) {
      // swallow, cannot allow uncaught promise???
    } finally {
      activeCount -= 1;
      process.nextTick(feedConsume); // eslint-disable-line no-use-before-define
    }
  }

  function feedConsume() {
    while (queue.length > 0 && activeCount < concurrency) {
      let item = queue.shift();
      activeCount += 1;
      doConsume(item);
    }
  }

  function add(item) {
    if (queue.length >= limit) throw new Error('queue already at limit of ' + limit); // eslint-disable-line prefer-template
    queue.push(item);
    feedConsume();
  }

  return { add, idle, count };
}
