---
title: 最近用paperjs开发web版PS/sketch的心得笔记
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2019-12-18 21:39:46
top:
---


# 一.画板的功能点汇总

{% asset_img ClassName 1.jpg %}

## 1.基本功能
缩放画布，拖拽，色盘，吸管工具，
导出/下载，撤销重做，动画帧
右键菜单，快捷键

## 2.工具栏
选择，添加预置图形，画笔，橡皮，文字，上传图片，中心点

## 3.底部栏
图层调节~上移层，下移层；对称翻转，透明度调节

## 4.某类对象特有的功能
（1）矢量图
描边，编组/解组
（2）位图：裁剪

## 5.后期待做的新功能
主题切换，钢笔工具，调节圆距
位图抠图，矢量图的合并裁剪，
特殊笔刷，自动对齐辅助线等等

# 二.paperjs的注意点

## 1.原生svg对象和paperjs中对象的对应关系
（1）形状标签，比如rect、circle、等
对应paperjs中的shape对象
（2）path，polygon
对应paperjs的path对象或者compoundPath

## 2.画板中对象和paperjs对象的对应关系
矢量图形：Shape、path、compoundPath、
画笔path
橡皮path
文字PointText，
位图raster，

## 3.矩阵、applyMatrix默认值
（1）背景：制作图形的选择框
但是paperjs中的bounds始终是外切矩形，没有旋转角度
需要使用applyMatrix和internalBounds

（2）矩阵变形数据总结
applyMatrix，
所有的图形表现一致，包括单个path元素，单个shape元素，单个raster元素，单个文本元素，group，复合路径
True：
自身~矩阵不变，internalBounds会变；
子元素~矩阵不变，internalBounds会变
False：
自身~矩阵变，internalBounds不变；
子元素~矩阵不变，internalBounds不变；

（3）矩阵变形数据，统一管理的建议
设置applyMatrix为fasle
自身变形数据，统一从matrix取；
子元素变形数据，统一从父元素取；

## 4.交互~hover表现：
paperjs中path对象，有segment点数据，所以可以绘制路径的描边
而shape对象没有segment点数据，所以hover只能是一个外切矩形

## 5.上传文件的预处理
（1）svg文件，path标签，不应该额外加transform等属性，
否则会导致segment点的坐标不对，框选出现异常，比如框选中间空白区域，却选中了它；
（2）svg文件，circle，rect标签，不强行转成path的话，hover就是外部矩形bounds，因为它没有segment去描边；

## 6.hitTest
（1）hit结果是从最高层往下返回的,
（2）group元素hit的结果，子元素从高到底，最后才是group自身；
（3）group的子元素，颜色不一致，hit不到这个group；
类似sketch中编组元素，不能修改成不同的颜色

## 7.Paperjs exportJSON再解析json，会修改元素的id
（1）撤销重做，复制粘贴，都使用了exportJSON
插销重做后元素ID发生变化就会引发很多问题；
（2）解决方案：初始化的时候把id存到data.id中，保证元素“不变”；

## 8.子元素数组中多了很多索引为字符串的数据
（1）new对象时设置name属性导致的，可以把name写到data中
（2）svg文件，不要加id属性，不然也会转成name属性

{% asset_img ClassName 2.png %}

（3）设计提供各种图形svg文件，sketch导出的文件id去不掉，需要手动把id去掉；

## 9.图标icon、cursor的注意点
（1）svg中有两个或者多个互相分离的path，该svg显示会有问题
（2）比如下面的旋转图标，使用一个path，复制两份，旋转调整位置，编一个组；

{% asset_img ClassName 3.png %}

## 10.字体相关
《撸了这么多代码，你真的了解字体吗？》
https://mp.weixin.qq.com/s/NHKSKMNEIjSY5Eo27-CI0Q 

## 11.svg冷门知识点

### 两种填充规则《搞懂SVG/Canvas中nonzero和evenodd填充规则》；
https://www.zhangxinxu.com/wordpress/2018/10/nonzero-evenodd-fill-mode-rule/

### SVG的path的贝塞尔曲线指令
https://www.zhangxinxu.com/wordpress/2014/06/deep-understand-svg-path-bezier-curves-command/

### svg arc 命令
https://mp.weixin.qq.com/s/XUH8anQmW8RsCxPTeue8cQ


同时欢迎关注我的个人微信公众号：
{% img  /img/公众号二维码.jpg 300 300 悬笔e绝 %}