/**
 * 手写一个new 操作符
 * 步骤如下
 * 1. 创建一个新对象
 * 2. 把新对象的__proto__属性指向构造函数的原型对象上
 * 3. 把新对象作为函数执行的上下文，并传入实例化的参数，执行构造函数
 * 4. 如果构造函数没有返回任何其他对象，则那么new表达式中的函数调用会自动返回这个新对象
 */

function fakeNew(constructor) {
  if (typeof constructor !== "function") {
    throw new TypeError("不是构造函数");
  }

  fakeNew.target = constructor; // es6 new.target指向构造函数，
  // 在构造函数中，如果是以new的形式被调用，则new target指向构造函数；如果直接调用的话，new.taregt为undefined

  let instance = {}; // 第一步，创建一个新对象
  instance.__proto__ = constructor.prototype; //第二步，新对象的__proto__指向构造函数的原型对象

  // 或者6，7行可以直接用 let instance = Object.create(constructor.prototype) 替代，object.create返回一个对象，该对象的的__proto__指向传入的原型对象

  let instanceArgs = [].slice.call(arguments, 1); //获取传给构造函数的参数

  let val = constructor.apply(instance, instanceArgs); // 构造函数内的this绑定到新对象，并执行构造函数，拿到返回值

  let isObject =
    typeof val === "object" || (typeof val === "function" && val !== null);
  let isFunction = typeof val === "function";

  if (isObject || isFunction) {
    // 如果构造函数运行结果返回了对象，则返回构造函数运行结果
    return val;
  } else {
    return instance; //如果构造函数运行结果没返回对象，就返回这个新对象
  }
}
