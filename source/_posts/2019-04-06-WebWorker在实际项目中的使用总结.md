---
title: WebWorker在实际项目中的使用总结
categories:
  - 前端性能优化与工程化 
  - null
tags:
  - null
  - null
date: 2019-04-06 20:05:14
top:
---

# 基本介绍

## 阮一峰老师的这篇教程
[Web Worker 使用教程](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)

## 提出几个重点

### webworker的限制
#### DOM限制
Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用<font color="#FF0000"> document、window、parent </font>这些对象。
但是，Worker 线程可以navigator对象和location对象。
#### 文件限制
Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自<font color="#FF0000"> 网络 </font>。

### 用完及时关闭Worker
使用完毕，记得及时关闭 Worker，否则会占用很多的系统资源

### Worker嵌套
Worker 线程内部还能再新建 Worker 线程（目前只有 Firefox 浏览器支持）

### 同页面的WebWorker <font color="#FF0000"> inline worker </font>
通常情况下，Worker 载入的是一个单独的 JavaScript 脚本文件，但是也可以载入与主线程在同一个网页的代码。
原理：
先将嵌入网页的脚本代码，new Blob 转成一个二进制对象，
然后window.URL.createObjectURL 为这个二进制对象生成 URL，
再让 Worker 加载这个 URL。
这样就做到了，主线程和 Worker 的代码都在同一个网页上面。


# 工程化

## 谷歌实验室为WebWorker封装的高级库 comlink，
[GitHub仓库](https://github.com/GoogleChromeLabs/comlink)
封装了WebWorker原生的API，用起来更加方便
他们还出了一个配套的webpack插件，
[worker-plugin](https://github.com/GoogleChromeLabs/worker-plugin)
### 但是这一套有个 <font color="#FF0000"> 问题 </font>
如果你当前webworker项目是作为web项目使用，没问题；
但是你想把这个包含webworker的项目打包成<font color="#FF0000"> NPM包 </font>，也就是JS Library的话，导入到别的项目使用时，会出现path路径的问题；
而且作者好像也并没有打算解决这个问题，参见下面的issue
[Uncaught SyntaxError: Unexpected token <](https://github.com/GoogleChromeLabs/worker-plugin/issues/18)


## 如何把包含webworker的项目打包成JS库
其实也很简单！
### 第一步，不能直接引用，那就打包成出来
使用[worker-loader](https://github.com/webpack-contrib/worker-loader)把本项目worker的内容打包成一个压缩混淆的js文件
### 第二步，引入这个js文件，new 一个 Worker
主进程的逻辑，可以用用webpack打包成js lib使用
worker进程的逻辑，引入js文件，new 一个 Worker即可



# worker的分类 
## Dedicated Workers 专用的Worker
Dedicated Web Workers 是由主进程实例化并且只能与之进行通信
<font color="#FF0000"> 最常用的worker </font>，上面讲的内容都适用

## shared worker 
Shared workers 可以被运行在同源的所有进程访问
<font color="#FF0000"> 不同的浏览的选项卡 </font>，内联框架及其它shared workers

## service worker
Service Worker 是一个由事件驱动的 worker，它由源和路径组成。
它可以控制它关联的网页，解释且修改导航，资源的请求。
以一种非常细粒度的方式来<font color="#FF0000"> 缓存资源 </font>，让你非常灵活地控制程序在某些情况下的行为（比如网络不可用）。




# 应用案例，最佳使用场景
## 射线追踪
射线追踪是一项通过追踪光线的路径作为像素来生成图片的渲染技术。
Ray tracing 使用 CPU 密集型计算来模仿光线的路径。
思路即模仿一些诸如反射，折射，材料等的效果。
所有的这些计算逻辑可以放在 Web Worker 中以避免阻塞 UI 线程。
甚至更好的方法即－你可以轻易地把把图片的渲染拆分在几个 workers 中进行（即在各自的 CPU 中进行计算，意思是说利用多个 CPU 来进行计算，可以参考下 nodejs 的 api）

## 加密
端到端的加密由于对保护个人和敏感数据日益严格的法律规定而变得越来越流行。
加密有时候会非常地耗时，特别是如果当你需要经常加密很多数据的时候（比如，发往服务器前加密数据）。
这是一个使用 Web Worker 的绝佳场景，因为它并不需要访问 DOM 或者利用其它魔法－它只是纯粹使用算法进行计算而已。
一旦在 worker 进行计算，它对于用户来说是无缝地且不会影响到用户体验。

## 预取数据
为了优化网站或者网络应用及提升数据加载时间，你可以使用 Workers 来提前加载部分数据以备不时之需。
不像其它技术，Web Workers 在这种情况下是最棒哒，因为它不会影响程序的使用体验。

## 渐进式网络应用
即使在网络不稳定的情况下，它们必须快速加载。这意味着数据必须本地存储于浏览器中。这时候 IndexDB 及其它类似的 API 就派上用场了。
大体上说，一个客户端存储是必须的。为了不阻塞 UI 线程的渲染，这项工作必须由 Web Workers 来执行。
当使用 IndexDB的时候，可以不使用 workers 而使用其异步接口，但是之前它也含有同步接口（可能会再次引入 ），这时候就必须在 workers 中使用 IndexDB。

## 拼写检查
一个基本的拼写检测器是这样工作的－程序会读取一个包含拼写正确的单词列表的字典文件。字典会被解析成一个搜索树以加快实际的文本搜索。当检查器检查一个单词的时候，程序会在预构建搜索树中进行检索。
如果在树中没有检索到，则会通过提供替代的字符为用户提供替代的拼写并检测单词是否是有效－是否是用户需要的单词。
这个检索过程中的所有工作都可以交由 Web Worker 来完成，这样用户就只需输入单词和语句而不会阻塞 UI，与此同时 worker 会处理所有的搜索和服务建议。


欢迎关注我的个人微信公众号：
{% img  /img/公众号二维码.jpg 300 300 悬笔e绝 %}