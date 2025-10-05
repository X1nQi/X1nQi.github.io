---
title: 闭包
index: false
icon: laptop-code
category:
  - 前端开发
tag:
  - JavaScript
  - 闭包
---


对于JS来说

一言以蔽之:==在一个函数的环境中，闭包 = 函数 + 词法环境==

如果你写过React的话，就见过闭包很多次了

要谈论闭包，就逃不了内存泄露这个话题，下来来谈论下⬇️

## 第一种情况

```js
function m(){
	let a = 'tom'

	function RA(){
		return a;
	}

	return RA;
}

```

我们在m这个函数中返回RA这个函数，此时在RA的词法环境中，存在变量a，只要RA不销毁。a就不会销毁。

这种情况下内存泄漏的判断是主观的，这个RA有用就不是内存泄漏，没用了，就是内存泄漏。

## 第二种情况

```js
function m(){
	let a = 'tom'
	let big = '超大的变量'

	function RA(){
		return a;
	}

	function RBIG(){
		return big;
	}

	return RA;
}

```

我们在m中，我们创建了两个闭包，但是我们只返回了RA或者两个都返回了，RA和RBIG的词法环境中存在着a和big

如果我们的RA还有用，但是RBIG中引用到了big，big是一个超大的变量，但是在词法环境中，RBIG还不能被销毁，这个闭包中就始终存在着big这个变量，但是这个变量又没有用了，这是真正的内存泄漏