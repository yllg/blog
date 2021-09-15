---
title: 目前最喜欢的个人项目-跨平台音乐播放器xbyjMusic
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2018-06-29 22:19:36
top: 
---

# xbyjMusic

{% asset_img ClassName 0.png  %}

> 跨平台 NeteaseMusic 桌面应用



# 前言

最近在学electron，想想平时用的桌面应用，除了编辑器和IDE等办公应用之外，就属"网易云音乐"了

> 夏日的夜晚，听着喜欢的音乐，沉浸在自己的世界里Coding

__注：此项目纯属个人瞎搞，正常的付费音乐等服务请选网易云音乐官方客户端。__



# 技术栈

> electron + react + mobx + react-router + jss + webpack + express + ES6/7 + axios + flex + canvas



# 项目运行

### 注意：由于涉及大量的 ES6/7 等新属性，node 需要 6.0 以上版本

```
git clone https://github.com/yllg/xbyjMusic.git  
cd xbyjMusic
git submodule init
git submodule update
npm install
npm run dev

```


# 目标功能
## 页面
- [x] 首页 -- 完成
- [x] 登陆 -- 完成
- [x] 每日推荐 -- 完成
- [x] 私人FM -- 完成
- [x] 歌曲页 -- 完成
- [x] 歌单页 -- 完成
- [x] 歌手页 -- 完成
- [x] 用户页 -- 完成
- [x] 排行榜 -- 完成
- [x] 歌单主页 -- 完成
- [x] 偏好设置页/首选项 -- 完成
- [ ] MV/视频页
- [ ] 朋友页
- [ ] 我的歌手/我的收藏
- [ ] 主播电台
- [ ] 最新音乐

## 组件
- [x] header组件 -- 完成
- [x] 左菜单组件 -- 完成
- [x] 播放条组件 -- 完成
- [x] audio组件 -- 完成
- [x] 播放列表组件 -- 完成
- [x] 歌词组件 -- 完成
- [ ] 评论组件 -- 只完成分类显示
- [x] 搜索组件 -- 完成
- [ ] 首页轮播 -- 接口参数不明，拿不到最新数据哦
- [x] 同步轮播组件 -- 关于我
- [x] 提示组件 -- 完成

## 功能
- [x] 喜欢 -- 完成
- [x] 不喜欢 -- 完成
- [x] 收藏歌单 -- 完成
- [ ] 收藏歌曲
- [x] 收藏歌手 -- 完成
- [ ] 评论
- [x] 评论点赞 -- 完成
- [ ] 下载歌曲
.....

# 效果演示
（LICEcap录制渐变色有点失真，动图将就看下哈~）

### 首页

{% asset_img ClassName 1.gif 首页 %}

### 每日推荐

{% asset_img ClassName 2.png 每日推荐 %}

### 私人FM

{% asset_img ClassName 3.png 私人FM %}

### 歌曲页

{% asset_img ClassName 4.gif 歌曲页 %}

### 歌单页

{% asset_img ClassName 5.gif 歌单页 %}

### 歌手页

{% asset_img ClassName 6.gif 歌手页 %}

### 用户页

{% asset_img ClassName 7.png 用户页 %}

### 加载页

{% asset_img ClassName 8.png 加载页 %}

### 排行榜

{% asset_img ClassName 9.png 排行榜 %}

### 歌单主页

{% asset_img ClassName 10.png 歌单主页 %}

### 搜索页

{% asset_img ClassName 11.png 搜索页 %}

### 偏好设置

{% asset_img ClassName 12.png 偏好设置 %}




# 说明

>  如果本项目对您有帮助，可以点下方的GitHub仓库链接， "Star" 支持一下 谢谢~

>  或者您可以 "fork" 一下，和我一起完善剩下的功能

>  `数据接口` 由 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 提供。

> `项目参考`  [trazyn/ieaseMusic](https://github.com/trazyn/ieaseMusic)



# 最后

1、欢迎关注我的公众号，还有个技术交流群(备注自己github账号哦)

{% img  /img/公众号二维码.jpg 250 250 '悬笔e绝'公众号 %}
{% img  /img/技术群.png 250 250 技术交流群 %}


# License
[GPL]


GitHub: [GitHub链接](https://github.com/yllg/xbyjMusic)
欢迎小伙伴们star 💗❤️💖~~
