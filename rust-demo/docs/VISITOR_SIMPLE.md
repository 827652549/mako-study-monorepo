# Visitor 简单版理解（5分钟快速入门）

## 🎯 一句话定义

**Visitor = 访问者 = 走遍树上所有节点，在每个节点做一些事情**

---

## 📊 最简单的类比

### 类比 1: 导游和博物馆

```
博物馆 = AST (抽象语法树)
房间 = 节点 (Node)
导游 = Visitor (访问者)

导游的工作:
  进入 第1个房间 (Module)
    ↓
  进入 第2个房间 (ImportDeclaration)
    ↓
  进入 第3个房间 (Identifier)
    ↓
  [在这个房间做某些事情，比如修改内容]
    ↓
  返回上一个房间
    ↓
  继续访问其他房间...
```

### 类比 2: 邮递员送信

```
代码 = 有很多房间的大楼
邮递员 = Visitor
信件 = 要执行的操作

邮递员的工作:
  1. 进入大楼 (Module)
  2. 逐个房间访问 (遍历 AST)
  3. 在特定房间送信 (执行操作)
  4. 离开大楼
```

---

## 🔍 用简单代码看 Visitor

### 我们的代码核心部分

```typescript
export default function transformPlugin(config: Config): Plugin {
  return {
    name: 'swc-plugin-transform-import',

    // 👇 这就是 Visitor！
    visitor: {
      // Module = 模块节点（整个文件）
      Module(path) {
        // path = 当前节点的信息
        const module = path.node;

        // 处理模块内的所有导入
        for (const node of module.body) {
          if (node.type === 'ImportDeclaration') {
            // 👇 对导入做转换
            transform(node);
          }
        }
      }
    }
  };
}
```

### 它的工作流程

```
1. 代码进来
   import { Button } from 'antd'

2. SWC 转换成 AST
   Module
   └── ImportDeclaration
       ├── member: 'Button'
       └── source: 'antd'

3. Visitor 访问 Module 节点
   Module(path) {
     // path.node 就是上面的 Module
   }

4. 在 visitor 中，遍历 ImportDeclaration
   for (const node of module.body) {
     if (node.type === 'ImportDeclaration') {
       // 转换 Button → button
       // 转换路径 antd → antd/es/button
     }
   }

5. 返回转换后的代码
   import Button from 'antd/es/button'
   import 'antd/es/button/style'
```

---

## 🏗️ Visitor 的三个层级

### 第1层: 框架层
```typescript
// SWC 自动做的事
SWC {
  1. 解析代码成 AST
  2. 遍历 AST 的每个节点
  3. 调用对应的 visitor 函数
  4. 生成新代码
}
```

### 第2层: 框架调用
```typescript
// 当遇到 Module 节点时，SWC 自动调用
Module(path) {
  // 你的代码在这里执行
}
```

### 第3层: 你的代码
```typescript
Module(path) {
  // 你在这里处理 Module 节点
  const module = path.node;
  // 修改 module
  // 返回修改后的结果
}
```

---

## 🎬 执行动画

### Step by Step 过程

```
输入代码:
  import { Button } from 'antd'

          ↓

SWC 解析:
  Module {
    body: [
      ImportDeclaration {
        specifiers: [ImportSpecifier],
        source: { value: 'antd' }
      }
    ]
  }

          ↓

Visitor 开始访问:

  visitor: {
    Module(path) {  ← 我们的 Module 访问器被调用
      console.log("进入 Module")

      for (const node of path.node.body) {
        if (node.type === 'ImportDeclaration') {
          console.log("找到导入！")
          // 转换导入
        }
      }
    }
  }

          ↓

转换逻辑执行:

  成员: Button
  源: antd

  ↓ (转换成员)

  button (kebab_case)

  ↓ (替换路径)

  antd/es/button

          ↓

输出代码:
  import Button from 'antd/es/button'
  import 'antd/es/button/style'
```

---

## 💡 Visitor 的关键点

### 1️⃣ 自动遍历
```
你不需要写:
  function traverse(node) {
    traverse(node.left);
    traverse(node.right);
  }

SWC 自动做这些，你只需定义 visitor
```

### 2️⃣ 访问特定节点
```
不同的节点类型有对应的访问器:

visitor: {
  Module(path) { },           // 访问模块
  ImportDeclaration(path) { }, // 访问导入
  Identifier(path) { },        // 访问标识符
}
```

### 3️⃣ 修改节点
```
path.node 就是当前节点，可以直接修改:

Module(path) {
  path.node.body = transformBody(path.node.body);
  // ✅ 修改成功
}
```

---

## 🎯 我们的 Module Visitor 做了什么

```typescript
Module(path) {
  // 1. 获取模块节点
  const module = path.node;

  // 2. 创建转换后的节点列表
  const transformedBody = [];

  // 3. 遍历模块中的每条语句
  for (const node of module.body) {

    // 4. 识别导入声明
    if (node.type === 'ImportDeclaration') {
      const importSource = node.source.value; // 'antd'

      // 5. 检查是否在配置中
      const config = configs[importSource]; // 找到配置

      if (config) {
        // 6. 对每个导入的成员进行转换
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier') {
            const memberName = spec.imported.value; // 'Button'

            // 7. 转换成员名称
            const transformedName = kebabCase(memberName); // 'button'

            // 8. 替换路径
            const newPath = config.transform.replace(
              '${member}',
              transformedName
            ); // 'antd/es/button'

            // 9. 创建新导入声明
            const newImport = createNewImport(newPath, spec.local);

            // 10. 添加到转换列表
            transformedBody.push(newImport);

            // 11. 如果有样式配置，添加样式导入
            if (config.style) {
              const styleImport = createStyleImport(config.style, transformedName);
              transformedBody.push(styleImport);
            }
          }
        }
      } else {
        // 导入源不在配置中，保持原样
        transformedBody.push(node);
      }
    } else {
      // 非导入语句，保持原样
      transformedBody.push(node);
    }
  }

  // 12. 更新模块的 body
  path.node.body = transformedBody;
}
```

---

## 🔄 对比：Visitor vs 手写遍历

### ❌ 不用 Visitor（复杂）
```typescript
function traverse(node) {
  if (node.type === 'Module') {
    node.body = node.body.map(child => traverse(child));
  }
  if (node.type === 'ImportDeclaration') {
    // 处理导入
  }
  if (node.type === 'FunctionDeclaration') {
    // 处理函数
  }
  // 还要处理更多节点...
  return node;
}

const result = traverse(ast);
```

### ✅ 用 Visitor（简洁）
```typescript
const plugin = {
  visitor: {
    Module(path) {
      // 只处理需要的节点
    }
  }
};

// SWC 自动处理所有遍历逻辑
```

---

## 📚 记住这个流程

```
代码
  ↓
SWC 解析为 AST
  ↓
SWC 遍历 AST，对每个节点调用对应的 visitor
  ↓
Module(path) ← 我们的 visitor 被调用
  ↓
  我们在这里修改节点
  ↓
SWC 继续遍历，处理其他节点
  ↓
修改后的 AST
  ↓
SWC 生成新代码
  ↓
输出代码
```

---

## ✨ 总结

```
Visitor 就是：

对代码的结构 (AST) 做一次有组织的遍历，
在遍历的过程中，
对特定类型的节点进行特定的操作。

在我们的例子中：
- 遍历模块的所有语句
- 找出导入声明
- 转换导入的成员名称和路径
- 返回修改后的代码
```

---

## 🎓 三个关键词

| 词 | 意思 | 例子 |
|----|------|------|
| **Visitor** | 访问者，遍历树的工具 | Module(path) { } |
| **Node** | 树上的节点 | ImportDeclaration, Identifier |
| **Path** | 指向节点的指针，包含节点信息 | path.node, path.parent |

---

## 🚀 实用建议

### 学习 Visitor 的方法

1. **理解 AST 结构**
   - 用 https://astexplorer.net/ 看代码的 AST
   - 了解有哪些节点类型

2. **定义 Visitor 函数**
   ```typescript
   visitor: {
     YourNodeType(path) {
       // 处理这个节点类型
     }
   }
   ```

3. **在函数中修改节点**
   ```typescript
   path.node.someProperty = newValue;
   ```

4. **测试转换结果**
   ```typescript
   // 检查输出代码是否正确
   ```

### 调试技巧

```typescript
Module(path) {
  // 打印节点信息
  console.log('Module node:', path.node);

  // 打印某个字段
  console.log('Body:', path.node.body);

  // 检查节点类型
  console.log('Type:', path.node.body[0].type);
}
```

---

这就是 Visitor！理解了这个概念，你就理解了整个插件的工作原理。🎉
