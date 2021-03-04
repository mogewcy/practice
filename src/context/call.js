/* eslint-disable */

/*
1. 将函数设为对象的属性
2. 执行该函数
3. 删除该函数

https://github.com/mqyqingfeng/Blog/issues/11

var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

bar.call(foo); // 1

所以可以考虑把bar变成foo的属性
var foo = {
  value: 1,
  bar: function() {
    console.log(this.value)；
  }
}
*/
Function.prototype.apply = function (context = window, ...args) {
  if (this === Function.prototype) {
    return undefined;
  }

  let fn = Symbol();

  context[fn] = this;

  let result = context[fn](...args);

  delete context[fn];

  return result;
};
