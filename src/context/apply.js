/* eslint-disable */

Function.prototype.call = function (context = window, ...args) {
  if (this === Function.prototype) {
    return undefined; // 用于防止Function.prototype.call直接调用
  }

  const fn = Symbol(); // 私有的，怕被篡改

  context[fn] = this; // this就是这个函数本身

  const result = context[fn](...args);

  delete context[fn];

  return result;
};

Function.prototype.call1 = function (context = window, ...args) {
  if (this === Function.prototype) {
    return undefined;
  }

  let fn = Symbol();

  context[fn] = this;

  let result = context[fn](...args);

  delete context[fn];

  return result;
};

Function.prototype.apply = function (context = window, args) {
  if (this === Function.prototype) {
    return undefined;
  }

  let fn = Symbol();

  context[fn] = this;

  let result;

  if (Array.isArray(args)) {
    result = context[fn](args);
  } else {
    result = context[fn]();
  }

  delete context[fn];

  return result;
};
