class Queue {
  constructor(concurrency = Infinity) {
    this.concurrency = concurrency;
    this.queue = [];
    this.tasks = [];
    this.activeCount = 0;
  }

  push(fn) {
    this.tasks.push(() => {
      new Promise((resolve, reject) => {
        const task = () => {
          this.activeCount++;
          fn()
            .then((data) => resolve(data))
            .catch((err) => reject(err)) // 如果要求单个任务执行异常时需要重新加入等待队列执行的话，则在这里不reject，而是直接addToWait
            .then(() => this.next());
        };

        if (this.activeCount < this.concurrency) {
          task();
        } else {
          this.queue.push(task);
        }
      });
    });
  }

  all() {
    return Promise.all(
      this.tasks.map((task) => {
        return task();
      })
    );
  }

  addToWait(task) {
    this.activeCount--;

    this.queue.push(task);
  }

  next() {
    this.activeCount--;
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  }
}

function fn(t, err) {
  return new Promise((resolve, reject) => {
    console.log("执行");

    setTimeout(() => {
      err ? reject(err) : resolve(`time: ${t}s.`);
    }, t);
  });
}

console.time("Queue");
const q = new Queue(2);
q.push(() => fn(1001));
q.push(() => fn(1002, "errmessage"));
q.push(() => fn(1003));
q.push(() => fn(1004));

// 使用all控制队列任务的开始执行
q.all()
  .then(console.log)
  .then(() => console.timeEnd("Queue"))
  .catch((err) => {
    console.log("err", err);
  });
