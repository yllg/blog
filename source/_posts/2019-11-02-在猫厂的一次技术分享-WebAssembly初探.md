---
title:  在猫厂的一次技术分享--WebAssembly初探
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2019-11-02 11:46:56
top:
---

# 目录
一.基本介绍  
1.什么是Webassembly
2.wasm前世今生
3.各公司wasm的实践
4.工具链和工程化

二.wasm开发
1.Emscripten快速入门
2.C和JS互相操作
3.Emscripten的运行时

三.wasm在猫厂应用
1.基于Squoosh的图片压缩
2.视频积木微信端兼容

四.总结

# 基本介绍
## 1.什么是Webassembly
wasm是基于堆栈的虚拟机的二进制指令格式。
被设计为一个可移植的目标，用于编译C / C ++ / Rust等高级语言，支持在Web上部署客户端和服务器应用程序。

## 2.wasm前世今生
1995年Javascript诞生前端网页时代

2008年V8诞生 即时编译JIT前端APP时代
{% asset_img ClassName 1.jpg  %}

两个问题

1.性能
移动设备、视频、游戏

js部分执行链路（V8）
{% asset_img ClassName 2.jpg  %}

ECMA规定的“+”执行流程
{% asset_img ClassName 3.jpg  %}

2.单一语言
Coffeescript、react的jsx、vue的模板、Typescript...
都是对JS的高级（high-level）描述形式，最终都是以它作为“编译目标”，并没有从根本上解决语言的性能问题


曾经的尝试

ActiveX，NPAPI
NaCI
PNACL
	优点
	提供沙盒环境在浏览器器中执⾏行行的 C/C++ 代码;	充分利利⽤用 CPU 的特性，如 SIMD、多核⼼心处理理等;	平台独⽴立，⼀一次编译到处运⾏行行;
	
  缺点：	需要重写，且成本非常高；等等

{% asset_img ClassName 4.jpg  %}


2013 ASM.js
是一种 JavaScript 严格⼦子集;
通过 Annotation 的⽅方式标注了了变量量的类型;
利利于编译器器的优化;

``` bash
function plusOne (x) { 
     x = x|0; // x : int
     return (x + 1)|0; 
}
```

2015 WebAssembly

1.一种新的抽象虚拟机(W3C)标准;

2.四大浏览器器已支持该标准 MVP 版本的所有特性;
MVP~最简化可实行版本 两个重点高性能计算，代码库复用

3.一种以 .wasm 为后缀的二进制格式 (0x6d736100);

4.可以通过标准 Web API 接口在浏览器器中加载、解析和运行;

{% asset_img ClassName 5.jpg  %}

{% asset_img ClassName 6.jpg  %}

Wasm 虚拟机 - WASI 

开发人员开始将 WebAssembly 向浏览器之外推进，因为它提供了一种快速、可扩展、安全的方式来在所有计算机上运行相同的代码。

WebAssembly 是概念机的汇编语言，而不是物理机的汇编语言。 这就是它可以在各种不同计算机体系结构上运行的原因。

因此需要一个概念操作系统的系统接口，这就是 WASI——WebAssembly 平台的系统接口。

{% asset_img ClassName 7.jpg  %}


## 3.各公司WASM的实践
（1）音视频处理
视频/直播的编解码

B站
弹幕不挡人
新出的“在线视频编辑器”，powered by clipchamp

视频给人像加特效，比如带个帽子，加个胡子

视频监控，网课老师姿势仪态超出范围实时给出提示

腾讯微视，短视频的视频流和音频流校准

淘宝，兼容H.265视频格式
《Web端H.265播放器研发解密》https://fed.taobao.org/blog/2019/03/19/web-player-h265/
字节跳动互娱前端的负责人，硬核方法兼容H.265格式
《修改Chromium源码实现HEVC/H.265 4K视频播放》https://segmentfault.com/a/1190000020711813?from=timeline

kitten的视频积木

{% asset_img ClassName 8.jpg  %}

（2）图片处理：谷歌的Squoosh，kitten的图片压缩
（3）高性能web游戏：
Unity、Unreal、Bullet编译成ammo.js
egret白鹭引擎，游戏性能提升300%
（4）前端代码加密
《前端核心代码保护技术面面观》https://zhuanlan.zhihu.com/p/61651310
（5）WebApp: DOM diff 计算，eBay的web 条形码扫描器
（6）node：除了IO密集型的任务外，可以干CPU密集型的任务
（7）webGL：
谷歌地球；
模型文件压缩，谷歌的Draco，大大减小gltf/glb文件大小
（8）基于边缘计算的机器/深度学习： MXNet.js
（9）区块链Ethereum核心
（10）前端框架：Sharpen、asm-dom、yew
（11）IOT：wasmachine
（12）其他：微信小程序支持webp的wasm方案，
等等等...

{% asset_img ClassName 9.jpg  %}

{% asset_img ClassName 10.jpg  %}

## 4.工具链和工程化

4-1 EmscriptenAn 
LLVM-to-JavaScript Compiler
把c/c++、rust等代码编译成wasm

{% asset_img ClassName 11.jpg  %}


{% blockquote %}
“如果 WebAssembly 不出现，则 HTML，CSS，JavaScript 必将成为前端界的事实汇编语言：人们不断创造更多的（他们认为更好的）对这三者的高级（high-level）描述形式，react的jsx，vue的模板，typescript等等，并最后以这三者作为“编译目标”。WebAssembly 的出现则提供了一个更好的选择：接近原生的运算效率，开源、兼容性好、平台覆盖广的标准，以及可以借此机会抛弃 JavaScript 的历史遗留问题。何乐而不为呢？”
{% endblockquote %}

4-2 工程化
（1）越来越多的语言支持编译成wasm
比如AssemblyScript，把ts编译成wasm 等等
{% asset_img ClassName 12.jpg  %}

（2）Rust工程化 目前最好
Rust和wasm都是Mozilla发起的
webpack接受了Mozilla赞助，在加快支持wasm的开发rust-wasm-loader，像普通模块一样使用

{% asset_img ClassName 13.jpg  %}

# 二.wasm开发

## 1.Emscripten快速入门

### 1.1 安装emscripten
安装命令
https://emscripten.org/docs/getting_started/downloads.html

(1)Python 环境，2.7.12之上，但不能是python3
(2)更新SDK 失败，certificate verify failed 证书验证失败
https://github.com/emscripten-core/emscripten/issues/6723

### 1.2 Hello World

{% asset_img ClassName 14.jpg  %}

{% asset_img ClassName 15.jpg  %}

### 1.3 JS Glue 胶水代码初探

1.3.1 初始化webassembly汇编模块(.wasm文件)

{% asset_img ClassName 16.jpg  %}

流式模式，需要设置文件的mimeType 是 `application/wasm`

receiveInstantiatedSource调用了receiveInstance

{% asset_img ClassName 17.jpg  %}

将wasm模块实例的导出对象传给了Module的子对象asm
Module['asm'] 提供给外部调用的最主要入口

1.3.2 导出函数封装

C函数导出时，函数名前会添加下划线“_”
提供了main()以及malloc()函数的封装；而var _main以及Module._main对应的，都是hello_world.c中的main()函数。

{% asset_img ClassName 18.jpg  %}

1.3.3异步加载

在Module初始化前，向Module中注入一个名为onRuntimeInitialized的方法，Emscripten的Runtime就绪后，将会回调该方法。

封装一个promise作为初始化的方法

{% asset_img ClassName 19.jpg  %}

### 1.4编译目标及编译流程
ASM.js和WebAssembly
（1）新版 默认是wasm
需要编译 asm.js，增加参数 -s WASM=0
（2）最主要的区别，同步和异步
Asm.js模块 同步加载；
webassembly模块 异步加载；
asm.js 体积大，执行速度较慢，但是兼容性更好，fallback方案
Wasm 体积小，执行速度快，兼容性稍微差些

## 2.C与JS互相操作
### 2.1 JS调用C函数
Module对象已封装C环境导出的函数，封装方法名 下划线_加上C环境的函数名;
Module.onRuntimeInitialized = （）=> { _C函数名 }

### 2.2 C环境调用JS方法
介绍第三种方法

{% asset_img ClassName 20.jpg  %}

2.2.1 C函数声明
{% asset_img ClassName 21.jpg  %}

2.2.2 JS实现C函数
{% asset_img ClassName 22.jpg  %}
LibraryManager.library可以简单的理解为JavaScript注入C环境的库

执行下列命令
 emcc capi_js.cc --js-library pkg.js -o capi_js.js

--js-library pkg.js意为将pkg.js作为附加库参与链接
得到capi_js.js以及capi_js.wasm

{% asset_img ClassName 23.jpg  %}

### 2.3单向透明的内存模型

2.3.1 Module.buffer
C/C++代码能直接通过地址访问的数据 全部在内存中（包括运行时堆、运行时栈），即Emscripten提供的ArrayBuffer对象：Module.buffer。
C/C++代码能直接访问的数据事实上被限制在Module.buffer内部，JavaScript环境中的其他对象无法被C/C++直接访问——因此我们称其为单向透明的内存模型。

2.3.2 Module.HEAPX
ArrayBuffer
JavaScript中用于保存二进制数据的一维数组;无法直接访问，必须通过某种类型的TypedArray方可对其进行读写;

ArrayBuffer:实际存储数据的容器，
TypedArray:把该容器当作某种类型的数组来使用

Emscripten 为 Module.buffer创建了常用类型的TypeArray

{% asset_img ClassName 24.jpg  %}

### 2.4 JS和C交换数据

从语言角度来说，JavaScript与C/C++有完全不同的数据体系，
Number是二者唯一的交集，因此本质上二者相互调用时，都是在交换Number

2.4.1通过参数和返回值直接传递
见2.1和2.2节的例子

2.4.2 通过内存间接传递

图片压缩，第一种方式传递图片数据
视频积木，第二种方式传递视频数据

### 2.5 EM_ASM系列宏
很多编译器支持在C/C++代码直接嵌入汇编代码，Emscripten采用类似的方式，提供了一组以“EM_ASM”为前缀的宏，用于以内联的方式在C/C++代码中直接嵌入JavaScript代码。

{% asset_img ClassName 25.jpg  %}

EM_ASM
EM_ASM_/EM_ASM_DOUBLE
EM_ASM_INT_V/EM_ASM_DOUBLE_V

### 2.6 `emscripten_run_script`系列函数

2.5介绍的EM_ASM系列宏只能接受硬编码常量字符串，而emscripten_run_script系列函数可以接受动态输入的字符串，类比于JavaScript中的eval()方法。

{% asset_img ClassName 26.jpg  %}

emscripten_run_script()
emscripten_run_script_int()
emscripten_run_script_string()

{% blockquote %}
Tips:从胶水代码中我们可以发现，JavaScript与C相互调用时的执行代价很高。虽然WebAssembly拥有接近于本地代码的执行性能，但倘若函数接口设计不合理、跨语言调用频率过高，整体运行效率会受到极大的拖累。
{% endblockquote %}

## 3.Emscripten的运行时

### 3.1 main函数与生命周期

C/C++和emscripten的 区别
C程序随main()函数返回的返回而退出
对Emscripten来说，main()函数既不必须，运行时生命周期亦不由其控制

希望在mian结束后注销Emscripten的运行时
编译时加上一个配置  -s NO_EXIT_RUNTIME=0

### 3.2文件系统
跨平台的C/C++程序常使用fopen()/fread()/fwrite()等libc/libcxx提供的同步文件访问函数
运行在浏览器中的JavaScript程序无法访问本地文件系统
在JavaScript中，无论AJAX还是fetch()，都是异步操作

Emscripten提供了一套虚拟文件系统，以兼容libc/libcxx的同步文件访问函数

MEMFS，内存文件系统
NODEFS，nodejs文件系统，只用于nodejs环境
IDBFS，indexedDB文件系统，只能用于浏览器环境

3.2.1 MEMFS/打包文件系统

两种打包模式
Embed ，文件数据转成js代码
Preload，一个胶水代码，一个.data文件
类似asm和wasm的关系，embe文件体积更大，建议使用preload

虽然下载文件包是异步的，但是Emscripten可以确保当运行时准备就绪时，文件系统已经初始化完成。因此在Module.onRuntimeInitialized回调函数中使用文件系统是安全的

### 3.3内存管理

3.3.1自定义 内存容量/栈容量

TOTAL_MEMORY参数控制内存容量，64M
emcc mem.cc -s TOTAL_MEMORY=67108864 -o mem.js

TOTAL_STACK参数控制栈容量，3M
emcc mem.cc -s TOTAL_STACK=3145728 -o mem.js

3.3.2可变内存
编译时增加配置
   -s ALLOW_MEMORY_GROWTH=1
当编译目标为asm.js时，可变内存模式会影响性能，不推荐
当编译目标为wasm时，使用可变内存模式非常高效，不会影响运行性能，推荐

ffmpeg解析超大gif碰到问题，用可变内存解决了

### 3.4 Module定制

3.4.1 Module对象提供的
Module.onRuntimeInitialized
Module.TOTAL_MEMORY
Module.print
Module.arguments
Module.onAbort 等等

Emscripten官方文档
https://kripken.github.io/emscripten-site/docs/api_reference/module.html


3.4.2 插入自定义代码

在Emscripten生成的.js胶水代码的前后分别插入一些自定义代码
（比如在其前部插入C/C++代码将要调用的JavaScript方法、设置Module自定义参数等），此时可以使用两个特殊的编译参数：--pre-js <file>与--post-js <file>

{% asset_img ClassName 27.jpg  %}

emcc hello.cc --pre-js pre.js --post-js post.js -o pre_hello_post.js

生成pre_hello_post.js部分内容截取如下：
pre.js中内容 + hello.cc编译后的胶水js的内容 + post.js中内容

{% asset_img ClassName 28.jpg  %}

输出结果
post.js
pre.js: 你好，世界！

wasm模块是异步加载，所以先输出post.js

自定义prejs postjs的实际使用
（1）把wasm的处理过程放到WebWorker
（2）解决asm编译成wasm出现异步问题，增加一个自定义的回调方法 Module["returnCallback"]

{% asset_img ClassName 29.jpg  %}

# 三. wasm在猫厂的应用

图片压缩

视频积木

## 1.视频积木兼容微信内置浏览器

背景
微信内置的QQ浏览器，禁止把video写进canvas
video标签原生事件都触发不了
canplay、canplaythrough、loadeddata、loadedmetadata、loadstart 等等

截图动画精灵 + 声音

{% asset_img ClassName 30.jpg  %}

## ffmpeg
C语言 处理多媒体的命令行工具
常用功能
	视频转图片，图片转视频
	视频拿声音
	视频转gif，gif转视频
	视频，格式转换，码率控制，尺寸控制
	视频剪辑，拼接，添加水印+去水印；
	压缩视频
	压缩mp3
	压缩gif ....
配置项
decoder解码,encoder编码,demuxer分流器,muxer多工器,filter过滤器 ...

videoconverter.js

6年前的库，把ffmpeg编译成asm.js
ffmpeg-worker-webm.js  18.5M 可获取帧截图
ffmpeg-worker-mp4.js 12.7M 获取音频

自定义编译
H.264编解码、帧截图、获取音频流、GIF解码的最小版本

编译报错
submodule
libvpx、opus、libass、fribidi、
lame、x264、freetype2、ffmpeg
各种库升级、废弃
emscripten配置
emconfigure， ./emake
makefile 中用emcc替换gcc

asm.js到wasm的异步问题
配置webWorker
--pre-js <file>与--post-js <file>

最初两个asmjs文件 18.5M + 12.7M = 31.2M
现在一个wasm文件 6.8M
GZIP，Apache，阿里云暂时不支持

设想
Enable-all，打开所有的decoder、encoder、demuxer、muxer，
ffmpeg的功能全部放开，编译成wasm，
再用react / vue写个页面，就是web版本的格式工厂！

Tips
{% blockquote %}
webWorker
Wasm+webworker，算是一个标配
注意，wasm配合webWorker必须是本项目使用；通过webpack把wasm项目打包成js lib，worker需要inline，wasm在inline worker中new blob parse会报错

缓存wasm文件
indexDB，实验性方案，将要废弃
serviceWroker缓存，使用workbox，宇翔上次分享

保证可用性
使用asmjs作为fallback
Chrome 49、55都支持asmjs
{% endblockquote %}


# Future WebAssembly
 Tail Call Optimization;
 Custom Annotation Syntax in the Text Format;
 Garbage collection;
 Exception handling;
 JavaScript BigInt to WebAssembly i64 integration
Web API/DOM
多线程
ES6 Module
sourceMap
SIMD
...

《深入浅出wasm》 于航
《C/C++ 面向webassembly编程  --Emscripten工程实践》

{% blockquote %}
找到性能瓶颈，选择性使用
做好降级方案，保证可用性
{% endblockquote %}

！！持续加码，未来可期！！


GitHub: [GitHub链接](https://github.com/yllg/wasm-ffmpeg)
欢迎小伙伴们star 💗❤️💖~~

同时欢迎关注我的个人微信公众号：
{% img  /img/公众号二维码.jpg 300 300 悬笔e绝 %}