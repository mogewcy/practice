/* eslint-disable */

/**
 * 
1.处理参数，返回一个闭包
2.判断是否为构造函数调用，如果是则使用new调用当前函数
3.如果不是，使用apply，将context和处理好的参数传入
https://github.com/mqyqingfeng/Blog/issues/12
 */

Function.prototype.bind = function (context, ...args1) {
  if (this === Function.prototype) {
    throw new TypeError("Error msg");
  }

  const _this = this; // this代表了当前函数

  return function F(...args2) {
    //一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

    // 判断是否用于构造函数
    if (this instanceof F) {
      // 这个实例是构造函数实例化产生的实例
      // 这里的this是新的函数， bind返回的函数
      return new _this(...args1, ...args2);
    }

    return _this.apply(context, args1.concat(args2));
  };
};

Function.prototype.bind = function (context = window, ...args1) {
  if (this === Function.prototype) {
    throw new Error("rrr");
  }

  const _this = this;

  return function F(...args2) {
    if (this instanceof F) {
      return new _this(...args1, ...args2);
    }

    return _this.apply(context, args1.concat(args2));
  };
};
