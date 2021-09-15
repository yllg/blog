---
title: 预渲染、SSR、SSG、ISR
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2021-08-17 22:43:25
top:
---


# 一.React中手动搭建一个SSR

## 1、是什么

Server-Side Rendering ，简称SSR，意为服务端渲染

指由服务侧完成页面的 HTML 结构拼接的页面处理技术，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程

{% asset_img ClassName 1.webp %}

其解决的问题主要有两个：

（1）SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面

（2）加速首屏加载，解决首屏白屏问题

{% asset_img ClassName 2.png %}

## 2.如何做

在react中，实现SSR主要有两种形式：

（1）手动搭建一个 SSR 框架

（2）使用成熟的SSR 框架，如 Next.JS


## 3.手动搭建一个SSR框架进行实现

（1）首先通过express启动一个app.js文件，用于监听3000端口的请求，当请求根目录时，返回HTML，如下：

```js
const express = require('express')
const app = express()
app.get('/', (req,res) => res.send(`
<html>
   <head>
       <title>ssr demo</title>
   </head>
   <body>
       Hello world
   </body>
</html>
`))

app.listen(3000, () => console.log('Exampleapp listening on port 3000!'))
```

（2）然后再服务器中编写react代码，在app.js中进行应引用

```js
import React from 'react'

const Home = () =>{
    return <div>home</div>
}

export default Home
```

为了让服务器能够识别JSX，这里需要使用webpakc对项目进行打包转换，创建一个配置文件webpack.server.js并进行相关配置，如下：

```js
const path = require('path')    //node的path模块
const nodeExternals = require('webpack-node-externals')

module.exports = {
    target:'node',
    mode:'development',           //开发模式
    entry:'./app.js',             //入口
    output: {                     //打包出口
        filename:'bundle.js',     //打包后的文件名
        path:path.resolve(__dirname,'build')    //存放到根目录的build文件夹
    },
    externals: [nodeExternals()],  //保持node中require的引用方式
    module: {
        rules: [{                  //打包规则
           test:   /\.js?$/,       //对所有js文件进行打包
           loader:'babel-loader',  //使用babel-loader进行打包
           exclude: /node_modules/,//不打包node_modules中的js文件
           options: {
               presets: ['react','stage-0',['env', { 
                                  //loader时额外的打包规则,对react,JSX，ES6进行转换
                    targets: {
                        browsers: ['last 2versions']   //对主流浏览器最近两个版本进行兼容
                    }
               }]]
           }
       }]
    }
}
```

接着借助react-dom提供了服务端渲染的 <font color="#FF0000"> renderToString </font> 方法，负责把React组件解析成html

```js
import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from 'react-dom/server'//引入renderToString方法
import Home from'./src/containers/Home'

const app= express()
const content = renderToString(<Home/>)
app.get('/',(req,res) => res.send(`
<html>
   <head>
       <title>ssr demo</title>
   </head>
   <body>
        ${content}
   </body>
</html>
`))

app.listen(3001, () => console.log('Exampleapp listening on port 3001!'))

```

上面的过程中，已经能够成功将组件渲染到了页面上;

但是像一些事件处理的方法，是无法在服务端完成，因此需要将组件代码在浏览器中再执行一遍。

这种服务器端和客户端共用一套代码的方式就称之为<font color="#FF0000"> 「同构」 </font>


（3）同构

通俗讲就是一套React代码在服务器上运行一遍，到达浏览器又运行一遍：

```
1、服务端渲染完成页面结构
2、浏览器端渲染完成事件绑定
```
浏览器实现事件绑定的方式是让浏览器去拉取JS文件执行，让JS代码来控制，因此需要引入script标签

通过script标签为页面引入客户端执行的react代码，并通过express的static中间件为js文件配置路由，修改如下：

```js
import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from'react-dom/server'//引入renderToString方法
import Home from './src/containers/Home'
 
const app = express()
app.use(express.static('public'));
//使用express提供的static中间件,中间件会将所有静态文件的路由指向public文件夹
 const content = renderToString(<Home/>)
 
app.get('/',(req,res)=>res.send(`
<html>
   <head>
       <title>ssr demo</title>
   </head>
   <body>
        ${content}
   <script src="/index.js"></script>
   </body>
</html>
`))

 app.listen(3001, () =>console.log('Example app listening on port 3001!'))
 
```

然后再客户端执行一下react代码

新建webpack.client.js作为客户端React代码的webpack配置文件如下：

```js
const path = require('path')                    //node的path模块

module.exports = {
    mode:'development',                         //开发模式
    entry:'./src/client/index.js',              //入口
    output: {                                   //打包出口
        filename:'index.js',                    //打包后的文件名
        path:path.resolve(__dirname,'public')   //存放到根目录的build文件夹
    },
    module: {
        rules: [{                               //打包规则
           test:   /\.js?$/,                    //对所有js文件进行打包
           loader:'babel-loader',               //使用babel-loader进行打包
           exclude: /node_modules/,             //不打包node_modules中的js文件
           options: {
               presets: ['react','stage-0',['env', {     
                    //loader时额外的打包规则,这里对react,JSX进行转换
                    targets: {
                        browsers: ['last 2versions']   //对主流浏览器最近两个版本进行兼容
                    }
               }]]
           }
       }]
    }
}
```

这种方法就能够简单实现首页的react服务端渲染，过程对应如下图：


{% asset_img ClassName 3.webp %}

（4）路由

在做完初始渲染的时候，一个应用会存在路由的情况，配置信息如下：


```js
import React from 'react'                   //引入React以支持JSX
import { Route } from 'react-router-dom'    //引入路由
import Home from './containers/Home'        //引入Home组件

export default (
    <div>
        <Route path="/" exact component={Home}></Route>
    </div>
)
然后可以通过index.js引用路由信息，如下：

import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from'react-router-dom'
import Router from'../Routers'

const App= () => {
    return (
        <BrowserRouter>
           {Router}
        </BrowserRouter>
    )
}

ReactDom.hydrate(<App/>, document.getElementById('root'))

```

这时候控制台会存在报错信息，原因在于每个Route组件外面包裹着一层div，但服务端返回的代码中并没有这个div

解决方法：

只需要将路由信息在服务端执行一遍，使用使用<font color="#FF0000"> StaticRouter </font>来替代BrowserRouter，通过context进行参数传递


```js
import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from 'react-dom/server'//引入renderToString方法
import { StaticRouter } from 'react-router-dom'
import Router from '../Routers'
 
const app = express()
app.use(express.static('public'));
//使用express提供的static中间件,中间件会将所有静态文件的路由指向public文件夹

app.get('/',(req,res)=>{
    const content  = renderToString((
        //传入当前path
        //context为必填参数,用于服务端渲染参数传递
        <StaticRouter location={req.path} context={{}}>
           {Router}
        </StaticRouter>
    ))
    res.send(`
   <html>
       <head>
           <title>ssr demo</title>
       </head>
       <body>
       <div id="root">${content}</div>
       <script src="/index.js"></script>
       </body>
   </html>
    `)
})


app.listen(3001, () => console.log('Exampleapp listening on port 3001!'))

```

这样也就完成了路由的服务端渲染

（5）原理

整体react服务端渲染原理并不复杂，具体如下：
```
1.node server 接收客户端请求，得到当前的请求url 路径，然后在已有的路由表内查找到对应的组件，拿到需要请求的数据，将数据作为 props、context或者store 形式传入组件

2.然后基于 react 内置的服务端渲染方法 renderToString()把组件渲染为 html字符串,最终的 html 进行输出前，把需要将数据注入到浏览器端

3.浏览器开始进行渲染和节点对比，然后执行完成组件内事件绑定和一些交互，浏览器重用了服务端输出的 html 节点，整个流程结束
```


# 二.Next.js做预渲染

## 1.是什么
Next.js 提供了生产环境所需的所有功能以及最佳实践，包括构建时预渲染、服务端渲染、路由预加载、智能打包、零配置等。

其中，Next.js 以其优秀的构建时渲染和服务端渲染能力，成为当今 React 生态中最受欢迎的框架之一。

下面介绍 Next.js 提供的三种预渲染模式以及混合渲染模式，来看看 Next.js 是怎么做预渲染的。


## 三种预渲染模式

普通的单页应用只有一个 HTML，初次请求返回的 HTML 中没有任何页面内容，需要通过网络请求 JS bundle 并渲染，整个渲染过程都在客户端完成，所以叫客户端渲染（CSR）。
这种渲染方式虽然在后续的页面切换速度很快，但是也明显存在两个问题：

1.白屏时间过长：

在 JS bundle 返回之前，页面一直是空白的。假如 bundle 体积过大或者网络条件不好的情况下，体验会更不好

2.SEO 不友好：

搜索引擎访问页面时，只会看 HTML 中的内容，默认是不会执行 JS，所以抓取不到页面的具体内容

{% asset_img ClassName 4.webp %}

而 Next.js 提供的三种预渲染模式，均在 CSR 开始前，在服务端预先渲染出页面内容，避免出现白屏时间过长和 SEO 不友好的问题。

## SSR

为了解决上面出现的两个问题，SSR(Server Side Rendering)诞生了。

是在服务端直接实时同构渲染当前用户访问的页面，返回的 HTML 包含页面具体内容，提高用户的体验。

React 从框架层面直接提供支持，只需要调用 <font color="#FF0000"> renderToString(Component)  </font>函数即可得到 HTML 内容。

{% asset_img ClassName 5.webp %}

Next.js 提供 <font color="#FF0000"> getServerSideProps  </font> 异步函数，以在 SSR 场景下获取额外的数据并返回给组件进行渲染。

getServerSideProps 可以拿到每次请求的上下文（Context)，举个例子：

```
export default function FirstPost(props) {
  // 在 props 中拿到数据
  const { title } = props;
  return (
    <Layout>
      <h1>{title}</h1>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  console.log('context', context.req);
  // 模拟获取数据
  const title = await getTitle(context.req);
  // 把数据放在 props 对象中返回出去
  return {
    props: {
      title
    }
  }
}
```

SSR 方案虽然解决了 CSR 带来的两个问题，但是同时又引入另一个问题：

需要一个服务器承载页面的<font color="#FF0000"> 实时 </font>请求、渲染和响应，这无疑会增大<font color="#FF0000"> 服务端开发和运维 </font>的成本。

另外对于一些较为静态场景，比如博客、官网等，它们的内容相对来说比较确定，变化不频繁，每次通过服务端渲染出来的内容都是一样的，无疑浪费了很多没必要的服务器资源。这时，有没有一种方案可以让这些页面变得静态呢？
这时，<font color="#FF0000"> 静态站点生成（SSG，也叫构建时预渲染） </font>诞生了。

## SSG

SSG(Static Site Generation) 是指在应用编译构建时预先渲染页面，并生成静态的 HTML。把生成的 HTML 静态资源部署到服务器后，浏览器不仅首次能请求到带页面内容的 HTML ，而且不需要服务器实时渲染和响应，大大节约了服务器运维成本和资源。

{% asset_img ClassName 6.webp %}

Next.js 默认为每个页面开启 SSG。

对于页面内容需要依赖静态数据的场景，允许在每个页面中 export 一个 <font color="#FF0000"> getStaticProps </font> 异步函数，在这个函数中可以把该页面组件所需要的数据收集并返回。

当 getStaticProps 函数执行完成后，页面组件就能在 props 中拿到这些数据并执行静态渲染。

举个在静态路由中使用 SSG 的例子：

```

// pages/posts/first-post.js
function Post(props) {
  const { postData } = props;
  
  return <div>{postData.title}</div>
}

export async function getStaticProps() {
  // 模拟获取静态数据
  const postData = await getPostData();
  return {
    props: { postData }
  }
}
```

对于动态路由的场景，Next.js 是如何做 SSG 的呢？

Next.js 提供 <font color="#FF0000"> getStaticPaths </font> 异步函数，在这个方法中，会返回一个 paths 数组，这个数组包含了这个动态路由在构建时需要预渲染的页面数据。举个例子：

```

// pages/posts/[id].js
function Post(props) {
  const { postData } = props;
  
  return <div>{postData.title}</div>
}

export async function getStaticPaths() {
  // 返回该动态路由可能会渲染的页面数据，比如 params.id
  const paths = [
    {
      params: { id: 'ssg-ssr' }
    },
    {
      params: { id: 'pre-rendering' }
    }
  ]
  return {
    paths,
    // 命中尚未生成静态页面的路由直接返回 404 页面
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  // 使用 params.id 获取对应的静态数据
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}
```

当我们执行 nextjs build 后，可以看到打包结果包含 pre-rendering.html 和 ssg-ssr.html 两个 HTML 页面，也就是说在执行 SSG 时，会对 getStaticPaths 函数返回的 paths 数组进行循环，逐一预渲染页面组件并生成 HTML。

```

├── server
|  ├── chunks
|  ├── pages
|  |  ├── api
|  |  ├── index.html
|  |  ├── index.js
|  |  ├── index.json
|  |  └── posts
|  |     ├── [id].js
|  |     ├── first-post.html
|  |     ├── first-post.js
|  |     ├── pre-rendering.html       # 预渲染生成 pre-rendering 页面
|  |     ├── pre-rendering.json
|  |     ├── ssg-ssr.html             # 预渲染生成 ssg-ssr 页面
|  |     └── ssg-ssr.json

```

SSG 虽然很好解决了白屏时间过长和 SEO 不友好的问题，但是它仅仅适合于页面内容较为静态的场景，比如官网、博客等。

面对页面<font color="#FF0000"> 数据更新频繁或页面数量很多 </font>的情况，它似乎显得有点束手无策，毕竟在静态构建时不能拿到最新的数据和无法枚举海量页面。

这时，就需要增量静态再生成(Incremental Static Regeneration)方案了。

## ISR

{% asset_img ClassName 7.webp %}

Next.js 推出的 ISR(Incremental Static Regeneration) 方案，允许在应用<font color="#FF0000"> 运行时再重新生成每个页面 HTML </font>，而不需要重新构建整个应用。这样即使有海量页面，也能使用上 SSG 的特性。

一般来说，使用 ISR 需要 <font color="#FF0000"> getStaticPaths </font> 和 <font color="#FF0000"> getStaticProps </font> 同时配合使用。

举个例子：
```

// pages/posts/[id].js
function Post(props) {
  const { postData } = props;
  
  return <div>{postData.title}</div>
}

export async function getStaticPaths() {
  const paths = await fetch('https://.../posts');
  return {
    paths,
    // 页面请求的降级策略，这里是指不降级，等待页面生成后再返回，类似于 SSR
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  // 使用 params.id 获取对应的静态数据
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    },
    // 开启 ISR，最多每10s重新生成一次页面
    revalidate: 10,
  }
}
```

在应用编译构建阶段，会生成已经确定的静态页面，和上面 SSG 执行流程一致。



在 getStaticProps 函数返回的对象中增加 <font color="#FF0000"> revalidate </font> 属性，表示开启 ISR。

在上面的例子中，指定 revalidate = 10，表示最多10秒内重新生成一次静态 HTML。


{% blockquote %}
* 1.当浏览器请求已在构建时渲染生成的页面时，首先返回的是缓存的 HTML，10s 后页面开始重新渲染，页面成功生成后，更新缓存，浏览器再次请求页面时就能拿到最新渲染的页面内容了。

* 2.对于浏览器请求构建时未生成的页面时，会马上生成静态 HTML。

在这个过程中，getStaticPaths 返回的 fallback 字段有以下的选项：


（1）fallback: 'blocking'：不降级，并且要求用户请求一直等到新页面静态生成结束，静态页面生成结束后会缓存；类似SSR

（2）fallback: true：降级，先返回降级页面，当静态页面生成结束后，会返回一个 JSON 供降级页面 CSR 使用，经过二次渲染后，完整页面出来了

{% endblockquote %}

在上面的例子中，使用的是不降级方案(fallback: 'blocking')，实际上和 SSR 方案有相似之处，都是阻塞渲染，只不过多了缓存而已。

也不是所有场景都适合使用 ISR。对于实时性要求较高的场景，比如新闻资讯类的网站，可能 SSR 才是最好的选择。

## 混合渲染模式

Next.js 不仅支持 SSR、SSG、CSR、ISR，还支持渲染模式的混合使用。

下面将介绍三种混合渲染模式。

### SSR + CSR

上面已经提及过，SSR 似乎已经解决了 CSR 带来的问题，那是不是 CSR 完全没有用武之地呢？其实并不是。

使用 CSR 时，页面切换无需刷新，无需重新请求整个 HTML 的内容。

既然如此，可以各取所长，各补其短，于是就有 SSR + CSR 的方案：

{% blockquote %}

1.首次加载页面走 SSR：

保证首屏加载速度的同时，并且满足 SEO 的诉求

2.页面切换走 CSR：

Next.js 会发起一次网络请求，执行 getServerSideProps 函数，拿到它返回的数据后，进行页面渲染
{% endblockquote %}

{% asset_img ClassName 8.gif %}

二者的有机结合，大大减少后端服务器的压力和成本的同时，也能提高页面切换的速度，进一步提升用户的体验。

除了 Next.js，还有其他的框架也使用 SSR + CSR 方案，比如 ice.js 等。


### SSG + CSR

在上面已提及过，SSR 需要较高的服务器运维成本。对于某些静态网站或者实时性要求较低的网站来说，是没有必要使用 SSR 的。假如用 SSG 代替 SSR，使用 SSG + CSR 方案，是不是会更好：

{% blockquote %}
* 静态内容走 SSG：对于页面中较为静态的内容，比如导航栏、布局等，可以在编译构建时预先渲染静态 HTML

* 动态内容走 CSR：一般会在 useEffect 中请求接口获取动态数据，然后进行页面重新渲染

{% endblockquote %}

虽然从体验来说，动态内容需要页面重新渲染后才能出现，体验上没有 SSR 好，但是避免 SSR 带来的高额服务器成本的同时，也能保证首屏渲染时间不会太长，相比纯 CSR 来说，还是提升了用户体验。

### SSG + SSR

在上面介绍的 ISR 方案时提及过，ISR 的实质是 SSG + SSR：

静态内容走 SSG：编译构建时把相对静态的页面预先渲染生成 HTML，浏览器请求时直接返回静态 HTML

动态内容走 SSR：浏览器请求未预先渲染的页面，在运行时通过 SSR 渲染生成页面，然后返回到浏览器，并缓存静态 HTML，下次命中缓存时直接返回

ISR 相比于 SSG + CSR 来说，动态内容可以直接直出，进一步提升了首次访问页面时的体验；相比于 SSR + CSR 来说，减少没必要的静态页面渲染，节省了一部分后端服务器成本。

{% blockquote %}
* 总的来说，没有十全十美的渲染方案，都需要根据实际场景进行权衡和取舍。
{% endblockquote %}


# SSR与传统的模板引擎渲染的区别
（1）SSR是前后端分离领域出现之后才有的，一般是基于nodejs中间层做的；
传统的模板引擎渲染是后端处理的；

（2）SSR主要是为了解决首屏加载和SEO，传统模板引擎渲染是整体项目加载；
SSR的首屏加载会更快；

# SSR优化措施
（1）模块拆分：有利于并发渲染；

（2）模块级别缓存：比如页面的header和bottom；

（3）组件级缓存：最小粒度的缓存单位，性能提升依赖于缓存的范围和命中率，运用得当，可能带来非常大的性能提升。

（4）部分模块客户端渲染(对SEO无用的部分): 直接降低SSR部分的复杂度

（5）智能降级：
流量暴增服务器的cpu和内存使用率过高时，自动降级为客户端渲染CSR，等CPU和内存恢复正常再切回服务端渲染；

（6）升级nodejs版本；

（7）升级React、vue的版本；

（8）降低react组件的嵌套层级 等等

# SSR降级方案
SSR降级措施，切换CSR和SSR，让用户得到更好的体验，以egg这个nodejs框架为例

（1）核心思路就是当CPU和内存使用率过高的时候即使切换到CSR模式. 

（2）结合Egg提供的schedule能力, 在启动时执行一个定时任务, 监控CPU使用率, 当大于阈值时切换到CSR模式. 

（3）而Egg也提供了单核schedule能力, 这样可以将定时任务的性能损耗降到很小; 

（4）或者在渲染执行时做超时统计, 如果超时则自动返回CSR bundle, 降级为CSR应用, 这样虽然能临时解决CPU高开销无法及时响应的问题, 但用户体验并没有什么实质性改良.


# 新发展

1.react V18版本对SSR的升级
可以参考这一篇：
https://mp.weixin.qq.com/s/jzkbysgW2LbncC8RUizZrQ

持续关注...


# 最后
同时欢迎关注我的个人微信公众号：
{% img https://www.xuanbiyijue.com//img/%E5%85%AC%E4%BC%97%E5%8F%B7%E4%BA%8C%E7%BB%B4%E7%A0%81.jpg 300 300 %}