---
title: WebAssembly入门
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2019-05-05 21:34:21
top:
---

# 一.基本介绍
## 1.什么是WebAssembly(wasm)
（1）wasm是基于堆栈的虚拟机的二进制指令格式。
Wasm被设计为一个可移植的目标，用于编译C / C ++ / Rust等高级语言，支持在Web上部署客户端和服务器应用程序。
（2）wasm的速度平均比js要快10倍左右
## 2.发展历史
（1）ActiveX， NPAPI
（2）NaCI
（3）2013年 asmjs
（4）2015 wasm
{% asset_img ClassName 1.jpg %}

## 3.用途和发展前景
（1）多媒体，音视频的处理
举几个例子
B站弹幕不挡住视频中人物的实现，可以从视频流的每一帧把人像抠出来；QQ等视频聊天，动态的给人物加上胡子帽子特效；
视频监控，视频中的人物超出某个范围，给出警告；
笔者目前做的功能，自定义帧率、清晰度、尺寸，对视频流进行截图，获取视频流的音频等；
（2）JS实现不了的功能，借助wasm调用其他语言来实现
利用C语言的图片库，在浏览器高效压缩图片；
unity等大型游戏，可以放到浏览器跑；
（3）重CPU型程序，加密，编解码
前端代码加密，用wasm是一个目前来说相对最优的方案
推荐两个相关资料
美国西北大学18年的一篇硕士论文《基于wasm的JS代码虚拟化保护方法研究与实现》
“前端外刊评论”知乎专栏有一篇《前端核心代码保护技术面面观》
（4）web app方面：
提高virtual DOM diff的计算速度；
提高canvas，webGL的性能
（5）提高nodejs性能
（6）发展前景，摘自知乎的一个评价
如果 WebAssembly 不出现，则 HTML，CSS，JavaScript 必将成为前端界的事实汇编语言：人们不断创造更多的（他们认为更好的）对这三者的高级（high-level）描述形式，比如react的jsx，vue的模板语法，typescript等等，并最后以这三者作为“编译目标”。
WebAssembly 的出现则提供了一个更好的选择：接近原生的运算效率，开源、兼容性好、平台覆盖广的标准，以及可以借此机会抛弃 JavaScript 的历史遗留问题。何乐而不为呢？
## 4.工具链
（1）emscripten
把c/c++或者rust代码编译成wasm
（2）rust和wasm都是Mozilla提出来，所以支持的很好
因为webpack接受了Mozilla的赞助，所以也在加快wasm的相关工具开发，loader plugin，让wasm模块像普通模块那样使用，目前webpack对rust的wasm支持已经很好了；可以看这篇介绍
《你的js速度还可以快一倍以上》
https://juju.one/speedy-rustwasm/
（3）当然还有把其他语言编译成wasm的工具
比如最近很火的项目，把typescript编译成wasm的assemblyscript
https://github.com/AssemblyScript/assemblyscript
注意：
emscripten编译wasm的limitation限制
并不是所有的功能都能编译成wasm，百分之八九十都可以，有些例外，比如文件的IO操作等；

# 二.入门
推荐一本开源的电子书
《C/C++ 面向webassembly编程  --Emscripten工程实践》
https://3dgen.cn/cppwasm-book/zh/
{% asset_img ClassName 2.png %}

## 1. Emscripten快速入门
### 1.1 安装emscripten
按照官网的步骤就好，有两个坑注意下
（）./emsdk activate latest
更新组件特别慢，开了vpn也没用（网上一搜很多人碰到这个问题）
解决方案，使用别的方法下载，放到指定目录，可能需要修改文件名
（）必须要Python 2.7.12之上，又不能是python3
### 1.2 hello-world
（1）新建一个名为hello.cc的C源文件，为了正确标识中文字符串，将其保存为UTF8编码：
``` bash
//hello.cc
#include <stdio.h>

int main() {
    printf("你好，世界！\n");
    return 0;
}
```
（2）进入控制台，使用1.1节中介绍的emsdk_env命令设置Emscripten环境变量后，切换至hello.cc所在的目录，执行以下命令：
```bash
emcc hello.cc -o hello.js
```
编译后的成果文件分别为hello.wasm以及hello.js
（3）在刚才的目录下，新建一个名为test.html的网页文件，引入hello.js文件，即可看到控制台输出了 “你好，世界”

### 1.3 胶水代码初探
（1）wasm模块初始化
WebAssembly.instantiateStreaming()
WebAssembly.instantiate()
第一种流式创建失败，则用第二种
（2）第一种初始化方法
是加载wasm代码一种非常有效的优化方式
但要注意fetch到wasm文件的MIME type要是application/wasm才行，不然就会初始化失败。
具体MIME type可以到koa中配置，或者到后端的Apache服务器配置
（3）顺便吐槽下对wasm的gzip压缩
官网提供了apache服务器配置说明；但是阿里云和七牛云的gzip暂时都不支持application/wasm文件类型；
（4）初始化之后的返回值交给receiveInstantiatedSource()函数
这个函数又调用了receiveInstance函数
```bash
function receiveInstance(instance, module) {
      exports = instance.exports;
      if (exports.memory) mergeMemory(exports.memory);
      Module['asm'] = exports;
      Module["usingWasm"] = true;
      removeRunDependency('wasm-instantiate');
    }
```
这个函数里面将wasm模块实例的导出对象传给了Module的子对象asm
Module['asm']中保存了WebAssembly实例的导出对象——而导出函数恰是WebAssembly实例供外部调用最主要的入口；

### 1.4 编译目标和编译流程
asm.js和WebAssebly
（1）模块加载上最主要的区别，同步和异步
Asm.js模块是同步加载；
webassembly模块是异步加载；
所以asm.js能用，编译成wasm如果报错，可能就是异步导致的，需要自定义Module方法来处理，下面会讲；
（2）现在 Emscripten默认的编译目标就是wasm
需要编译为asm.js，增加参数 -s WASM=0
（3）二者其他的区别
asmjs: 兼容性好; 体积大，性能不好，速度慢;
wasm: 是asmjs的升级版，体积小，性能好，速度快；但是兼容性差些；

## 2 C与JS互相操作
### 2.1 JS调用C函数
Module对象已封装C环境导出的函数，封装方法的名字是下划线_加上C环境的函数名;
Module.onRuntimeInitialized = （）=> { _C函数名 }
### 2.2 C环境调用JS方法
{% asset_img ClassName 3.jpg %}
介绍第三种 JS函数注入
C文件capi_js.cc中进行函数声明，
```bash
//capi_js.cc
EM_PORT_API(int) js_add(int a, int b);
EM_PORT_API(void) js_console_log_int(int param);

EM_PORT_API(void) print_the_answer() {
    int i = js_add(21, 21);
    js_console_log_int(i);
}
```
pkg.js中实现C函数
```bash
//pkg.js
mergeInto(LibraryManager.library, {
    js_add: function (a, b) {
        console.log("js_add");
        return a + b;
    },

    js_console_log_int: function (param) {
        console.log("js_console_log_int:" + param);
    }
})

```
使用这个命令进行编译 emcc capi_js.cc --js-library pkg.js -o capi_js.js
--js-library pkg.js意为将pkg.js作为附加库参与链接。命令执行后得到capi_js.js以及capi_js.wasm

### 2.3 单向透明的内存模型和Module.HEAP
#### 2.3.1 Module.buffer
（1）无论编译目标是asm.js还是wasm，C/C++代码眼中的内存空间实际上对应的都是Emscripten提供的ArrayBuffer对象：Module.buffer，C/C++内存地址与Module.buffer数组下标一一对应。
（2）单向透明的内存模型
C/C++代码能直接通过地址访问的数据全部在内存中（包括运行时堆、运行时栈），而内存对应Module.buffer对象，C/C++代码能直接访问的数据事实上被限制在Module.buffer内部，JavaScript环境中的其他对象无法被C/C++直接访问——因此我们称其为单向透明的内存模型。

#### 2.3.2 Module.HEAPX
（1）ArrayBuffer
是JavaScript中用于保存二进制数据的一维数组。
无法直接访问，必须通过某种类型的TypedArray方可对其进行读写。
ArrayBuffer与TypedArray的关系可以简单理解为：ArrayBuffer是实际存储数据的容器，在其上创建的TypedArray则是把该容器当作某种类型的数组来使用。
（2）Emscripten 为 Module.buffer创建了常用类型的TypeArray
{% asset_img ClassName 4.jpg %}
#### 2.3.3 JS中访问C/C++内存
（1）int32
在JavaScript中调用了C函数get_int_ptr()，获取了全局变量g_int的地址，然后通过Module.HEAP32[int_ptr >> 2]获取了该地址对应的int32值。
由于Module.HEAP32每个元素占用4字节，因此int_ptr需除以4（既右移2位）方为正确的索引。
（2）double类似
double对应的是Module.HEAPF64，占用8个字节，除以8，即右移3位为正确的索引；

### 2.4 JS和C交换数据
（1）从语言角度来说，JavaScript与C/C++有完全不同的数据体系，Number是二者唯一的交集，因此本质上二者相互调用时，都是在交换Number
（2）参数和返回值进行传递；之前讲的互相调用的方法；
（3）通过内存交换数据
比如
调用C语言的图片压缩功能，每张图片算是小量数据，通过函数参数传递；
调用ffmpeg处理视频，video数据量较大，通过内存交换的；
### 2.5 EM_ASM系列宏
用于在C/C++代码中直接嵌入JS代码
### 2.6 emscripten_run_script系列函数
可接受动态输入的字符串，该系列辅助函数可以类比于JavaScript中的eval()方法

第二章小节
虽然WebAssembly拥有接近于本地代码的执行性能，但倘若函数接口设计不合理、跨语言调用频率过高，整体运行效率会受到极大的拖累。

## 3 Emscripten的运行时

### 3.1 main函数与生命周期
(1) C/C++和emscripten的 区别
C中程序随main()函数返回的返回而退出；而对Emscripten来说，main()函数既不必须，运行时生命周期亦不由其控制。
(2)希望在mian结束后注销Emscripten的运行时
编译时加上一个配置；
-s NO_EXIT_RUNTIME=0
### 3.2 文件系统
这一块有狠多内容，简单的挑几个重点
（1）C/C++的libc/libcxx是同步文件访问函数
而浏览器的JS无法访问本地文件系统，而且ajax，fetch都是异步的；
emscripten提供了一套虚拟文件系统，来兼容；
（2）底层三个文件系统
MEMFS，内存文件系统
NODEFS，nodejs文件系统，只用于nodejs环境
IDBFS，indexedDB文件系统，只能用于浏览器环境；
最常用的是MEMFS

### 3.3 内存管理
（1）可以自定义设置内存大小
（2）可变内存
编译时增加配置
-s ALLOW_MEMORY_GROWTH=1
1）当编译目标为asm.js时，可变内存模式会影响性能
2）可扩容的内存是WebAssembly的自有特性，
当编译目标为wasm时，使用可变内存模式非常高效，不会影响运行性能，因此在编译为WebAssembly时，可变内存是推荐用法。
笔者用ffmpeg解码超大gif是碰到的内存问题，就是用可变内存解决的；

### 3.4 Module定制
（1）之前介绍的
Module.onRuntimeInitialized
Module.TOTAL_MEMORY
（2）解决asm编译成wasm，异步的问题
可以增加了一个自定义的回调方法来解决 Module["returnCallback"]

第三章小节
（1）从个人经验来说，有两个较常查阅的源文件，分别为：
emsdk/emscripten/<sdk_ver>/src/settings.js
emsdk/emscripten/<sdk_ver>/system/include/emscripten.h
（2）前者包含了所有的编译选项及解释
（3）后者包含了emscripten_set_main_loop()/emscripten_run_script()等Emscripten特有函数的声明；

到这里，wasm可以算是入门了，下面看下实际项目中使用wasm碰到的问题。

# 三 进阶
## 1.最佳实践(优化点)
（1）无关UI渲染的加入到webworker中
Wasm+webworker，算是一个标配了；
关于webworker在实际项目的使用可以看笔者上一篇博客；
（2）通过indexDB缓存wasm文件
这个是实验性方案，官网现在又提示正在从浏览器indexdb中删除对wasm的支持；
https://developer.mozilla.org/en-US/docs/WebAssembly/Caching_modules
暂时不推荐尝试，不然千辛万苦做了之后方案废弃，又得返工；
（3）先开发C++或者别的模块，再编译wasm进行校验
（4）采用asm.js作为fallback降级方案；
低版本浏览器使用asm.js进行兼容；


## 2.挑一个需要的C库~ ffmpeg
### 2.1 介绍ffmpeg
（1）FFmpeg是一套可以用来记录、转换数字音频、视频，并能将其转化为流的开源计算机程序。采用LGPL或GPL许可证。它提供了录制、转换以及流化音视频的完整解决方案。
（2）简单的说，FFmpeg是C语言编写的开源界最强的多媒体处理库，没有之一。
#### 2.1.1 常用功能
（）视频转图片；图片转视频；
（）视频拿声音；
（）视频转gif，gif转视频；
（）视频，格式转换，码率控制，尺寸控制；
（）视频剪辑，拼接，添加水印+去水印；
（）压缩视频；
（）压缩mp3；
（）压缩gif；
等等....
#### 2.1.2 各种配置
decoder, encoder, demuxer, muxer, filter
ffmpeg的各种配置，是非常庞大，具体可以查询官网
https://ffmpeg.org/

### 2.2 把ffmpeg按功能编译成我们需要的wasm
目标功能，MP4视频获取帧截图、声音，以及GIF图片解码
在一个大神的基础上，按照自定义需求重新编译ffmpeg
本项目仓库地址：
https://github.com/yllg/wasm-ffmpeg
参考的项目地址：
https://github.com/Kagami/ffmpeg.js

#### 2.2.1 emcc的各种参数
--pre-js 把指定的js文件内容加到编译的代码前面
--post-j 类似，加到编译的代码最后
最终效果如下
【pre.js】--【生成的asm.js / wasm】--【post.js】
webworker的代码就是写在 pre.js和post.js中的

#### 2.2.2 配置一个H.264编解码的视频库
同时具备视频按帧截图，获取视频声音的功能
{% asset_img ClassName 5.jpg %}

#### 2.2.3 再添加上gif解码的功能
在COMMON_DEMUXERS和COMMON_DECODERS里面添加gif即可；

#### 2.2.4 最后删除冗余的编码器，解码器，解轨器
最精简的DEMUXERS和DECODERS如下
{% asset_img ClassName 6.jpg %}
{% asset_img ClassName 7.jpg %}

#### 2.2.5 png透明图片的配置
png和jpeg都能自动检查不需要单独配置
但是png有个依赖，需要zlib库
这里有个坑
Ffmpeg开启zlib，enable-zlib
emcc开启zlib，-s USE_ZLIB=1
编译始终不能成功，查了好久发现时emscripten的bug；需要等下个版本修复了再试试；

#### 2.2.6 编译目标瘦身总结：
最开始使用两个asm文件，获取帧截图的18.5M，获取声音的12.7M
合二为一并添加gif解码功能 重新编译后的文件
asm文件，14.9M
wasm文件，6.8M

#### 2.2.7 本项目的未来的规划
（1）按理说，enable-all把ffmpeg所有编解码器都开启，编译生成wasm文件，就可以在浏览器处理各种各样多媒体数据了，完全不需要后端；Amazing！
（2）再用react或者vue做个UI界面，就可以做一个网页版的格式工厂，什么图片，音频，视频，随便来~


~END~


GitHub: [GitHub链接](https://github.com/yllg/wasm-ffmpeg)
欢迎小伙伴们star 💗❤️💖~~

同时欢迎关注我的个人微信公众号：
{% img  /img/公众号二维码.jpg 300 300 悬笔e绝 %}