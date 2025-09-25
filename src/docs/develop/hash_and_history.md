---
title: history模式和hash模式的区别
index: false
icon: laptop-code
category:
  - 前端开发
tag:
  - Vue
  - 路由
---


参考视频：[12.history模式和hash模式的区别_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1GB4y1R7r6/?spm_id_from=333.337.search-card.all.click&vd_source=13fed54109c2c82f853f49984033816b)

这两种模式，和任何框架没有关系，都是H5原生支持的

<span data-type="text" style="color: var(--b3-font-color7);">这两种模式都是为了解决在不触发网页重载的情况下切换URL路径。</span>

hahs采用的是纯静态实现，一个URL路径中，只能有一个`#`，所以多个项目合作情况下，就不能使用hash模式

# hash模式
**[MDN:hash](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/hashchange_event)**

hash模式是通过监听hash锚点，通过`window.onhashchange`来对dom进行显示和隐藏的切换来实现的

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>hash模式与history模式</title>
    <style>
        .page{
            width: 300px;
            height: 300px;
            border: 1px solid black;
            text-align: center;
        }
        .index {
            display: none;
            background-color: orange;
        }
        .about {
            display: none;
            background-color: yellowgreen
        }
    </style>
</head>
<body>
    <a href="#/index">访问首页</a>
    <a href="#/about">访问关于页面</a>
    <!-- 定义页面结构 -->
     <div class="page index">我是首页</div>
     <div class="page about">我是关于</div>



<script>
    window.onhashchange = function(e) {

        const newURL = e.newURL.split('#/')[1];
        const oldURL = e.oldURL.split('#/')[1];
        
        // 获取两个页面的DOM对象
        const newPage = document.querySelector('.'+newURL);
        const oldPage = document.querySelector('.'+oldURL);

        // 隐藏旧页面，显示新页面
        oldPage.style.display = 'none';
        newPage.style.display = 'block';

    }

</script>
</body>
</html>
```

# history模式

**[MDN:history](https://developer.mozilla.org/zh-CN/docs/Web/API/History)**

history模式需要服务器的配合，不需要借助锚点技术重写URL路径，history模式使用history对象中的`pushState()`函数来重写url路径，可在不触发重新加载的情况下变更URL路径。

history模式重写URL路径的解决方案与hash模式类似，但是本质不一样，虽然history模式可以重写URL路径，但是重写后的新路径并不包含原有HTML文件的访问地址，所以history模式在重写URL路径后，在没有服务器的支持下，一旦刷新网页就会404。

解决办法就是通过服务器去重定向，将路径重新指向index.html

在vue脚手架工具中，开发服务器解决了这个问题，但是在真实的生产环境中，需要nginx或者apache等服务器进行配置，对请求进行转发。