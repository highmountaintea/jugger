const jugger = require('../lib');

jugger.interval((control) => {
  let num = Math.random();
  console.log(num);
  if (num < 0.05) control.halt();
  else if (num < 0.10) control.newInterval(3000);
  else if (num < 0.20) control.wait(3000);
  else if (num > 0.90) control.newInterval(1000);
}, 1000);
