require('@babel/polyfill');
const jugger = require('../lib');

const Queue = jugger.Queue;

function randomWait(minMs, maxMs) {
  const ms = Math.random() * (maxMs - minMs) + minMs;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

async function main() {
  let downloadResult = [];
  let dbResult = [];
  let fileNo = 0;

  const downloadQueue = Queue.create();
  const dbwriteQueue = Queue.create();

  downloadQueue.onData(async (data) => {
    await randomWait(1, 1000);
    downloadResult.push(data);
    // console.log('downloaded');
    dbwriteQueue.add(data);
    // console.log('downloaded2');
  }, { concurrency: 10 });

  dbwriteQueue.onData(async (data) => {
    await randomWait(1, 100);
    dbResult.push(data);
    // console.log('written to db');
  }, { concurrency: 1 });

  // Queue.onAllIdle([downloadQueue, dbwriteQueue],
  //   () => {
  //     let compare = JSON.stringify(downloadResult) === JSON.stringify(dbResult);
  //     console.log(`compare result: ${compare}`);
  //   });

  downloadQueue.onHungry(async () => {
    if (fileNo < 1000) {
      fileNo += 1;
      return [fileNo];
    } else {
      return null;
    }
  }, { concurrency: 1 });

  downloadQueue.start();

  setInterval(() => {
    console.log(`q1 size: ${downloadQueue.count()} active: ${downloadQueue.activeConsumers()}, q2 size: ${dbwriteQueue.count()} active: ${dbwriteQueue.activeConsumers()}`);
    if (downloadQueue.idle() && dbwriteQueue.idle()) {
      console.log(downloadResult.length);
      let compare = JSON.stringify(downloadResult) === JSON.stringify(dbResult);
      console.log(`compare result: ${compare}`);
    }
  }, 2000);
}

main();