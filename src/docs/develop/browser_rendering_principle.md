---
title: 浏览器渲染原理
index: false
icon: laptop-code
category:
  - 前端开发
tag:
  - 浏览器渲染
---

## 📚️概述

> 参考资料 
[MDN:渲染页面：浏览器工作原理](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/How_browsers_work))
[RenderingNG 架构](https://developer.chrome.com/docs/chromium/renderingng-architecture?hl=zh-cn#architecture_components)

浏览器的渲染过程是这样的

`解析`  -> `样式计算` -> `布局` -> `分层` -> `绘制` -> `分块` -> `光栅化` -> `画`

中文的意思传达不够明确，还是看英文吧

`parse` -> `style` -> `layout` -> `layer` -> `paint` -> `tiling` -> `raster` -> `draw`

---

其中，`parse` -> `style` -> `layout` -> `paint` 都是在 ==渲染主线程== 中完成的

`tiling` -> `raster` -> `draw`是在 ==合成线程== 中完成的

## 1️⃣parse：解析

> “**解析**”是浏览器将通过网络接收的数据转换为 `DOM` 和 `CSSOM` 的步骤。

> **输入：html文件    输出：DOM和CSSOM**

### 第一步：处理HTML并构造DOM树

DOM树描述了文档的内容，`<HTML>`元素是第一个标签也是文档树的跟阶段，树反应了不同标记之间的关系和层次结构，DOM节点的数量越多，构建DOM树所需的时间就越长。

**DOM树是增量构建的**，HTML响应变为token，token变成节点，而节点再变成DOM树，也就是一遍解析一遍构建DOM树

<img title="" src="https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/How_browsers_work/dom.gif" alt="DOM树示意图" width="600">

### 第二步：构建CSSOM树

CSSOM即 CSS Object Model，CSS对象模型和DOM是类似的，DOM和CSSOM是两棵树，它们是独立的数据结构，浏览器将CSS规则转换为可以理解和使用的样式映射，浏览器遍历CSS中每个规则集，根据CSS选择器创建具有父子兄弟关系的节点树。CSSOM包含了页面所有的样式，也就是如何展示DOM的信息。

构建CSSOM非常快，构建CSSOM的总时间通常小于一次DNS查询所需的时间。

和DOM树的构建不同，**CSSOM的构建有阻塞性，浏览器会阻塞页面渲染直到它接收和执行了所有的CSS。**

### 预加载扫描器

当构建DOM树时占用了渲染主线程，但同时，预加载扫描器也会扫描整个HTML文件，解析可用的内容并请求高优先级的资源。例如：

1. link的外部CSS样式表

2. web字体

3. 内部的style的样式

4. src的外部JavaScript脚本

## 2️⃣style：样式计算

> **输入：DOM树和CSSOM树    输出：渲染树**

在此阶段，会根据DOM树和CSSOM树合成一个渲染树，从DOM树的根开始，遍历每个 ==可见节点== 。

不会被显示的元素，如`<head>` `<body>`以及`display:none`的节点，这些都不会被计算在渲染树中。

**渲染树包含了所有可见节点的内容和计算样式。**

## 3️⃣layout：布局

> 输入：渲染树    输出：fragment树

布局是在渲染树上运行布局以**计算每个节点的 ==几何信息==** ，布局是确定所有节点的尺寸和位置，以及确定页面上每个对象的大小和位置。

==第一次确定每个节点的大小和位置成为布局(layout)，随后对节点的大小和位置的重新计算称为重排/回流(reflow)==

## 4️⃣layer：分层
分层为了加速渲染

`z-index`、`opacity`都会影响到分层结果

我们也可以设置CSS属性`will-change:transform` ,作用是告诉浏览器：这个元素**很快会发生 transform 变化**，请提前为它做一些准备。 浏览器会自行决定这里要不要分层。

**分层确实可以提高性能，但在内存管理方面成本较高，因此不应作为 Web 性能优化策略的过度使用。**

## 5️⃣paint：绘制

> 输入：fragment树    输出：显示列表

绘制过程会计算一个显示列表，用于描述如何从DOM光栅化GPU纹理图块。

---

==绘制完成后，**渲染主线程的任务结束**，主线程将属性树和显示列表复制到compositor线程，或者说叫合成线程==

---

## 6️⃣tiling：分块

合成线程会从线程池申请多个合成器线程，将显示列表拆分为复合层列表，以便于独立进行**光栅化和动画处理**



## 7️⃣raster：光栅化

这一步会调用GPU进行加速光栅化，根据绘制指令和分层的信息生成像素位图，这一步的结果就是tile(画好的图块)

## 8️⃣draw：画

这一步将位图在显示器上画出来，即在屏幕上创建像素。



## reflow和repaint

回流/重排即reflow：指的是元素的几何信息发生了变化，需要重新进行样式计算以及之后的操作，开销比较大。

重绘即repaint：指的是元素的几何信息没有发生变化，而是颜色、透明度、可视情况等发生改变，就会从`paint`阶段重新计算，称之为`repaint`。

## chrome渲染管线
![chrome渲染管线](/img/diagram-the-rendering-pi.jpeg)




