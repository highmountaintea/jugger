require('@babel/polyfill');
const jugger = require('../lib');

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

  async function download(i) {
    await randomWait(1, 1000);
    downloadResult.push(i);
    // console.log('downloaded');
    dbwriteQueue.add(i);
    if (fileNo < 100) {
      fileNo += 1;
      downloadQueue.add(fileNo);
    }
    // console.log('downloaded2');
  }

  async function writeDb(i) {
    await randomWait(1, 100);
    dbResult.push(i);
    // console.log('written to db');
    checkFinishQueue.add(1);
  }

  async function checkFinish(i) {
    // console.log('checking finish');
    if (downloadQueue.idle() && dbwriteQueue.idle()) {
      let compare = JSON.stringify(downloadResult) === JSON.stringify(dbResult);
      console.log(`compare result: ${compare}`);
    }
  }

  const downloadQueue = new jugger.Queue({ concurrency: 3, consume: download });
  const dbwriteQueue = new jugger.Queue({ concurrency: 1, consume: writeDb });
  const checkFinishQueue = new jugger.Queue({ concurrency: 1, consume: checkFinish });

  while (fileNo < 10) {
    fileNo += 1;
    downloadQueue.add(fileNo);
  }
}

main();
