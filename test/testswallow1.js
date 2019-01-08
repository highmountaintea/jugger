const jugger = require('../lib');

function unreliableWait(ms, exception) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (exception) reject(new Error('some exception'));
      else resolve(true);
    }, ms);
  });
}

jugger.swallow(() => {
  console.log('test 1');
});

jugger.swallow(() => {
  console.log('test 2 a');
  abc;
  console.log('test 2 b');
});

jugger.swallow(async () => {
  console.log('test 3 a');
  await unreliableWait(1000);
  console.log('test 3 b');
  await unreliableWait(1000, true);
  console.log('test 3 c');
  await unreliableWait(1000);
  console.log('test 3 d');
});

(async () => {
  console.log('test 4 a');
  await unreliableWait(1000);
  console.log('test 4 b');
  await unreliableWait(1000, true);
  console.log('test 4 c');
  await unreliableWait(1000);
  console.log('test 4 d');
})();
