# Visitor 模式深入理解

## 🎯 核心概念

### 什么是 Visitor？

**Visitor（访问者）** 是一种设计模式，用于在复杂的数据结构（如树或图）上执行操作，而无需改变数据结构本身。

在 SWC/AST 处理中，Visitor 用于**遍历和转换 AST（抽象语法树）**。

---

## 📊 可视化说明

### AST 结构示例

```
代码:
  import { Button } from 'antd'

AST 树:
  Program
    ├── ImportDeclaration
    │   ├── specifiers: [ImportSpecifier]
    │   │   └── imported: { type: 'Identifier', value: 'Button' }
    │   └── source: { value: 'antd' }
    └── (其他语句...)
```

### Visitor 遍历过程

```
遍历 AST:
  Program
    ↓ (visit)
  ImportDeclaration
    ↓ (visit)
  ImportSpecifier
    ↓ (visit)
  [执行转换操作]
```

---

## 🏗️ 两种 Visitor 类型

### 1. **Visit（只读）**
```typescript
trait Visit {
    fn visit_module(&mut self, node: &Module) {
        // 只读取，不修改
        println!("Reading module");
    }
}
```

**特点**:
- 只能读取 AST
- 不能修改节点
- 速度快，安全性高

**用途**:
- 代码分析
- 收集信息
- 检查规则

### 2. **VisitMut（可写）** ✅
```typescript
trait VisitMut {
    fn visit_mut_module(&mut self, node: &mut Module) {
        // 可以读取和修改
        node.body = transform(node.body);
    }
}
```

**特点**:
- 可以读取和修改 AST
- 会改变原始节点
- 用于代码转换

**用途**:
- **代码转换**（我们的使用场景）
- AST 优化
- 代码修改

---

## 💻 具体代码示例

### 在我们的插件中

```typescript
// 1. 定义 Visitor 对象
const visitor = {
  // 2. 访问模块节点
  Module(path) {
    // path 代表当前访问的 AST 节点
    const module = path.node;
    const transformedBody = [];

    // 3. 遍历模块中的所有语句
    for (const node of module.body) {
      // 4. 检查节点类型
      if (node.type === 'ImportDeclaration') {
        // 5. 执行转换操作
        const transformedNode = transformImport(node);
        transformedBody.push(transformedNode);
      }
    }

    // 6. 更新节点
    path.node.body = transformedBody;
  }
};
```

### 执行流程

```
┌─────────────────────┐
│   输入 TypeScript   │
│   代码字符串         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  SWC 解析器         │
│  转换为 AST         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   Visitor 开始      │
│   遍历 AST 节点     │
└──────────┬──────────┘
           │
       ┌───┴────┬─────────┬──────────┐
       ↓        ↓         ↓          ↓
     Program Imports Statements Others
       │        │         │          │
       └────┬───┴─────────┴──────────┘
            ↓
      ┌──────────────────┐
      │ Module()函数     │
      │ 处理导入声明     │
      │ 执行转换操作     │
      └────────┬─────────┘
               ↓
      ┌──────────────────┐
      │  转换后的 AST    │
      └────────┬─────────┘
               ↓
      ┌──────────────────┐
      │  代码生成器      │
      │  转换为代码      │
      └────────┬─────────┘
               ↓
      ┌──────────────────┐
      │  输出 JavaScript │
      │  代码字符串      │
      └──────────────────┘
```

---

## 🔄 Visitor 遍历示例

### 示例代码
```typescript
// 输入代码
const code = `
import { Button, Input } from 'antd';
import { Modal } from 'antd';
`;
```

### Visitor 访问顺序

```
1️⃣  访问 Program 节点
    │
2️⃣  ├─ 访问 ImportDeclaration (Button, Input)
    │   ├─ 检查导入源: 'antd' ✓
    │   ├─ 获取成员: ['Button', 'Input']
    │   ├─ 转换成员: ['button', 'input']
    │   └─ 生成新导入 ✓
    │
3️⃣  ├─ 访问 ImportDeclaration (Modal)
    │   ├─ 检查导入源: 'antd' ✓
    │   ├─ 获取成员: ['Modal']
    │   ├─ 转换成员: ['modal']
    │   └─ 生成新导入 ✓
    │
4️⃣  └─ 返回转换后的 AST
```

### 转换结果

```typescript
// 输出代码
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Modal from 'antd/es/modal';
import 'antd/es/modal/style';
```

---

## 📋 常见 Visitor 方法

在 SWC 中，常见的 Visitor 方法有：

```typescript
visitor: {
  // 模块级
  Module(path) { },              // 访问模块
  Program(path) { },             // 访问程序根节点

  // 导入导出
  ImportDeclaration(path) { },   // 访问导入声明
  ExportDeclaration(path) { },   // 访问导出声明

  // 语句
  IfStatement(path) { },         // 访问 if 语句
  ForStatement(path) { },        // 访问 for 循环
  FunctionDeclaration(path) { }, // 访问函数声明
  VariableDeclaration(path) { }, // 访问变量声明

  // 表达式
  CallExpression(path) { },      // 访问函数调用
  BinaryExpression(path) { },    // 访问二元表达式
  MemberExpression(path) { },    // 访问成员访问

  // 其他
  Identifier(path) { },          // 访问标识符
  StringLiteral(path) { },       // 访问字符串字面量
}
```

---

## 🎯 在我们插件中的应用

### 我们实现的 Visitor

```typescript
export default function transformPlugin(config: Config): Plugin {
  return {
    name: 'swc-plugin-transform-import',

    visitor: {
      // 只实现了 Module 访问器
      Module(path) {
        // 这是唯一需要的访问点
        // 因为所有导入都在模块的 body 中
      }
    }
  };
}
```

### 为什么只需要 Module？

```
Module 节点
├── body: [所有顶层语句]
    ├── ImportDeclaration ✓ (我们关心的)
    ├── FunctionDeclaration
    ├── ClassDeclaration
    ├── VariableDeclaration
    └── ...其他语句

// 我们通过 Module 访问器访问 body，
// 无需为每个导入单独编写访问器
```

---

## 🔍 Visitor 的工作原理

### 深度优先遍历（DFS）

```
AST:
    Program
    ├── Module
    │   ├── ImportDeclaration
    │   │   ├── Identifier
    │   │   └── StringLiteral
    │   └── FunctionDeclaration
    └── ...

遍历顺序:
1. Program
2. Module
3. ImportDeclaration
4. Identifier
5. StringLiteral
6. FunctionDeclaration
...
```

### 访问前后钩子

```typescript
visitor: {
  // 访问前调用
  enter(path) {
    console.log('Entering node:', path.node.type);
  },

  // 访问后调用
  exit(path) {
    console.log('Exiting node:', path.node.type);
  }
}
```

---

## 💡 Visitor vs 其他遍历方式

### 1. Visitor 模式（我们使用的）
```typescript
// ✅ 优点: 清晰、易维护、框架支持
visitor: {
  Module(path) { /* ... */ }
}
```

### 2. 递归遍历
```typescript
// ❌ 缺点: 手动管理递归
function traverse(node: any) {
  if (node.type === 'ImportDeclaration') {
    // 处理...
  }
  // 手动递归...
  traverse(node.body);
}
```

### 3. 迭代器模式
```typescript
// ❌ 缺点: 代码复杂，容易出错
const iterator = ast.iterator();
let node;
while ((node = iterator.next()) !== null) {
  // 处理...
}
```

---

## 🚀 实际应用场景

### 场景 1: 导入转换（我们的案例）
```typescript
visitor: {
  Module(path) {
    // 转换 importDeclaration
  }
}
```

### 场景 2: 变量重命名
```typescript
visitor: {
  Identifier(path) {
    if (path.node.value === 'oldName') {
      path.node.value = 'newName';
    }
  }
}
```

### 场景 3: 代码分析
```typescript
visitor: {
  CallExpression(path) {
    if (isFunctionCall(path.node)) {
      collectStatistics(path.node);
    }
  }
}
```

### 场景 4: 代码注入
```typescript
visitor: {
  FunctionDeclaration(path) {
    // 在函数开始处注入日志
    const logNode = createLogStatement();
    path.node.body.unshift(logNode);
  }
}
```

---

## 📚 相关概念

### AST（抽象语法树）
```
JavaScript 代码
    ↓ (解析)
AST 节点树
    ↓ (Visitor 遍历和转换)
修改后的 AST
    ↓ (生成)
JavaScript 代码
```

### Path 对象
```typescript
path: {
  node,              // 当前节点
  parent,            // 父节点
  parentPath,        // 父路径
  key,               // 在父节点中的键
  replaceWith(node), // 替换当前节点
  remove(),          // 移除当前节点
}
```

### Plugin（插件）
```typescript
interface Plugin {
  name: string;
  visitor: {
    [nodeType: string]: (path) => void
  }
}
```

---

## 🎓 总结

### Visitor 的三个关键点

1️⃣ **访问器模式**
   - 用于遍历树形结构
   - 无需改变数据结构本身
   - 将操作与数据分离

2️⃣ **在 SWC 中的应用**
   - 遍历 AST 节点
   - 执行代码转换
   - 通过 visitor 对象定义处理逻辑

3️⃣ **我们的实现**
   - 定义 Module visitor
   - 遍历导入声明
   - 转换导入路径和成员名称

### 执行流程总结
```
代码字符串 → 解析为 AST → Visitor 遍历转换 → 生成新代码
```

---

## 🔗 进阶阅读

### 相关文档
- [SWC 官方文档 - Visitor](https://swc.rs/docs)
- [AST 资源](https://astexplorer.net/) - 在线 AST 浏览器
- [Babel Plugin 开发](https://github.com/jamiebuilds/babel-handbook)

### 类似概念
- **Babel Plugins** - 基于相同的 Visitor 模式
- **Tree-walk Interpreter** - 编译器教科书中的概念
- **Design Pattern - Visitor** - Gang of Four 设计模式

---

## 💻 代码对比示例

### 不使用 Visitor（手动遍历）
```typescript
function transformImports(ast: any): any {
  if (ast.type === 'Module') {
    ast.body = ast.body.map((node: any) => {
      if (node.type === 'ImportDeclaration') {
        return transformImportDeclaration(node);
      }
      return node;
    });
  }
  return ast;
}
```

### 使用 Visitor（SWC 方式）
```typescript
const plugin: Plugin = {
  name: 'transform-import',
  visitor: {
    Module(path) {
      path.node.body = path.node.body.map(node => {
        if (node.type === 'ImportDeclaration') {
          return transformImportDeclaration(node);
        }
        return node;
      });
    }
  }
};
```

**比较**:
- 使用 Visitor 更声明式
- 框架自动处理遍历
- 代码更易读和维护

---

## ❓ 常见问题

### Q: Visitor 和递归的区别？
**A**: Visitor 是一种设计模式，框架负责遍历。递归需要手动管理遍历逻辑。

### Q: 为什么叫 VisitMut？
**A**: `Mut` 代表 Mutable（可变的），表示可以修改访问的节点。

### Q: 一个 Plugin 可以有多个 Visitor 吗？
**A**: 可以，visitor 对象可以有多个方法（每个节点类型一个）。

### Q: Visitor 的执行顺序？
**A**: 深度优先，从根节点开始，逐层递归访问。

### Q: 如何跳过某些节点？
**A**: 使用 `path.skip()` 方法（如果框架支持）。

---

## 🎯 总结

```
Visitor 就是一个访问者，
通过 visitor 对象定义的方法，
遍历 AST 的每个节点，
执行相应的转换操作，
最后返回修改后的 AST。

在我们的插件中：
Module(path) → 遍历导入 → 转换路径 → 返回修改后的 AST
```
