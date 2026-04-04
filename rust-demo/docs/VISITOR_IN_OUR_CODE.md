# Visitor 在我们代码中的具体体现

## 🎯 我们代码中的 Visitor 位置

在 `src/lib.ts` 的这一行：

```typescript
// 第 332-350 行
export default function transformPlugin(config: Config): Plugin {
  const configs: TransformVisitorConfig = config.config || {};

  return {
    name: 'swc-plugin-transform-import',

    visitor: {  // ← 这就是 Visitor！
      /**
       * Module 访问器
       * 当 SWC 遍历到 Module 节点时调用
       */
      Module(path) {
        // ← 我们的处理逻辑
      }
    }
  };
}
```

---

## 📍 Visitor 对象的结构

```typescript
visitor: {
  // 访问器名称 = 节点类型
  Module(path) {
    // 当遇到 Module 节点时执行
  },

  // 如果有其他节点类型需要处理，可以添加更多访问器
  ImportDeclaration(path) {
    // 当遇到 ImportDeclaration 节点时执行
  },

  Identifier(path) {
    // 当遇到 Identifier 节点时执行
  }

  // ... 更多节点类型
}
```

---

## 🔍 Module 访问器详解

### 完整代码

```typescript
/**
 * Module 访问器
 * 遍历模块节点，处理导入声明
 *
 * @param {any} path - AST 路径对象
 */
Module(path) {
  // ════════════════════════════════════════
  // 第 1 部分: 获取节点信息
  // ════════════════════════════════════════
  const module = path.node;
  const transformedBody: any[] = [];

  // ════════════════════════════════════════
  // 第 2 部分: 遍历模块中的所有语句
  // ════════════════════════════════════════
  for (const node of module.body) {

    // 检查节点类型
    if (node.type === 'ImportDeclaration') {
      const importDecl = node;
      const importSource = importDecl.source.value;

      // ════════════════════════════════════════
      // 第 3 部分: 查找配置
      // ════════════════════════════════════════
      const importConfig = configs[importSource];

      if (importConfig) {
        // ════════════════════════════════════════
        // 第 4 部分: 检查导入类型
        // ════════════════════════════════════════
        // 跳过默认导入和命名空间导入
        const hasDefaultOrNamespace = importDecl.specifiers.some(
          (spec) =>
            spec.type === 'ImportDefaultSpecifier' ||
            spec.type === 'ImportNamespaceSpecifier'
        );

        if (!hasDefaultOrNamespace) {
          // ════════════════════════════════════════
          // 第 5 部分: 处理命名导入
          // ════════════════════════════════════════
          for (const spec of importDecl.specifiers) {
            if (spec.type === 'ImportSpecifier') {
              // 获取导入的成员名称
              const importedName =
                spec.imported?.type === 'StringLiteral'
                  ? spec.imported.value
                  : spec.imported?.value || '';

              // ════════════════════════════════════════
              // 第 6 部分: 转换导入路径
              // ════════════════════════════════════════
              const transformedPath = transformImportPath(
                importConfig.transform,
                importedName,
                importConfig.member_transformers
              );

              // ════════════════════════════════════════
              // 第 7 部分: 创建新导入
              // ════════════════════════════════════════
              const newImportDecl = {
                type: 'ImportDeclaration' as const,
                source: {
                  type: 'StringLiteral' as const,
                  value: transformedPath
                },
                specifiers: [
                  {
                    type: 'ImportSpecifier' as const,
                    imported:
                      spec.imported?.type === 'StringLiteral'
                        ? { type: 'StringLiteral' as const, value: spec.imported.value }
                        : { type: 'Identifier' as const, value: importedName },
                    local: spec.local,
                  },
                ],
              };

              transformedBody.push(newImportDecl);

              // ════════════════════════════════════════
              // 第 8 部分: 处理样式导入
              // ════════════════════════════════════════
              if (importConfig.style) {
                const styledPath = transformImportPath(
                  importConfig.style,
                  importedName,
                  importConfig.member_transformers
                );

                const styleImport = {
                  type: 'ImportDeclaration' as const,
                  source: { type: 'StringLiteral' as const, value: styledPath },
                  specifiers: [],
                };

                transformedBody.push(styleImport);
              }
            }
          }
        } else {
          // 有默认导入或命名空间导入，保持原样
          transformedBody.push(node);
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

  // ════════════════════════════════════════
  // 第 9 部分: 更新模块
  // ════════════════════════════════════════
  path.node.body = transformedBody;
}
```

---

## 🔄 执行流程图

```
输入:
  import { Button } from 'antd'
  import { Input } from 'antd'
  console.log('hello')

        ↓

SWC 解析为 AST:
  Module {
    body: [
      ImportDeclaration { specifiers: [{imported: 'Button'}], source: 'antd' },
      ImportDeclaration { specifiers: [{imported: 'Input'}], source: 'antd' },
      ExpressionStatement { /* console.log... */ }
    ]
  }

        ↓

SWC 遍历 AST:
  找到 Module 节点
  ↓
  调用 Module(path)

        ↓

我们的 Module 访问器执行:

  第 1 步: 获取模块
    module = {
      body: [ImportDeclaration, ImportDeclaration, ExpressionStatement]
    }

        ↓

  第 2 步: 遍历 module.body
    ┌─ 第 1 个: ImportDeclaration
    │  ├─ 第 3 步: 检查导入源 'antd'
    │  ├─ 第 4 步: 查找配置 (找到！)
    │  ├─ 第 5 步: 处理成员 'Button'
    │  ├─ 第 6 步: 转换 Button → button
    │  ├─ 第 6 步: 替换路径 → antd/es/button
    │  ├─ 第 7 步: 创建新导入
    │  └─ 第 8 步: 添加样式导入 → antd/es/button/style
    │
    ├─ 第 2 个: ImportDeclaration
    │  ├─ 类似处理...
    │  └─ 生成两条新导入（导入 + 样式）
    │
    └─ 第 3 个: ExpressionStatement
       └─ 非导入，保持原样

        ↓

  第 9 步: 更新模块
    path.node.body = [
      // 新的导入
      ImportDeclaration { source: 'antd/es/button', ... },
      ImportDeclaration { source: 'antd/es/button/style', ... },
      ImportDeclaration { source: 'antd/es/input', ... },
      ImportDeclaration { source: 'antd/es/input/style', ... },
      // 原始的其他语句
      ExpressionStatement { /* console.log... */ }
    ]

        ↓

转换完成！

        ↓

输出:
  import Button from 'antd/es/button'
  import 'antd/es/button/style'
  import Input from 'antd/es/input'
  import 'antd/es/input/style'
  console.log('hello')
```

---

## 💡 关键点详解

### 关键点 1: path 对象

```typescript
Module(path) {
  // path 包含以下信息：
  path.node      // ← 当前节点 (Module)
  path.parent    // ← 父节点 (Program)
  path.parentPath // ← 父路径
  path.key       // ← 在父节点中的键名
}
```

### 关键点 2: for 循环的作用

```typescript
for (const node of module.body) {
  // module.body 包含模块中的所有语句
  // 例如：
  // - ImportDeclaration (我们关心的)
  // - FunctionDeclaration
  // - VariableDeclaration
  // - 等等...

  // 我们通过这个循环逐个检查，
  // 只处理 ImportDeclaration，其他的保留原样
}
```

### 关键点 3: if-else 的分支

```typescript
if (node.type === 'ImportDeclaration') {
  // 这是导入声明，需要处理
} else {
  // 这是其他语句，原样保留
  transformedBody.push(node);
}
```

### 关键点 4: 配置查找

```typescript
const importConfig = configs[importSource];
// configs 是从插件配置传入的对象：
// {
//   'antd': { transform: '...', member_transformers: [...] },
//   '@mui/material': { ... }
// }

if (importConfig) {
  // 这个导入源在配置中，需要转换
} else {
  // 不在配置中，保持原样
}
```

---

## 🎯 为什么只有 Module 访问器？

### 其他访问器不需要

```
场景 1: 为每个 ImportDeclaration 创建访问器
✗ 复杂：需要维护多个访问器
✗ 低效：遍历每个导入都要调用函数

场景 2: 只用 Module 访问器（我们的做法）
✓ 简洁：一个访问器，集中处理
✓ 高效：一次循环处理所有导入
✓ 清晰：逻辑集中在一个地方
```

### 代码对比

```typescript
// ❌ 如果为每个 ImportDeclaration 创建访问器
visitor: {
  ImportDeclaration(path) {
    // 处理单个导入
    // 但需要重复编写逻辑
  }
}

// ✅ 我们的做法：只用 Module
visitor: {
  Module(path) {
    // 一次性处理所有导入
    for (const node of path.node.body) {
      if (node.type === 'ImportDeclaration') {
        // 处理
      }
    }
  }
}
```

---

## 🔗 与其他部分的关系

### Module 访问器调用的函数

```
Module(path)
  ↓
  调用 transformImportPath()
    ↓
    调用 kebabCase() / camelCase() 等转换函数
    ↓
    返回转换后的路径

  ↓
  创建新的 ImportDeclaration 节点
  ↓
  添加到 transformedBody 数组
```

### 完整的调用链

```
transformPlugin() 返回 Plugin
  ↓
Plugin.visitor.Module(path) 被 SWC 调用
  ↓
Module(path) 遍历 module.body
  ↓
遇到 ImportDeclaration
  ↓
调用 transformImportPath()
  ↓
调用字符串转换函数（camelCase 等）
  ↓
返回转换后的路径
  ↓
创建新导入
  ↓
添加到 transformedBody
  ↓
更新 path.node.body
  ↓
SWC 生成新代码
```

---

## 📊 Visitor 执行时机表

| 阶段 | 发生什么 |
|------|---------|
| 1. 输入 | 用户提供代码字符串 |
| 2. 解析 | SWC 解析为 AST |
| 3. 遍历开始 | SWC 从根节点开始遍历 |
| 4. **遇到 Module** | **SWC 调用 Module(path)** |
| 5. **我们执行逻辑** | **Module 函数中的代码运行** |
| 6. 遍历继续 | SWC 继续遍历其他节点 |
| 7. 遍历结束 | SWC 处理完所有节点 |
| 8. 生成代码 | SWC 从修改后的 AST 生成代码 |
| 9. 输出 | 返回转换后的代码 |

---

## 🎓 总结

```
Visitor 模式在我们的代码中：

1. 定义了一个 visitor 对象
   visitor: { Module(path) { ... } }

2. 定义了一个 Module 访问器
   当 SWC 遍历到 Module 节点时调用

3. Module 访问器的职责：
   - 遍历模块中的所有语句
   - 找出导入声明
   - 转换导入的路径和成员名
   - 返回修改后的 AST

4. SWC 的职责：
   - 解析代码为 AST
   - 遍历 AST
   - 调用访问器函数
   - 生成新代码

分工合作，各司其职！
```

---

## 🚀 实践建议

### 如何调试 Module 访问器

```typescript
Module(path) {
  // 1. 打印节点信息
  console.log('Module node:', path.node);

  // 2. 打印 body 长度
  console.log('Number of statements:', path.node.body.length);

  // 3. 打印每个语句的类型
  for (const node of path.node.body) {
    console.log('Statement type:', node.type);
  }

  // 4. 打印导入源
  for (const node of path.node.body) {
    if (node.type === 'ImportDeclaration') {
      console.log('Import from:', node.source.value);
    }
  }
}
```

### 如何扩展功能

```typescript
// 如果要处理其他节点类型，可以添加更多访问器

visitor: {
  Module(path) {
    // 处理模块级别的转换
  },

  ImportDeclaration(path) {
    // 如果需要单独处理每个导入
  },

  FunctionDeclaration(path) {
    // 如果需要处理函数
  }
}
```

---

这就是 Visitor 在我们代码中的具体实现！理解了这部分，你就完全理解了整个插件的核心逻辑。🎉
