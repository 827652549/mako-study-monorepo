# SWC 导入转换插件完整使用指南

## 📋 目录

- [项目概述](#项目概述)
- [文件结构](#文件结构)
- [核心概念](#核心概念)
- [函数参考](#函数参考)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

---

## 项目概述

这是一个 **SWC 导入转换插件** 的 TypeScript 实现，用于自动转换 JavaScript/TypeScript 导入语句，实现按需导入和优化打包体积。

### 核心功能

1. **路径转换** - 将导入路径从通用库转换为特定子路径
2. **成员名称转换** - 根据不同的命名规范转换导入成员名称
3. **样式自动导入** - 可选地自动添加组件样式导入
4. **保留特殊导入** - 默认导入和命名空间导入保持不变

### 应用场景

- Ant Design 按需导入
- Material-UI 组件优化
- 自定义组件库打包优化
- 任何支持子路径导入的库

---

## 文件结构

```
rust-demo/
├── src/
│   ├── lib.ts              # ⭐ 插件主文件（带完整注释）
│   └── lib.rs              # Rust 原始实现
├── examples/
│   └── usage.ts            # 使用示例和配置参考
├── tests/
│   └── transform.test.ts    # 测试用例
├── Cargo.toml              # Rust 项目配置
├── package.json            # Node.js 项目配置
├── tsconfig.json           # TypeScript 编译配置
├── README.ts.md            # TypeScript 版本说明
├── GUIDE.md                # 本文件
└── README.md               # 项目主说明
```

---

## 核心概念

### 1. 转换类型（TransformMember）

共 9 种转换类型，可组合使用：

| 类型 | 示例 | 说明 |
|------|------|------|
| `camel_case` | `userProfile` | 驼峰式 |
| `kebab_case` | `user-profile` | 短横线分隔 |
| `dashed_case` | `user-profile` | 同 kebab_case |
| `pascal_case` | `UserProfile` | 帕斯卡式 |
| `snake_case` | `user_profile` | 下划线分隔 |
| `upper_case` | `USERPROFILE` | 全大写 |
| `lower_case` | `userprofile` | 全小写 |
| `upper_first` | `UserProfile` | 首字母大写 |
| `lower_first` | `userProfile` | 首字母小写 |

### 2. 配置结构

```typescript
interface Config {
  config: {
    [importSource: string]: {
      transform: string;              // 路径模板
      member_transformers: string[];  // 转换器数组
      style?: string;                 // 可选样式路径
    }
  }
}
```

### 3. 转换过程

```
输入导入: import { UserProfile } from 'antd'
   ↓
1. 查找配置: antd → { transform: 'antd/es/${member}', member_transformers: ['kebab_case'] }
   ↓
2. 转换成员: UserProfile → user-profile
   ↓
3. 替换路径: antd/es/${member} → antd/es/user-profile
   ↓
4. 处理样式: 若配置有 style，自动创建样式导入
   ↓
输出导入: import UserProfile from 'antd/es/user-profile'
        import 'antd/es/user-profile/style'
```

---

## 函数参考

### 字符串转换函数

#### `camelCase(str: string): string`
**描述**: 转换为驼峰式大小写

**参数**:
- `str` - 输入字符串

**返回值**: 驼峰式字符串

**示例**:
```typescript
camelCase('user-profile')  // 'userProfile'
camelCase('UserProfile')   // 'userProfile'
```

#### `kebabCase(str: string): string`
**描述**: 转换为短横线分隔式

**参数**:
- `str` - 输入字符串

**返回值**: 短横线分隔的字符串

**示例**:
```typescript
kebabCase('userProfile')   // 'user-profile'
kebabCase('UserProfile')   // 'user-profile'
```

#### `pascalCase(str: string): string`
**描述**: 转换为帕斯卡式大小写

**参数**:
- `str` - 输入字符串

**返回值**: 帕斯卡式字符串

**示例**:
```typescript
pascalCase('user-profile')  // 'UserProfile'
pascalCase('user_profile')  // 'UserProfile'
```

#### `snakeCase(str: string): string`
**描述**: 转换为蛇形大小写

**参数**:
- `str` - 输入字符串

**返回值**: 蛇形字符串

**示例**:
```typescript
snakeCase('userProfile')   // 'user_profile'
snakeCase('UserProfile')   // 'user_profile'
```

#### `upperCase(str: string): string`
**描述**: 转换为全大写

**参数**:
- `str` - 输入字符串

**返回值**: 全大写字符串

**示例**:
```typescript
upperCase('userProfile')   // 'USERPROFILE'
```

#### `lowerCase(str: string): string`
**描述**: 转换为全小写

**参数**:
- `str` - 输入字符串

**返回值**: 全小写字符串

**示例**:
```typescript
lowerCase('UserProfile')   // 'userprofile'
```

#### `upperFirst(str: string): string`
**描述**: 首字母转换为大写

**参数**:
- `str` - 输入字符串

**返回值**: 首字母大写的字符串

**示例**:
```typescript
upperFirst('userProfile')  // 'UserProfile'
```

#### `lowerFirst(str: string): string`
**描述**: 首字母转换为小写

**参数**:
- `str` - 输入字符串

**返回值**: 首字母小写的字符串

**示例**:
```typescript
lowerFirst('UserProfile')  // 'userProfile'
```

### 核心转换函数

#### `transformImportPath(transform: string, member: string, memberTransformers: TransformMember[]): string`

**描述**: 转换导入路径

**参数**:
- `transform` - 路径模板，包含 `${member}` 占位符
- `member` - 导入成员名称
- `memberTransformers` - 转换器类型数组，按顺序应用

**返回值**: 转换后的导入路径

**示例**:
```typescript
transformImportPath(
  'antd/es/${member}',
  'Button',
  ['kebab_case']
)
// 返回: 'antd/es/button'

transformImportPath(
  '@lib/components/${member}',
  'MyComponent',
  ['kebab_case', 'lower_case']
)
// 返回: '@lib/components/my_component'
```

### 主插件函数

#### `transformPlugin(config: Config): Plugin`

**描述**: SWC 插件主函数

**参数**:
- `config` - 插件配置对象

**返回值**: SWC Plugin 对象

**示例**:
```typescript
const plugin = transformPlugin({
  config: {
    'antd': {
      transform: 'antd/es/${member}',
      member_transformers: ['kebab_case'],
      style: 'antd/es/${member}/style'
    }
  }
});
```

---

## 使用示例

### 示例 1: 基础使用 - Ant Design

```typescript
// 插件配置
const config = {
  config: {
    'antd': {
      transform: 'antd/es/${member}',
      member_transformers: ['kebab_case'],
      style: 'antd/es/${member}/style'
    }
  }
};

// 转换前
import { Button, Input, Form } from 'antd';

// 转换后
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Form from 'antd/es/form';
import 'antd/es/form/style';
```

### 示例 2: 多库配置

```typescript
const config = {
  config: {
    'antd': {
      transform: 'antd/es/${member}',
      member_transformers: ['kebab_case'],
      style: 'antd/es/${member}/style'
    },
    '@mui/material': {
      transform: '@mui/material/${member}',
      member_transformers: ['pascal_case']
    },
    '@company/components': {
      transform: '@company/components/${member}',
      member_transformers: ['kebab_case']
    }
  }
};
```

### 示例 3: .swcrc 配置

```json
{
  "jsc": {
    "experimental": {
      "plugins": [
        [
          "swc-plugin-transform-import",
          {
            "config": {
              "antd": {
                "transform": "antd/es/${member}",
                "member_transformers": ["kebab_case"],
                "style": "antd/es/${member}/style"
              }
            }
          }
        ]
      ]
    }
  }
}
```

### 示例 4: Next.js 配置

```javascript
// next.config.js
const nextConfig = {
  swcMinify: true,
  experimental: {
    swcPlugins: [
      [
        'swc-plugin-transform-import/lib/index.js',
        {
          config: {
            antd: {
              transform: 'antd/es/${member}',
              member_transformers: ['kebab_case'],
              style: 'antd/es/${member}/style'
            }
          }
        }
      ]
    ]
  }
};

module.exports = nextConfig;
```

---

## 最佳实践

### 1. 命名规范选择

**Ant Design**:
```typescript
member_transformers: ['kebab_case']  // Button → button
```

**Material-UI**:
```typescript
member_transformers: ['pascal_case'] // button → Button
```

**自定义库**:
```typescript
member_transformers: ['kebab_case']  // 按库的命名规范选择
```

### 2. 样式导入处理

```typescript
// 自动导入样式
{
  transform: 'antd/es/${member}',
  style: 'antd/es/${member}/style'
}

// 不自动导入样式
{
  transform: '@lib/components/${member}'
  // 不包含 style 属性
}
```

### 3. 调试技巧

```typescript
// 检查转换后的成员名称
console.debug(`transformed member is ${transformedMember}`);

// 验证路径转换
console.log(transformImportPath(
  'antd/es/${member}',
  'Button',
  ['kebab_case']
));
```

### 4. 性能优化

- **只配置需要转换的库** - 减少处理开销
- **选择合适的转换器** - 避免不必要的转换链
- **使用缓存** - SWC 会自动缓存转换结果

### 5. 测试覆盖

```typescript
// 测试基础转换
testCamelCase();
testKebabCase();

// 测试导入转换
testImportPathTransformation();

// 测试 AST 转换
testASTTransformation();

// 运行所有测试
runAllTests();
```

---

## 常见问题

### Q: 默认导入为什么不转换？
**A**: 默认导入通常是导入整个库，而不是特定组件。转换可能破坏功能。

### Q: 如何处理别名导入？
**A**: 别名导入（如 `import { Button as Btn }`）会自动处理，导入路径会转换，别名保留。

### Q: 支持动态导入吗？
**A**: 不支持。动态导入（`import()`）需要特殊处理，当前不在支持范围。

### Q: 可以组合多个转换器吗？
**A**: 可以！将多个转换器按顺序放在数组中：
```typescript
member_transformers: ['kebab_case', 'upper_case']
```

### Q: 如何禁用某个库的转换？
**A**: 从配置中移除该库的条目即可。

---

## 性能指标

| 指标 | Rust 版本 | TypeScript 版本 |
|------|----------|-----------------|
| 处理速度 | ⚡⚡⚡ | ⚡⚡ |
| 打包体积 | 小 | 中等 |
| 易用性 | 需编译 | 开箱即用 |
| 内存占用 | 低 | 中等 |

---

## 相关资源

- [SWC 官方文档](https://swc.rs/)
- [SWC 插件开发](https://swc.rs/docs/plugin)
- [Ant Design 按需加载](https://ant.design/docs/react/introduce#on-demand-load)
- [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)

---

## 许可证

MIT

---

## 更新日志

### v1.0.0 (2024)
- 初始发布
- 支持 9 种转换类型
- 支持样式导入
- 完整的 TypeScript 注释和文档
