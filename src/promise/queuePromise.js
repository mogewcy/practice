// 1. 使用reduce
function runQueuePromise(promises, intialVal = null) {
  let p = Promise.resolve(intialVal);

  return promises.reduce((acc, cur) => {
    p = p
      .then((res) => {
        return cur(res);
      })
      .catch((err) => {
        return Promise.reject(err); //这里处理了串行过程中有promise rejected的状态
      });
  });
}

/*
function runQueuePromise(promises) {
  let p = Promise.resolve();

  for (const task of promises) {
    p = p.then(task);
  }

  return p;
}
*/

async function runPromisesSerially(tasks) {
  for (const task of tasks) {
    await task();
  }
}

export default runQueuePromise;
