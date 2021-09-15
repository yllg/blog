---
title: react调度原理-concurrent
categories:
  - MV框架
  - null
tags:
  - null
  - null
date: 2020-06-25 09:31:27
top:
---

# 背景知识
## 1.单核处理器（模拟JS）的并发和并行
### （1）并发，Concurrent
操作系统会按照一定的调度策略，将CPU的执行权分配给多个进程，让它们<font color="#FF0000"> 交替执行 </font>，形成一种“同时在运行”假象, 因为CPU速度太快，人类感觉不到。实际上在单核的物理环境下同时只能有一个程序在运行。
### （2）并行
真正实现同时处理多个任务，这就是并行，严格地讲这是Master-Slave架构，分身虽然物理存在，但应该没有独立的意志；

## 2.单处理器调度策略
（1）先到先得(First-Come-First-Served, FCFS)；对短进程、IO密集型不利；
（2）轮询，要设置好时间片的长度；
最好符合大部分进程完成一次典型交互所需的时间；对IO不利；
（3）最短进程优先(Shortest Process Next, SPN)
可能长进程得不到响应；长进程阻塞后面；
（4）最短剩余时间(Shortest Remaining Time, SRT)
增加抢占机制，剩余时间短，新的就会抢占旧的进程；
（5）最高响应比优先(HRRN)
响应比 = （等待执行时间 + 进程执行时间） / 进程执行时间
（6）反馈法
 每个进程一开始都有相同的优先级，每次被抢占(需要配合其他抢占策略使用，如轮转)，优先级就会降低一级。因此通常它会根据优先级划分多个队列。

### 3.Fiber协程
（1）和线程并不一样，协程本身是没有并发或者并行能力的（需要配合线程），
它只是一种控制流程的<font color="#FF0000"> 出让机制 </font>。
（2）ES6的Generator
普通函数无法中断，generator可以

```javascript
const tasks = []
function * run() {
  let task

  while (task = tasks.shift()) {
    // 🔴 判断是否有高优先级事件需要处理, 有的话让出控制权
    if (hasHighPriorityEvent()) {
      yield
    }

    // 处理完高优先级事件后，恢复函数调用栈，继续执行...
    execute(task)
  }
}
```

# 一.浏览器没有抢占机制，React用的主动出让机制
（1）合作式调度cooperative scheduling
（2）用户代码向浏览器申请时间片，由浏览器给我们分配执行时间片(通过requestIdleCallback实现,)，我们要按照约定在这个时间内执行完毕，并将控制权还给浏览器。
（3）在这之前是，用户的代码想怎么执行就怎么执行，执行多久就执行多久; 

# 二．时间切片
## 1.作用
（1）在执行任务过程中，不阻塞用户与页面交互，立即响应交互事件和需要执行的代码；
（2）实现高优先级插队；
## 2.源码实现
``` javascript
// Scheduler periodically yields in case there is other work on the main
// thread, like user events. By default, it yields multiple times per frame.
// It does not attempt to align with frame boundaries, since most tasks don't
// need to be frame aligned; for those that do, use requestAnimationFrame.
let yieldInterval = 5;
```
（1）<font color="#FF0000"> 五毫秒 </font>，目前单位时间切片的长度；
（2）源码注释中还说，一个帧中会有多个时间切片（显而易见，一帧~=16.67ms，包含3个时间切片还多），切片时间不会与帧对齐，如果要与帧对齐，则使用requestAnimationFrame~~RAF。

# 三．requestIdleCallback 和 MessageChannel 
## （1）目前浏览器无法判断当前是否有更高优先级的任务等待被执行。
只能换一种思路，通过<font color="#FF0000">  超时检查的机制 </font>来让出控制权。
解决办法是: 确定一个合理的运行时长~上面写的5毫秒，每隔5毫秒，检测是否超时(比如每执行一个小任务)，如果超时就停止执行，将控制权交换给浏览器。
用浏览器提供的requestIdleCallback  API；
## （2）理想的一帧时间是 16ms (1000ms / 60)
如果浏览器处理完上述的任务(布局和绘制之后)，还有盈余时间，浏览器就会调用 requestIdleCallback 的回调
## （3）涉及到一帧的执行的内容，
见下图，之后文章会详细介绍浏览器的渲染原理、<font color="#FF0000"> 帧原理 </font>
{% asset_img 帧原理.png %}
## （4）超时处理
在浏览器繁忙的时候，可能不会有盈余时间，这时候requestIdleCallback回调可能就不会被执行。 
为了其他任务避免饿死，可以通过requestIdleCallback的第二个参数指定一个超时时间timeout。
超过timeout时长后，该回调函数会被立即执行；

## 1.用法
``` javascript
window.requestIdleCallback( 
  callback: (dealine: IdleDeadline) => void, 
  option?: {timeout: number} 
)
// IdleDeadline的接口如下：
interface IdleDealine { 
  didTimeout: boolean // 表示任务执行是否超过约定时间 
  timeRemaining(): DOMHighResTimeStamp // 任务可供执行的剩余时间 
}
```

## 2.兼容性
目前 requestIdleCallback 目前只有Chrome支持。所以目前 React 自己实现了一个
<font color="#FF0000"> unstable_scheduleCallback </font>(priorityLevel, callback, { timeout: number })

它利用MessageChannel 模拟将回调延迟到一帧的最后再执行:
源码地址：
https://github.com/facebook/react/blob/master/packages/scheduler/src/forks/SchedulerHostConfig.default.js

## 3.MessageChannel 
（1）构造函数
返回一个带有两个MessagePort属性的MessageChannel新对象。
允许我们创建一个新的消息通道，并通过它的两个MessagePort 属性发送数据。
是一个宏任务；
（2）所以分片，每5毫秒检查一下，运行一次异步的MessageChannel的port.postMessage(...)方法，检查是否存在事件响应、更高优先级任务或其他代码需要执行，如果有则执行，如果没有则重新创建工作循环，执行剩下的工作中Fiber。


# 四.过期时间ExpirationTime
（1）会根据 当前优先级 和 当前时间标记 生成对应 过期时间标记
（3）两种类型
时间标记：一个极大值，如1073741121
过期时间：从网页加载开始计时的实际过期时间，单位为毫秒
（3）过期时间标记
简单理解为和 过期时间 成反比；

{% blockquote %}
过期时间 = 当前时间 + 优先级对应过期时长
过期时间标记值 = 极大数值 - 过期时间 / 10
{% endblockquote %}

# 五．任务优先级，六个
## 1.Immediate(-1) 
这个优先级的任务会同步执行, 或者说要马上执行且不能中断
## 2.UserBlocking(250ms) 
这些任务一般是用户交互的结果, 需要及时得到反馈
## 3.Normal (5s) 
应对哪些不需要立即感受到的任务，例如网络请求
## 4.Low (10s) 
这些任务可以放后，但是最终应该得到执行. 例如分析通知
## 5.Idle (没有超时时间) 
一些没有必要做的任务 (e.g. 比如隐藏的内容), 可能会被饿死；
## 6.NoPriority

# 六．为啥不用generator实现
## 1.Generator 不能在栈中间让出。
比如你想在嵌套的函数调用中间让出, 首先你需要将这些函数都包装成Generator，另外这种栈中间的让出处理起来也比较麻烦，难以理解。
除了语法开销，现有的生成器实现开销比较大，所以不如不用。
## 2.Generator 是有状态的
很难在中间恢复这些状态。


# 七.流程图

{% asset_img  流程图.png %}

# 八．React为Fiber做的改造
## 1.数据结构的调整
递归改成迭代
（1）React 16之前 ，Reconcilation 是同步的、递归执行的；
现在用循环来代替之前的递归，扁平化的<font color="#FF0000"> 链表 </font>的数据存储结构;

（2）每个 VirtualDOM 节点内部现在使用 Fiber node表示,
模拟函数调用栈，保存了节点处理的上下文信息，方便中断和恢复；

```javascript
export type Fiber = { 
  // 常规的，和vdom类似
  tag:WorkTag, // 标记不同的组件类型
  Key:null | string, // 组件的key
  elementType: any, // ReactElement.type，也就是我们调用`createElement`的第一个参数
  type: any,  // // 异步组件resolved之后返回的内容，一般是`function`或者`class`
  ref
  //  链表结构 
  return: Fiber | null,  // 指向父节点，或者render该节点的组件
  child: Fiber | null, // 指向第一个子节点 
  sibling: Fiber | null, // 指向下一个兄弟节点
  // 保存状态和依赖
  stateNode: any, // // 保存组件的类实例、DOM节点或与Fiber节点关联的其他 React 元素类型的引用,跟当前Fiber相关本地状态（比如浏览器环境就是DOM节点）
  memoizedState: any, // 上一次渲染的时候的state
  memoizedProps: any, // 上一次渲染完成之后的props
  firstContextDependency: ContextDependency<mixed> | null, //一个列表，存放这个Fiber依赖的context
  pendingProps: any, // 新的变动带来的新的props
  // effect 也用链表关联
  effectTag, // 副作用标记
  nextEffect: Fiber | null, // 单链表用来快速查找下一个 effect
  firstEffect: Fiber | null, // 子树中第一个effect
  lastEffect: Fiber | null, // 子树中最后一个side effect
  // 其他 
  mode: TypeOfMode, // 共存的模式表示这个子树是否默认是异步渲染的
  updateQueue: UpdateQueue<any> | null,  //该Fiber对应的组件产生的Update会存放在这个队列里面
  expirationTime: ExpirationTime, // 代表任务在未来的哪个时间点应该被完成
  childExpirationTime: ExpirationTime // 快速确定子树中是否有不在等待的超时的变化
  alternate: Fiber | null, // WIP树中对应的fiber节点，渲染完成后会交换位置
}
```

fiber tree 如下：
{% asset_img  fiberTree.png %}

（3）Fiber 就是我们所说的工作单元，performUnitOfWork 负责对 Fiber 进行操作，并按照深度遍历的顺序返回下一个 Fiber。
因为使用了链表结构，每个节点存了各种状态和数据，即使处理流程被中断了，我们随时可以从上次未处理完的Fiber继续遍历下去。

## 2.两个阶段的拆分
（1）之前是<font color="#FF0000"> 一边Diff一边提交 </font>的
（2）现在分为两个阶段
reconciliation协调阶段 和 commit 提交阶段。

## 1.协调阶段，可以打断的
·  constructor
·  componentWillMount 废弃
·  componentWillReceiveProps 废弃
·  static getDerivedStateFromProps
·  shouldComponentUpdate
·  componentWillUpdate 废弃
·  render

因为Reconciliation阶段能被打断，所以会出现<font color="#FF0000"> 多次调用 </font>的情况，所以这些生命周期函数应该避免使用，16版之后标记为不安全的；

## 2.提交阶段，不能暂停，一直到界面更新完成 ；
getSnapshotBeforeUpdate()  严格来说，这个是在进入 commit 阶段前调用
componentDidMount
componentDidUpdate
componentWillUnmount

该阶段为了正确地处理各种副作用，包括DOM变更、还有你在componentDidMount中发起的异步请求、useEffect 中定义的副作用... 因为有<font color="#FF0000"> 副作用 </font>，所以必须保证按照次序只调用一次，况且会有用户可以察觉到的变更, 所以不能中断；

## 3.Reconcilation协调阶段（DOM diff）
（1）简单理解Reconcilation和Dom diff一样
（2）新的DOM diff跟之前类似，区别3点
不用递归去对比
不用diff完马上提交变更。
每一个work loop结束，需要判断剩余时间够不够；

### 3-1. Fiber Dom diff整个流程
构建一个workInProgress tree，<font color="#FF0000"> WIP树 </font>；
1.如果当前节点不需要更新，直接把子节点clone过来，跳到5；要更新的话打个tag
2.更新当前节点状态（props, state, context等）
3.调用shouldComponentUpdate()，false的话，跳到5
4.调用render()获得新的子节点，并为子节点创建fiber（创建过程会尽量复用现有fiber，子节点增删也发生在这里）
5.如果没有产生child fiber，该工作单元结束，把effect list归并到return，并把当前节点的sibling兄弟节点，作为下一个工作单元；否则把child作为下一个工作单元
6.work loop结束，判断剩余时间，如果没有剩余可用时间，等到下一次主线程空闲时才开始下一个工作单元；否则，立即开始做
7.如果没有下一个工作单元了（回到了workInProgress tree的根节点），第1阶段结束，进入pendingCommit状态；

（1）时间碎片未用完，高优先级的也抢不了，因为没有释放控制权；
（2）有变化的节点打上tag；没有变化标记完成即可；
（3）react维护一个effect list副作用列表，存储有变化打了标记的元素；之间也是用链表存起来的；
（4）所有节点标记完成，react将WIP树标记为pendingCommit。意思是可以进入commit阶段了。
（5）接入阶段2 提交阶段，根据effect-list来更新DOM。交换fiber-tree和WIP tree的指针；
（6）react大部分时间都在维持两个树（Double-buffering）。
缩减下次更新时，分配内存、垃圾清理的时间。
commit完成后，执行componentDidMount函数

## 4.双缓冲
（1）上面的WIP树，类似图形领域的“双缓存”技术，防止屏幕抖动，优化渲染性能；
（2）而react的WIP，在Reconciliation 完毕后一次性提交给浏览器进行渲染。它可以减少内存分配和垃圾回收
（3）WIP 的节点不完全是新的，比如某颗子树不需要变动，React会克隆复用旧树中的子树；
（4）异常处理，有异常可以继续用旧树的节点，避免整个树挂了；
（5）类似git功能，WIP是从旧树fork出来的，所以第二个阶段也叫commit阶段；

# 九．中断和恢复的深入
## 1.中断后，按照优先级安排任务，不一定按照顺序执行，可能导状态不一致；
（1）问题：低优先级任务将 a 设置为0，而高优先级任务将 a 递增1, 两个任务的执行顺序会影响最终的渲染结果。
因此要让高优先级任务插队, 首先要保证状态更新的时序。
（2）解决办法
所有更新任务按照顺序插入一个队列,<font color="#FF0000">  状态必须按照插入顺序进行计算 </font>，但任务可以按优先级顺序执行
目的：保证状态一致性和视图一致性；

## 2.恢复的注意点，重新完整执行一遍
一次更新分为很多个分片完成, 可能一个任务还没有执行完, 就被另一个优先级更高的更新过程打断；
因为WIP树已经更新了，所以低优先级的工作就<font color="#FF0000"> 完全作废 </font>, 然后等待机会重头到来.


# 十．总结 Concurrent mode并发模式的优点和缺点
## 【优点】
1.快速响应用户操作和输入，提升用户交互体验
2.让动画更加流畅，通过调度，可以让应用保持高帧率
3.利用好I/O 操作空闲期或者CPU空闲期，进行一些预渲染。 比如离屏(offscreen)不可见的内容，优先级最低，可以让 React 等到CPU空闲时才去渲染这部分内容。这和浏览器的preload等预加载技术差不多。
4.用Suspense 降低加载状态(load state)的优先级，减少闪屏。 比如数据很快返回时，可以不必显示加载状态，而是直接显示出来，避免闪屏；如果超时没有返回才显式加载状态。
## 【缺点】
因为浏览器<font color="#FF0000"> 无法实现抢占式调度 </font>，无法阻止开发者做傻事的，开发者可以随心所欲，想挖多大的坑，就挖多大的坑。
React Fiber 本质上是为了解决<font color="#FF0000">  React 更新低效率的问题 </font>，不要期望 Fiber 能给你现有应用带来质的提升, 如果性能问题是自己造成的，自己的锅还是得自己背.


同时欢迎关注我的个人微信公众号：
{% img https://www.xuanbiyijue.com//img/%E5%85%AC%E4%BC%97%E5%8F%B7%E4%BA%8C%E7%BB%B4%E7%A0%81.jpg 300 300 %}