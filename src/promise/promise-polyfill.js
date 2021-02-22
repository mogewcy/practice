const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

// resolvePromise是为了在then的回调中完整的返回一个promise对象
const resolvePromise = (promise2, x, resolve, reject) => {
  // 自己等待自己完成是错误的实现，用一个类型错误，结束掉 promise  Promise/A+ 2.3.1
  if (promise2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }

  // Promise/A+ 2.3.3.3.3 只能调用一次
  let called;
  // 后续的条件要严格判断 保证代码能和别的库一起使用, x是对象或者函数
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    try {
      // 为了判断 resolve 过的就不用再 reject 了（比如 reject 和 resolve 同时调用的时候）  Promise/A+ 2.3.3.1
      let then = x.then;
      if (typeof then === "function") {
        // 2.3.3.3 x.then为函数的话，把x当成this调用
        // 不要写成 x.then，直接 then.call 就可以了 因为 x.then 会再次取值，Object.defineProperty  Promise/A+ 2.3.3.3
        then.call(
          x,
          (y) => {
            // 根据 promise 的状态决定是成功还是失败
            if (called) return;
            called = true;
            // 递归解析的过程（因为可能 promise 中还有 promise） Promise/A+ 2.3.3.3.1
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            // 只要失败就失败 Promise/A+ 2.3.3.3.2
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 如果 x.then 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      // Promise/A+ 2.3.3.2
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.4
    resolve(x);
  }
};

class Promise {
  constructor(executor) {
    // 默认状态是pending
    this.status = PENDING;

    this.value = undefined;

    this.reason = undefined;

    this.onResolveCallbacks = [];

    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if (value instanceof Promise) {
        return value.then(resolve, reject);
      }

      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;

        this.onResolveCallbacks.forEach((fn) => {
          fn();
        });
      }
    };

    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;

        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 如果没传onFulfilled的话，要透传值, Promise.resolve(1).then().then(console.log) 打印出来1
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;

    // 如果没传onRejected的话，要透错误, Promise.reject(1).catch().catch(console.log) 打印出来1
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          // setTimeout是为了模仿异步行为，我们知道setTimoue回调是会被添加到宏任务队列中，而promise.then回调是添加到微任务队列当中，所以要完全模拟这一行为的话，需要改写为queueMicrotask或者mutaionObserver来执行
          try {
            let x = onFulfilled(this.value);

            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);

            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.status === PENDING) {
        this.onResolveCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);

              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);

              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(callback) {
    return this.then(
      (value) => {
        return Promise.resolve(value).then(callback);
      },
      (reason) => {
        return Promise.reject(reason).catch(callback);
      }
    );
  }

  static resolve(data) {
    return new Promise((resolve, reject) => {
      return resolve(data);
    });
  }

  static reject(err) {
    return new Promise((resolve, reject) => {
      return reject(err);
    });
  }

  // iterable是可遍历对象, 这里只考虑了iterable为数组的情况
  static all(iterable) {
    if (typeof iterable === "undefined") {
      throw new TypeError("参数必须是iterable的");
    }

    let promises;

    if (iterable instanceof Set) {
      promises = [...iterable]; // 把set转换为array
    } else if (iterable instanceof Array) {
      promises = [...iterable];
    } else if (typeof iterable === "string") {
      promises = [...iterable];
    }

    if (!promises.length) {
      // 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise。
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let count = promises.length;

      const result = [];

      const checkDone = () => {
        if (count === 0) {
          resolve(result);
        }
      };

      promises.forEach((p, i) => {
        if (p && p.then === "function") {
          p.then((x) => {
            result[i] = x;
          }, reject).then(() => {
            count--;

            return checkDone();
          });
        } else {
          result[i] = p;

          checkDone();
        }
      });
    });
  }

  // 返回第一个有确定状态的，有结果的promise
  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((p) => {
        if (p && typeof p.then === "function") {
          p.then(resolve, reject);
        } else {
          resolve(p);
        }
      });
    });
  }

  // 返回第一个成功态的promise
  static any(promises) {
    if (!promises.length) {
      // 如果传入的参数是一个空的可迭代对象，则返回一个 已失败（already rejected） 状态的 Promise。
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      let count = 0;

      promises.forEach((p) => {
        if (p && typeof p.then === "function") {
          p.then(resolve).catch((err) => {
            count++;

            if (count === promises.length) {
              // 如果都没有成功的话 则reject
              reject(new Error("All promises were rejected"));
            }
          });
        } else {
          resolve(p);
        }
      });
    });
  }

  // 如果所有的promise都有了确定的状态，则进入resolve
  static allSettled(promises) {
    return new Promise((resolve, reject) => {
      let result = [];

      const checkDone = () => {
        if (result.length === promises.length) {
          resolve(result);
        }
      };

      promises.forEach((p, i) => {
        if (p && typeof p.then === "function") {
          p.then(
            (x) => {
              result[i] = {
                status: FULFILLED,
                value: x
              };
            },
            (y) => {
              result[i] = {
                status: REJECTED,
                reason: y
              };
            }
          ).then(checkDone);
        }
      });
    });
  }
}

export default Promise;
