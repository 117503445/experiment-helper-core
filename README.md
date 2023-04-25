# experiment-helper-core

XDU 物理实验计算器 核心计算逻辑

## 使用方法

安装依赖

```sh
yarn add @t117503445/experiment-helper-core
```

以下为 [experiment-helper-mobile](https://github.com/117503445/experiment-helper-mobile) 使用此库的主要流程

```js
import { Binder, experiments } from "@t117503445/experiment-helper-core";

// experiments.experiments 为包含了实验的 map，key 为实验名，value 为 实验定义文件

let experiment = experiments.experiments["单线扭摆实验"]; // 读取 单线扭摆实验 的实验定义文件
let binder = new Binder.Binder(experiment); // 初始化 单线扭摆实验 的 binder

let items = binder.getLabItems(tableInputHasDefaultValue = true); // 获取 单线扭摆实验 的元素信息。
// tableInputHasDefaultValue 参数表示 table 组件中 变量输入格 是否有 default
// 初始化时，传入 true。实现一键清空时，传入 false。

// 前端把 items 渲染成控件，并保证 items 和 控件保持同步

// 用户填写数据，点击计算

items = binder.calculateLabItems(items); // 调用计算逻辑，改变 items，控件上显示计算结果
```

## 开发环境配置

> 推荐基于 VSCode 的 [Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) 功能进行开发

安装依赖

```sh
yarn
```

运行单元测试, 可以在 `tmp` 文件夹进一步查看输出

```sh
yarn test
```

版本发布

```sh
yarn version --major # break change
yarn version --minor # feature
yarn version --patch # bug fix
```

## 架构

在前一版物理实验计算器中，我们的开发方法是为每一个实验新建一个页面，然后在页面中放上输入框和表格，再在计算按钮中编写实验计算的逻辑，包含读取、解析、计算、输出等操作。但是这种开发模式带来了大量的代码冗余，且计算逻辑与用户界面高度耦合，导致前期开发进度慢、后期维护难度大。

为了解决上述问题，在本版物理实验计算器中，设计了一种面向物理量的、基于 JSON 的实验定义语法。每个实验通过 1 个 JSON 文件进行定义，在 JSON 中包含了物理量的计算逻辑及与用户界面的绑定逻辑。这种方法解耦了计算逻辑和用户界面。当需要添加物理实验时，开发者只需要添加新的 JSON 文件，而不需要再去改代码。实践表明，这种方法带来了 3 倍左右的开发速度提升，在后续一年半的维护阶段中也能做到问题的快速修复。

`experiment-helper-core` 主要是提供了实验定义文件及实验定义文件至抽象控件(items)的转换方法。

## 实验定义语法

[debug.json](https://github.com/117503445/experiment-helper-core/blob/main/res/experiments/debug.json) 是一个示例实验定义文件，以下以此为例说明实验定义语法。也可以参考其他真实实验，对照实验定义文件和 [experiment-helper](https://experiment-helper.wizzstudio.com) 上的界面进行理解。

注释只用于辅助理解，实际的实验定义语法不能包含注释。

大致结构包含 `meta`, `logic`, `ui` 块。

```json
{
    "meta": {},
    "logic": {},
    "ui": {}
}
```

### meta

`meta` 块包含实验的元信息。目前 `experiment-helper-mobile` 没有使用到这部分信息。

```jsonc
{
  "meta": {
    "name": "dev", // 实验名称
    "author": "117503445", // 文件创建者
    "contributors": [], // 贡献者列表
    "version": "0.0.1", // 版本
    "LastEditTime": "2021-10-29 21:13" // 最近编辑时间
  }
}
```

### logic

`logic` 块面向物理量，定义了计算逻辑。具体的，需要定义每个物理量的名称和来源。来源可以是常数、用户输入、已有物理量的数学表达式。

```jsonc
{
  "logic": {
    // functions 自定义函数，适用于复杂逻辑
    "functions": {
      // 添加 addIndex 函数，value 为函数体，支持 js 语法
      "addIndex": "(function(arr){var arr_r = [];for (var i = 0; i < 3; i++) {arr_r.push(parseFloat(arr[i])+i);}return arr_r;})"
    },
    // variables 定义变量
    "variables": [
      {
        "name": "a", // 物理量名 a
        "comment": "", // a 的注释
        
        // a 的来源
        "source": {
          "type": "input", // a 来自用户输入
          "default": 5 // 用户没有输入时，a 的默认值为 5
        }
      },
      {
        "name": "b",
        "comment": "",
        "source": {
          "type": "input",
          // b 的默认值为 [0.1, 0.2, 0.3]，说明物理量b 是个向量，对应表格中的一行 / 一列
          "default": [ 0.1, 0.2, 0.3]
        }
      },
      {
        "name": "c",
        "comment": "",
        "source": {
          "type": "input",
          "default": [ 0.0001, 0.0002, 0.0003]
        }
      },
      {
        "name": "d",
        "comment": "",
        "source": {
          "type": "mathjs", // 物理量 d 由 mathjs 表达式计算得出
          "expression": "a*b+c" // d 的表达式，支持向量式语法，详细语法见 mathjs 库
        }
      },
      {
        "name": "d_a",
        "comment": "d 平均值", 
        "source": {
          "type": "mathjs-suffix" // 基于后缀进行计算。变量名为 d_a，就会拆解为 d _a，然后去计算 d 的平均值
          // mathjs-suffix 相当于语法糖。因为此类操作非常频繁，所以 core 提供了便捷操作，就不需要自己写表达式了。
          // 物理量名 _a 结尾，会计算物理量的平均值； 物理量名 _ua 结尾，会计算物理量的 A 类不确定度
        }
      },
      {
        "name": "e",
        "comment": "",
        "source": {
          "type": "mathjs",
          "expression": "addIndex(d)" // 使用自定义函数 addIndex
        }
      },
      {
        "name": "f",
        "comment": "测试 保留 位数",
        "source": {
          "type": "mathjs",
          "expression": "1 + 2" // 尽管在 logic 中，该物理量为整数。但是在 ui 中可以控制小数位数
        }
      }
    ]
  }
}
```

### ui

`ui` 块定义了物理量到抽象控件(items)的映射逻辑。每个 `item` 也会从上往下进行渲染。

```jsonc
{
  "ui": [
    {
      "type": "textbox", // 平淡无奇的文字
      "properties": {
        "text": "dev" // 文字内容为 dev
      }
    },
    {
      "type": "input", // 输入框
      "properties": {
        "variableName": "a", // 绑定 logic 中的物理量 a
        "frontText": "a = ", // 输入框前的文字
        "backText": "m" // 输入框后的文字，一般为单位
      }
    },
    {
      "type": "tablehead", // 表格标题
      "properties": {
        "text": "demo 表格" // 表格标题内容
      }
    },
    {
      "type": "table", // 输入表格
      "properties": {
        "width": 3, // 宽 3 格
        "height": 5, // 高 5 格

        // binds 定义了某一条格子上是什么东西
        "binds": [
          {
            "type": "constant", // 常量
            "value": [
              "①",
              "②",
              "③"
            ],
            // start end 表示坐标，先高再宽
            "start": [1, 1], // 从表格的 (1, 1) 开始
            "end": [1, 3] // 到表格的 (1, 3) 结束
          },
          {
            "type": "variable", // logic 中的物理量
            "name": "b", // 物理量 b
            "start": [2, 1],
            "end": [2, 3]
          },
          {
            "type": "variable",
            "name": "c",
            "start": [3, 1],
            "end": [3, 3]
          },
          {
            "type": "variable",
            "name": "d",
            "start": [4, 1],
            "end": [4, 3]
          },
          {
            "type": "variable",
            "name": "e",
            "start": [5, 1],
            "end": [5, 3]
          }
        ]
      }
    },
    {
      "type": "output", // 输出文本框
      "properties": {
        "variableName": "d_a", // 物理量 d_a
        "frontText": "d_a = ", // 前面的文字
        "backText": "m" // 后面的文字
      }
    },
    {
      "type": "image", // 图片
      "properties": {
        // 图片的 URL
        "src": "https://experiment-helper-static.oss-cn-hangzhou.aliyuncs.com/images/公式/三棱镜顶角的测量.png"
      }
    },
    {
      "type": "output",
      "properties": {
        "variableName": "f",
        "frontText": "f = ",
        "backText": "",
        "precision": 2 // 保留 2 位小数
      }
    }
  ]
}
```

## 开源协议

此代码库使用 [MIT](./LICENSE) 协议。使用者可以自由的部署、修改、分发代码，但需在 `关于` 等界面中声明 `WizzStudio` 的原创性。也欢迎提 PR。
