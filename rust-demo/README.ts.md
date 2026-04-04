# SWC Plugin: Transform Import (TypeScript 版本)

这是原始 Rust 版本的 TypeScript 实现。

## 概述

这个插件用于转换 JavaScript/TypeScript 导入语句的路径和成员名称。

## 功能

- 自动转换导入成员名称（驼峰、kebab、帕斯卡等）
- 支持样式导入分离
- 基于导入源的配置化转换

## 使用示例

```typescript
import transformPlugin from 'swc-plugin-transform-import';

const config = {
  config: {
    '@mylib/components': {
      transform: '@mylib/components/{{member}}',
      member_transformers: ['kebab_case'],
      style: '@mylib/components/{{member}}/style'
    }
  }
};

// 使用示例：
// 输入: import { UserProfile } from '@mylib/components'
// 输出:
//   import { UserProfile } from '@mylib/components/user-profile'
//   import '@mylib/components/user-profile/style'
```

## 支持的转换类型

- `camel_case` - camelCase
- `kebab_case` / `dashed_case` - kebab-case
- `pascal_case` - PascalCase
- `snake_case` - snake_case
- `upper_case` - UPPERCASE
- `lower_case` - lowercase
- `upper_first` - Uppercase
- `lower_first` - lowercase

## 与 Rust 版本的区别

| 特性 | Rust | TypeScript |
|------|------|-----------|
| 编译目标 | WebAssembly (WASM) | JavaScript/Node.js |
| 性能 | 更快 | 稍慢 |
| 依赖 | swc_core | @swc/core |
| 代码体积 | 小 | 较大 |
| 易用性 | 需要编译 | 开箱即用 |

## 编译

```bash
pnpm install
pnpm build
```

## 类型定义

- `TransformMember` - 支持的转换类型
- `TransformVisitorSubConfig` - 单个配置对象
- `TransformVisitorConfig` - 完整配置映射
- `Config` - 插件配置接口

## 实现细节

### 核心逻辑

1. 遍历 AST 中的所有模块项
2. 找到导入声明（ImportDeclaration）
3. 检查导入源是否在配置中
4. 如果在配置中，对每个命名导入进行转换
5. 创建新的导入声明，使用转换后的路径
6. 如果配置有样式路径，创建对应的样式导入

### 转换成员名称

使用 `voca_rs` 库的对应函数（在 TypeScript 中自行实现）：

```typescript
// 例子：'UserProfile' -> 'user-profile' (kebab_case)
transformImportPath(
  '@mylib/components/{{member}}',
  'UserProfile',
  ['kebab_case']
)
// 结果: '@mylib/components/user-profile'
```

## 注意事项

- 仅处理命名导入，跳过默认导入和命名空间导入
- 支持 ESM 和 CommonJS
- 可以与其他 SWC 插件组合使用
