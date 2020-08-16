require('@babel/polyfill');
const jugger = require('../lib');

const PullQueue = jugger.PullQueue;

function randomWait(minMs, maxMs) {
  const ms = Math.random() * (maxMs - minMs) + minMs;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

async function download(fileNo) {
  await randomWait(1, 1000);
  return fileNo;
}

async function writeDb(db, data) {
  await randomWait(1, 100);
  db.push(data);
}

async function main() {
  let start = new Date();
  let downloadResult = [];
  let dbResult = [];
  let fileNo = 0;

  const downloadQueue = PullQueue.create({ concurrency: 10, buffer: 20 });
  const dbwriteQueue = PullQueue.create();

  downloadQueue.onDemand(async () => {
    // console.log('download queue');
    if (fileNo < 1000) {
      fileNo += 1;
      let file = await download(fileNo);
      downloadResult.push(file);
      return [file];
    } else {
      return PullQueue.Wait;
    }
  });

  dbwriteQueue.onDemand(async () => {
    // console.log('write queue');
    let data = downloadQueue.remove(1);
    if (data.length === 0) return PullQueue.Wait;
    await writeDb(dbResult, data[0]);
  });

  setInterval(() => {
    console.log('interval');
    console.log(`q1 size: ${downloadQueue.size()} active: ${downloadQueue.active()}, q2 size: ${dbwriteQueue.size()} active: ${dbwriteQueue.active()}`);
    if (downloadQueue.idle() && dbwriteQueue.idle()) {
      console.log(downloadResult.length);
      // console.log(downloadResult);
      // console.log(dbResult);
      let compare = JSON.stringify(downloadResult) === JSON.stringify(dbResult);
      console.log(`compare result: ${compare} took ${new Date() - start}`);
    }
  }, 2000);
}

main();
