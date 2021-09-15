---
title: vue复杂SPA项目迁移到uniapp的采坑记录
categories:
  - MV框架
  - null
tags:
  - null
  - null
date: 2020-11-1 12:03:01
top:
---


# 一.uniapp介绍
1.uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/QQ/钉钉/淘宝）、快应用等多个平台。
2.提供了可视化工具；cli命令行工具；

# 二.开发规范
{% asset_img ClassName 1.png %}

# 三.目录结构
{% asset_img ClassName 2.png %}


# 四.多端兼容
Uni UI提供了一些列基础的组件，去适配各个端;
比如：
（1）toast提示，uni.showToast
提供很多配置项，只是各个平台是否生效；
图标、遮罩、延迟时间等
（2）storage缓存，uni.setStorage
uni-app的Storage在不同端的实现不同：
{% blockquote %}
* H5端为localStorage，浏览器限制5M大小，是缓存概念，可能会被清理
* App端为原生的plus.storage，无大小限制，不是缓存，是持久化的
* 各个小程序端为其自带的storage api，数据存储生命周期跟小程序本身一致，即除用户主动删除或超过一定时间被自动清理，否则数据都一直可用。
* 微信小程序单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。
* 支付宝小程序单条数据转换成字符串后，字符串长度最大200*1024。同一个支付宝用户，同一个小程序缓存总上限为10MB。
* 百度、字节跳动小程序文档未说明大小限制
{% endblockquote %}

# 五.条件编译
Uni UI不满足时，可以用条件编译；
```
js和css中 使用 /* 注释 */
vue模板中 使用 <!-- 注释 -->
```
{% asset_img ClassName 3.png %}


# 六.编译和打包
## 1.命令行有一套命令；
[见官网](https://uniapp.dcloud.io/)

## 2.IDE提供了工具
### （1）小程序
微信小程序、支付宝小程序
1）Manifest.json配置，直接唤起开发者工具
2）工具栏的“运行>运行到小程序模拟器”默认有热更新；
“发行>小程序-微信”，开发者工具上传代码即可

### （2）H5
“发行>网站-H5手机版”
（1）配置H5项目的模板文件
根目录下配置 template.h5.html文件
官网说明： https://uniapp.dcloud.io/collocation/manifest?id=mp-weixin

## 3.打包后的目录
Unpackage/dist下面的build和dev
{% asset_img ClassName 4.png %}


# 七.常见问题
## 1.vue组件引用的问题
（1）报错：TypeError: Cannot read property 'replace' of undefined
（2）issue
https://github.com/dcloudio/uni-app/issues/2128
{% asset_img ClassName 5.png %}

## 2.各种各样报错
### （1）小程序环境的各种API限制
dom、window 、事件监听、web sotrage、navigator userAgent等都不能使用

### （2）如果报错的关键词在项目代码中可以搜索到，查下原因很好解决
#### 1）window
使用globalData~简单的全局变量，而且是全端通用；
https://uniapp.dcloud.io/collocation/App?id=globaldata

#### 2）window监听resize事件
组件所在页面的生命周期，可以监听到组件所在页面的尺寸发生变化；
https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/lifetimes.html#%E7%BB%84%E4%BB%B6%E6%89%80%E5%9C%A8%E9%A1%B5%E9%9D%A2%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F

#### 3）获取元素属性
window.getComputedStyle或者getBoundingClientRect
使用createselectorquery，微信和uni都有
https://uniapp.dcloud.io/api/ui/nodes-info?id=createselectorquery

#### 4）document.cookie
Cookie和localStorage，使用uni的storage
#### 5）window.location.href
#### 6）CSS 背景图片问题
不能使用本地图片，可使用base64或者上传CDN
等等

### （3）如果报错搜不到，报错点进去看，第三方库报错
第三方ui框架、js工具库。
比如vant，element-ui，iview等都不能用；

## 3.UI库更换
### （1）建议
建议开发者使用标准的uni-app组件，即vue标准组件。而不是小程序自定义组件。
因为从性能、多端兼容、语法一致性等各方面，vue组件都更有优势，详见https://ask.dcloud.net.cn/article/35489。
### （2）去uni-app的插件市场寻找替代品。
### （3）vant使用了userAgent，小程序不能使用
虽然vant ui提供了h5版和微信小程序版，还是建议用uni UI组件；

## 4.uni UI引入
比如引入它的 popup组件，官网文档写的引入方式有问题
看这一篇http://laker.me/blog/2020/03/03/20_0303_vuejs/
安装npm包来引入；

## 5.static目录下，js文件不会被编译，所以es6语法可能会报错
{% asset_img ClassName 6.png %}

## 6.css问题
### （1）Main.js中引入css，会被错误的编译到mian.js中
把css写到App.vue的style中即可；
@import url(‘swiper/dist/css/swiper.min.css');
### （2）小程序中自定义组件
不能使用id选择器（#a）、属性选择器（[a]）和标签名选择器，请改用class选择器
https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html

## 7.工程目录结构和打包
### （1）App.vue同名
uniapp根目录有App.vue文件，用来全局配置的
如果自己的项目入口文件也是App.vue，需要放到pages目录下作为入口页面；
两个文件不能搞混淆；
### （2）分清page和组件
单页应用只有一个page，其他都是组件component；

## 8.打包体积的优化
（1）单页应用不好分包，资源压缩
（2）png、jpg、svg
压缩；或者使用cdn；
（3）vendor.js，可以压缩，IDE可以配置
勾选 “运行-->运行到小程序模拟器-->运行时是否压缩代码”

## 9.vue在非H5端不支持功能一览
https://uniapp.dcloud.io/use?id=vue-%e7%bb%84%e4%bb%b6
（1）transition就不支持；
微信没影响，支付宝会报错；
等等；

## 10．编译其他小程序的问题
### 10-1.支付宝
#### （1）支付宝小程序可以获取navigator
判断支付宝客户端、支付宝小程序环境
https://developer.aliyun.com/ask/140200
#### （2）axios报错“adapter is not a function”
https://ask.dcloud.net.cn/article/36728
需要修改axios代码，或者用别人写好的axios库

#### （3）transition元素不存在
1）vue的过度组件，给元素添加过度效果
https://cn.vuejs.org/v2/guide/transitions.html
2）查了下name属性，并没有在css中使用，直接替换为div或者view就好；
3）如果有使用的话，uniapp建议用css动画或者uni提供的animation来代替；
https://uniapp.dcloud.io/api/ui/animation

#### （4）组件隐藏没生效，
Location-page、share-page
v-show在支付包小程序中不支持，换成v-if就好；
等等

### 10-2.其他小程序，百度、QQ
之后继续再来完善......



同时欢迎关注我的个人微信公众号：
{% img https://www.xuanbiyijue.com//img/%E5%85%AC%E4%BC%97%E5%8F%B7%E4%BA%8C%E7%BB%B4%E7%A0%81.jpg 300 300 %}