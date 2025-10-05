---
title: await和async
index: false
icon: laptop-code
category:
  - 前端开发
tag:
  - JavaScript
  - 异步编程 
---

## 背景
> async和await于2017年在ES8中引入

async和await是基于Promise API的语法糖，可以用同步的方式去写异步逻辑。

## async
 ==核心观念:== async函数永远只返回一个Promise对象

换言之，你可以直接返回一个Promise对象，也可以返回一个值，你使用了async，返回值会被自动包装为一个Promise对象。


```js
  async function bb(){
        return '专心学习！';
	}
相当于
  async function bb(){
        return Promise.resolve('专心学习！');
	}
```
 
## await
==核心概念:== 
1. await不能单独使用，只能配合async使用（不完全对，继续往下看）
2. await只能基于promise使用
3. 主要的作用就是强制等待某个函数执行后再进行下一步

await操作符的实际作用是等待一个Promise兑现并获取它兑现后的值，它只能在异步函数或者模块顶层中使用。

但是实际上，await可以等待非Promise对象，**所以await实际上等待的是一个表达式。**

例如
```js
const foo = await 20*5;
console.log(foo);
```
如果await后面不是一个Promise对象，而是一个表达式的话，那边这个表达式的值会被包装为Promise对象，并且立即被兑现。