/**
 * A Queue abstraction that handles concurrencies well
 * @param {*} opts options
 */
export function create(opts) {
  let options = Object.assign({ limit: 2000 }, opts);
  const { limit } = options;

  let queue = [];
  let consumer = null;
  let producer = null;

  function count() {
    return queue.length;
  }

  function activeConsumers() {
    if (consumer == null) return 0;
    return consumer.numActive;
  }

  function activeProducers() {
    if (producer == null) return 0;
    return producer.numActive;
  }

  function idle() {
    return count() === 0 && activeConsumers() === 0 && activeProducers() === 0;
  }

  function onData(fn, opts) {
    consumer = Object.assign({ concurrency: 1, fn: fn, numActive: 0 }, opts);
  }

  function onHungry(fn, opts) {
    producer = Object.assign({ concurrency: 1, fn: fn, numActive: 0, buffer: 5 }, opts);
  }

  async function runProducer() {
    let hasResult = false;
    try {
      let result = await producer.fn();
      if (result != null) {
        hasResult = true;
        for (let i of result) queue.push(i); // eslint-disable-line
      }
    } catch (e) {
      // swallow, cannot allow uncaught promise???
    } finally {
      producer.numActive -= 1;
      if (hasResult) process.nextTick(feed); // eslint-disable-line no-use-before-define
    }
  }

  function feedProducer() {
    if (producer == null) return;
    while (queue.length < producer.buffer && producer.numActive < producer.concurrency) {
      producer.numActive += 1;
      runProducer();
    }
  }

  async function runConsumer(item) {
    try {
      await consumer.fn(item);
    } catch (e) {
      // swallow, cannot allow uncaught promise???
    } finally {
      consumer.numActive -= 1;
      process.nextTick(feed); // eslint-disable-line no-use-before-define
    }
  }

  function feedConsumer() {
    if (consumer == null) return;
    while (queue.length > 0 && consumer.numActive < consumer.concurrency) {
      let item = queue.shift();
      consumer.numActive += 1;
      runConsumer(item);
    }
  }

  function feed() {
    feedConsumer();
    feedProducer();
  }

  function add(item) {
    if (queue.length >= limit) throw new Error('queue already at limit of ' + limit); // eslint-disable-line prefer-template
    queue.push(item);
    feedConsumer();
  }

  function remove(upto) {
    let result = [];
    while (queue.length > 0 && result.length < upto) {
      let item = queue.shift();
      result.push(item);
    }
    feedProducer();
    return result;
  }

  function start() {
    feedProducer();
  }

  return { add, remove, idle, count, activeConsumers, activeProducers, onData, onHungry, start };
}
