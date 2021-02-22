function wrap(task) {
  let abort;

  let newPromise = new Promise((resolve, reject) => {
    abort = reject;
  });

  let withCancelPromise = Promise.race([newPromise, task]);

  withCancelPromise.abort = abort;

  return withCancelPromise;
}

export default wrap;

function getAbortPromise(cb) {
  let _reslove, _reject;

  const promise = new Promise((resolve, reject) => {
    _reslove = resolve;
    _reject = reject;

    cb && cb(resolve, reject);
  });

  return {
    promise,
    abort: () => {
      _reject({
        name: "abort",
        message: "the promise is aborted",
        aborted: true
      });
    }
  };
}

//主逻辑提取出来
function runCb(resolve, reject) {
  setTimeout(() => {
    resolve("1111");
  }, 3000);
}

const { promise, abort } = getAbortPromise(runCb);
promise.then(console.log).catch((e) => {
  console.log(e);
});
