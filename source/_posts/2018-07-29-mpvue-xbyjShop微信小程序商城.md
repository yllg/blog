---
title: mpvue-xbyjShop微信小程序商城
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2018-07-29 12:20:21
top: 
---

# mpvue-xbyjShop
> 基于mpvue的微信小程序商城（小程序端，服务端）


# 小程序端

# 技术栈
> mpvue + mpvue-router-patch + mpvue-entry + vuex + webpack + ES6/7 + flyio + mpvue-wxparse

# 项目运行
```
微信开发中工具选中mpvue-xbyjShop/buyer作为项目目录即可

```

# 功能列表
## 页面
- [x] 首页 -- 完成
- [x] 分类商品 -- 完成
- [x] 商家品牌、品牌详情 -- 完成
- [x] 新品首发 -- 完成
- [x] 人气推荐 -- 完成
- [x] 专题商品、专题详情 -- 完成
- [x] 分类首页 -- 完成
- [x] 搜索页 -- 完成
- [x] 商品详情 -- 完成
- [x] 评论页 -- 完成
- [x] 购物车 -- 完成
- [x] 下单页 -- 完成
- [x] 支付页、支付结果页 -- 完成
- [x] 我的订单、订单详情页 -- 完成
- [ ] 优惠卷
- [x] 我的收藏 -- 完成
- [x] 我的足迹 -- 完成
- [x] 地址管理页 -- 完成
- [ ] 意见反馈
- [ ] 物流查询

## 组件
- [x] 商品筛选组件 -- 综合、价格、分类

## 功能
- [x] 专题评论
- [x] 搜索商品
- [x] 商品收藏
- [x] 加入购物车
- [x] 购物车商品的编辑、删除、批量操作
- [x] 浏览记录
- [x] 收货地址的增、删、改
- [x] 下单支付
.....

# 效果展示

### 首页

{% asset_img ClassName 1.首页.gif 首页 %}

### 商品分类

{% asset_img ClassName 2.商品分类.png 商品分类 %}

### 品牌详情

{% asset_img ClassName 3.品牌详情.png 品牌详情 %}

### 人气推荐

{% asset_img ClassName 4.人气推荐.gif 人气推荐 %}

### 专题

{% asset_img ClassName 5.专题.gif 专题 %}

### 专题详情

{% asset_img ClassName 6.专题详情.gif 专题详情 %}

### 分类首页

{% asset_img ClassName 7.分类首页.png 分类首页 %}

### 搜索

{% asset_img ClassName 8.搜索.gif 搜索 %}

### 商品详情

{% asset_img ClassName 9.商品详情.gif 商品详情 %}

### 购物车

{% asset_img ClassName 10.购物车.gif 购物车 %}

### 确认订单

{% asset_img ClassName 11.确认订单.png 确认订单 %}

### 付款页

{% asset_img ClassName 12.付款页.png 付款页 %}

### 付款结果

{% asset_img ClassName 13.付款结果.png 付款结果 %}

### 个人中心

{% asset_img ClassName 14.个人中心.png 个人中心 %}

### 我的订单

{% asset_img ClassName 15.我的订单.png 我的订单 %}

### 订单详情

{% asset_img ClassName 16.订单详情.png 订单详情 %}

### 优惠卷

{% asset_img ClassName 17.优惠卷.png 优惠卷 %}

### 我的收藏

{% asset_img ClassName 18.我的收藏.png 我的收藏 %}

### 我的足迹

{% asset_img ClassName 19.我的足迹.png 我的足迹 %}

### 地址管理

{% asset_img ClassName 20.地址管理.gif 地址管理 %}

### 意见反馈

{% asset_img ClassName 21.意见反馈.png 意见反馈 %}

### 物流查询

{% asset_img ClassName 22.物流查询.png 物流查询 %}




# 服务端

> 服务端api基于Ｎode.js+ThinkJS+MySQL

## 项目运行
```
创建数据库xbyjshop

导入mpvue-xbyjShop/server目录下的xbyjShop.sql数据

修改两个配置文件，见下面

安装依赖 npm install

启动项目 npm start

```

## 修改数据库配置文件 
server/src/common/config/database.js
```
const mysql = require('think-model-mysql');

module.exports = {
    handle: mysql,
    database: 'xbyjshop',
    prefix: 'xbyjshop_',
    encoding: 'utf8mb4',
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '你的密码',
    dateStrings: true
};
```

## 修改微信登录和微信支付配置文件 
server/src/common/config/config.js
```
// default config
module.exports = {
  default_module: 'api',
  weixin: {
    appid: '', // 小程序 appid
    secret: '', // 小程序密钥
    mch_id: '', // 商户帐号ID
    partner_key: '', // 微信支付密钥
    notify_url: '' // 微信异步通知
  }
};
```


# 上线部署
```
腾讯云ECS CentOS 7.3 64
PM2管理nodejs进程
Nginx反向代理
配置HTTPS（微信小程序接口必须是HTTPS）
```
>  数据接口： https://www.xuanbiyijue.com/api/
>  具体的步骤，之后有空详细补一篇吧；



# 说明

>  如果本项目对您有帮助，可以点下方的GitHub仓库链接， "Star" 支持一下 谢谢~

> `参考的原生微信小程序`  [tumobi/nideshop-mini-program](https://github.com/tumobi/nideshop-mini-program)


# 最后

1、欢迎关注我的公众号，还有个技术交流群(备注自己github账号哦)

{% img  /img/公众号二维码.jpg 250 250 '悬笔e绝'公众号 %}
{% img  /img/技术群.png 250 250 技术交流群 %}

# License
[GPL]

GitHub: [GitHub链接](https://github.com/yllg/mpvue-xbyjShop)
欢迎小伙伴们star 💗❤️💖~~