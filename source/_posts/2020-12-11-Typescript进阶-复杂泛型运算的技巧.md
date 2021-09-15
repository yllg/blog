---
title: Typescript进阶-复杂泛型运算
categories:
  - 实验室
  - null
tags:
  - null
  - null
date: 2020-12-11 20:10:45
top:
---

# 复杂泛型的使用场景：
需要提高函数或组件的通用性时，使用复杂泛型成了必须的选择。
主流 TypeScript 开发的库的源码，也会有大量的尖括号包裹的复杂泛型运算。

首先定义下面一个类型，便于后面的使用。

```js
type User = {
  name: string,
  age: number,
};
```

# 关键字

## keyof 关键字

keyof 的功能较为简单，对于一个 object 类型，得到这个类型的所有属性名构成的联合类型

```js
type TA = keyof User
// 'name' | 'age'
```

在这个例子中，我们得到一个新的类型 TA，这个类型的实例必须为'name' 'age'这两个字符串之一，这样的单一字符串也是一种类型，属于字面量类型[3]。

## typeof 关键字

typeof 是针对某一个类型的实例来讲的，我们将得到这个实例的类型。

```js
const fn = () => ({ name: 'blasius', age: 18 });
type TB = typeof fn;
// () => {name: string, age: number}
```

这里的类型 TB，是一个新的类型，写作() => {name: string, age: number}，这是一个函数类型。这个类型的函数的返回值是一个新的类型，写作{name: string, age: number}，然而，这个类型暂时还没有特定的名称。假如我们想把这个返回值的类型提取出来，可以使用 ReturnType 这个工具类型，本文后面会具体介绍。

## extends 关键字

extends 关键字在类型运算中的作用，不是继承或者扩展，而是判断一个类型是否可以被赋值给另一个类型。如上面的类型 TB，是一个函数，因此这个类型是可以赋值给类型 Function。

extends 有时被用来进行类型约束。考虑下面的例子：

```js
function logLength<T>(arg: T) {
  console.log(arg.length);
  // Property 'length' does not exist on type 'T'.
}
```

此时我们无法保证类型 T 一定包含 length 这个属性，因此会出现错误。考虑进行如下修改：

```js
// 定义一个类型ILengthy
interface ILengthy {
    length: number;
}
function logLength2<T extends ILengthy>(arg: T) {
    console.log(arg.length);
}

```

对于函数 logLength2 来说，我们规定了类型 T 必须是 ILengthy 可赋值的类型，也就是说，T 必须包含类型为 number 的属性 length，这样一来，我们成功对函数的参数进行了约束。

extends 的另一种用法，是在类型运算中进行条件运算，具体用法将会在后面的工具类型中进行介绍。

## infer 关键字

infer 一般用于类型提取，其作用类似于在类型运算的过程中声明了一个变量。考虑下面的例子：

```js
type UserPromise = Promise<User>;
```

这个类型表示一个返回值类型为 User 的 Promise 类型。我们想把 User 这个类型从这个已知的函数中提取出来，应当使用 infer 关键字：

```js
type UnPromisify<T> = T extends Promise<infer V> ? V : never;
type InferedUser = UnPromisify<UserPromise>
// { name: number; age: string; }
```

考虑这个例子中的 UnPromisify 类型，这个类型接受一个泛型 T。接下来通过 extends 关键字进行判断，如果 T 的类型形如 Promise<V>，那么就把这个 V 提取出来。为了更好的理解 infer 的作用，在这个例子中，可以认为 infer 声明了一个变量 V。这个例子，我们结合 extedns 和 infer 实现了类型提取。

# 工具类型

所谓工具类型，形如 type ToolType<T, ....> = R。为了便于理解我们可以将其看做是用 type 关键字定义的一个封装好的针对类型的<font color="#FF0000"> “函数” </font>。
传给工具类型的，被包裹在尖括号之内的泛型 T，就是函数的<font color="#FF0000"> 参数 </font>。等号右边的，就是这个“函数”的<font color="#FF0000"> 返回值 </font>。

有了所谓”函数“，也必须有”变量“。对于初学者来说，对于泛型感到不理解的主要困境在于：没有区分什么时候是类型的”函数“，什么时候是类型的”变量“。

上面提到的 UnPromisify<T>，就是这样一个类型的”函数“，因为尖括号中的 T 是不确定的，因此称为泛型。相对的，上面提到的 UnPromisify<UserPromise>，则是这个“函数”的执行结果，可以理解为类型的”变量“，因为尖括号中的 UserPromise 是一个确定的类型，{ name: number; age: string; }就是这个具体的结果的值。

下面介绍几个常用的工具类型，这几个“函数”已经作为标准存在于 TypeScript 中，分析这几个“函数”的具体实现，有利于我们更好地理解泛型。

## Partial<T>、Required<T>、Readonly<T>、Mutable<T>

Partial<T>这个类型“函数”的作用，在于给定一个输入的 object 类型 T，返回一个新的 object 类型，这个 object 类型的每一个属性都是可选的。

我们可以用基本的关键字来用自己的方式实现这个工具类型：

```js
type MyPartial<T> = {
    [K in keyof T]?: T[K]
}
type PartialUser = MyPartial<User>
// {name?: string, age?: number}
type TUserKeys = keyof User
// 'name' | 'age'
type TName = User['name']
// string
type TAge = User['age']
// number
type TUserValue = User[TUserKeys]
// string | number

```

上面的例子中，MyPartial<T>是工具类型本身，PartialUser 是 MyPartial<T>传入了"参数"User 经过运算后的结果，因此是工具类型使用的实例。下面我们来逐步理解这个例子:

1.keyof T 代表类型 T 的所有键构成的联合类型，等同于 TUserKeys
2.K in keyof T 代表 K 必须是这个联合类型中的一个 3.有了具体的键，参考 TName 和 TAge 的结果，就可以用 T[K]取出这个键对应的值的类型 4.至于中括号，这是 TypeScript 中的索引签名的类型
综上， MyPartial<T>这个"函数"的”返回“值是一个新的 object 类型，这个类型的键和键的类型都和”输入参数“T 相同且一一对应，只不过每个键的后面都多了一个问号?用来表示这个键可选罢了。

如果能理解 Partial<T>的实现，那么 Required<T>、Readonly<T>和 Mutable<T>的实现都是类似的。都是只不过是把?换成了 readonly 或者-用来表示不同的含义罢了。下面是这些工具类型的具体实现：

```js
type MyRequired<T> = {
    [K in keyof T]-?: T[K]
}
type MyReadonly<T> = {
    readonly [K in keyof T]: T[K]
}
type MyMutable<T> = {
    -readonly [K in keyof T]: T[K]
}

```

Requiered<T>表示根据 T 得到新的类型，这个类型的每个键值都为必需。
Readonly<T>表示由 T 得到新的类型，这个类型的每个键的值都为只读的。
Mutable<T>表示同样由 T 得到新的类型，这个类型的每个键的值为可写的。

## Record<K, T>、Pick<T, K>

工具类型 Record<K, T>的实现：

```js
type MyRecord<K extends keyof any, T> = {
    [P in K]: T
}
type TKeyofAny = keyof any
// string | number | symbol
type TKeys = 'a' | 'b' | 0
type TKeysUser = MyRecord<TKeys, User>
// {a: User, b: User, 0: User}
```

Record<K, T>接受两个类型作为”参数“，其中第一个参数 K 是一个任意字符串、数字或 Symbol 的联合类型，第二个“参数”T 可以为任意类型。最终得到一个由 K 中每个值作为键，值类型为 T 的新的 object 类型。

类似的，Pick<T, K>的实现：

```js
type MyPick<T, K extends keyof T> = {
    [P in K]: T[P]
}
type TNameKey = 'name'
type TUserName = MyPick<User, TNameKey>
// {name: string}

```

Pick 的功能很简单，从给定的类型 T 中 pick 出特定的键和键类型，构成新的类型，另一个”参数“K 类型必须是 keyof T 中的若干项构成的联合类型。

## Exclude<T, U>、Extract<T, U>、NonNullable<T>

这三个工具类型的实现是类似的，都使用了 extends 的基本用法来对联合类型进行条件性的选取, 已 Exclude<T, U>为例，若 T 能够赋值给 U，则返回 never，否则返回 T 本身，因此最终得到联合类型中存在于 T 中但不存在于 U 中的项：

```js
type MyExclude<T, U> = T extends U ? never : T
type MyExtract<T, U> = T extends U ? T : never
type MyNonNullable<T> = T extends null | undefined ? never : T

```

Exclude<T, U>和 Extract<T, U>通常是针对联合类型来使用的，两者的逻辑恰好相反。例如：

```js
type TC = 'a' | 'b' | 'c';
type TD = 'a' | 'c' | 'e';
type TE = MyExclude<TC, TD>;
// 'b'
type TF = MyExtract<TC, TD>;
// 'a' | 'c'
```

## Omit<T, K>

这个类型“函数”接受两个“参数”T 和 K，功能和 Pick<T, K>恰好相反，即从给定的类型 T 中排除（exclude）掉特定的键和键类型，得到新的类型。因此，可以用 Pick 配合 Exclude 来实现。

```js
type MyOmit<T, K> = Pick<T, Exclude<keyof T, K>>
type OmitUser = MyOmit<User, 'age'>
// { name: string }
```

思考 OmitUser 的运算过程：
1、得到 keyof User 为'name' | 'age'
2、从 'name' | 'age'中排除掉'age'，得到剩下的'name'
3、 Pick<User, 'name'>，得到剩下的 name，成为一个新的类型，一切都很顺理成章。

当不希望使用已有的 Pick<T, K>工具类型时，Omit<T, K>还可以有另一种实现方式，观察其结构，可以发现 Pick<T, K>的影子。

```js
type MyOmit2<T, K> = {
    [P in MyExclude<keyof T, K>]: T[P];
}
```

## 构造函数类型和 InstanceType<T>

形如 new (args: any) => any 类型的函数，被称为构造函数类型。

下面的工具类型 InstanceType，用于取得构造函数的返回的实例的类型。

```js
type MyInstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
```

乍一看这个表达式十分复杂，但是主体结构仅仅是一个前面见过的 extends 表达式而已:

{% asset_img ClassName 1.webp %}

图中红色放方框中代表构造函数类型。绿色方框中用 infer 关键字声明了一个新的“类型变量”R，若 T 为构造函数类型，则可以得到该函数的返回实例的类型。

## ReturnType<T>、Parameters<T>

ReturnType 工具类型用于提取泛型 T 的返回值。Parameters 工具类型用于提取泛型 T 的参数。

```js
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

```

为了理解这两个工具类型的实现，只需同样要把握住 infer 的位置和匿名的函数类型(...args: any) => any 这两个要点即可

# 总结

从上面的例子可以看出，所谓泛型，完全可以理解成一个类型的<font color="#FF0000"> ”函数“ </font>，把握住尖括号中的输入参数，注意观察等号右边的”函数返回值“。

值得注意的是，尖括号中的内容，如果是形如<font color="#FF0000"> T、K </font>这样的，那么就是<font color="#FF0000"> “函数”本身 </font>，如果尖括号内是一个<font color="#FF0000"> 确定的类型 </font>，那么就成了“函数”的<font color="#FF0000"> 执行结果 </font>。

一些常用的用 TypeScript 写成的包如 Redux 的源码中，充斥着众多的泛型定义。对于用 JavaScript 写成的包如 React，在使用时必须同时安装的包@types/react，其主要内容也是大量的类型和泛型定义，了解泛型不但有助于理解这些包的用法，这些包的源码结构也可以一目了然。这些，就是理解泛型运算的意义之所在。

参考资料
[1]https://mp.weixin.qq.com/s/oo3UGKf0NUSLGRzwRCruww
[2]TypeScript 官方文档: https://www.typescriptlang.org/docs/handbook/intro.html
[3]联合类型: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html
[4]字面量类型: https://www.typescriptlang.org/docs/handbook/literal-types.html
[5]索引签名: https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types-and-index-signatures


同时欢迎关注我的个人微信公众号：
{% img https://www.xuanbiyijue.com//img/%E5%85%AC%E4%BC%97%E5%8F%B7%E4%BA%8C%E7%BB%B4%E7%A0%81.jpg 300 300 %}
