/**
 * SWC 导入转换插件使用示例
 *
 * 该文件展示了如何在实际项目中使用 swc-plugin-transform-import 插件
 */

import transformPlugin from '../src/lib';

// ============================================================================
// 示例 1: 基础使用 - Ant Design 按钮组件导入优化
// ============================================================================

/**
 * 配置 Ant Design 组件导入转换
 *
 * 目的：将 `import { Button } from 'antd'` 转换为
 *       `import Button from 'antd/es/button'`
 *
 * 这样可以实现按需加载，减小打包体积
 */
const antdConfig = {
  config: {
    'antd': {
      // 转换路径模板：${member} 会被替换为转换后的成员名称
      transform: 'antd/es/${member}',

      // 成员名称转换规则：将 MyButton 转换为 my-button，再改为 my_button
      member_transformers: ['kebab_case'],

      // 样式导入路径（可选）
      style: 'antd/es/${member}/style'
    }
  }
};

// 示例输入
const antdExample = `
import { Button, Input, Select } from 'antd';
import { DatePicker as DP } from 'antd';

export function MyComponent() {
  return <Button>Click me</Button>;
}
`;

// 转换后输出
const antdExpected = `
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import DP from 'antd/es/date-picker';
import 'antd/es/date-picker/style';

export function MyComponent() {
  return <Button>Click me</Button>;
}
`;

// ============================================================================
// 示例 2: 多个库配置
// ============================================================================

/**
 * 同时处理多个库的导入转换
 * 这是最实用的配置方案
 */
const multiLibraryConfig = {
  config: {
    // 配置 1: Ant Design
    'antd': {
      transform: 'antd/es/${member}',
      member_transformers: ['kebab_case'],
      style: 'antd/es/${member}/style'
    },

    // 配置 2: Material-UI
    '@mui/material': {
      transform: '@mui/material/${member}',
      member_transformers: ['pascal_case'] // MUI 使用 PascalCase
    },

    // 配置 3: 自定义组件库
    '@company/components': {
      transform: '@company/components/${member}',
      member_transformers: ['kebab_case'],
      style: '@company/components/${member}/index.css'
    }
  }
};

// ============================================================================
// 示例 3: 复杂的转换链
// ============================================================================

/**
 * 多个转换器按顺序应用
 * 示例：MyButton -> my-button -> my_button -> MY_BUTTON
 */
const complexTransformConfig = {
  config: {
    '@lib/components': {
      transform: '@lib/components/${member}',
      // member_transformers 数组中的转换器按顺序应用
      member_transformers: [
        'kebab_case',  // 第一步：MyButton -> my-button
        'snake_case',  // 第二步：my-button -> my_button
      ]
    }
  }
};

// ============================================================================
// 示例 4: 不同成员转换类型的对比
// ============================================================================

/**
 * 各种转换类型的效果演示
 */
const transformationComparison = {
  input: 'UserProfileCard',

  transformations: {
    camel_case: 'userProfileCard',
    kebab_case: 'user-profile-card',
    dashed_case: 'user-profile-card', // 同 kebab_case
    pascal_case: 'UserProfileCard',
    snake_case: 'user_profile_card',
    upper_case: 'USERPROFILECARD',
    lower_case: 'userprofilecard',
    upper_first: 'UserProfileCard',
    lower_first: 'userProfileCard'
  }
};

// ============================================================================
// 示例 5: SWC 配置文件 (.swcrc) 中的使用
// ============================================================================

/**
 * 在 .swcrc 配置文件中使用此插件
 *
 * 注意：实际使用时 plugin 路径应该指向编译后的 JavaScript 文件
 */
const swcrcExample = {
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "react": {
        "runtime": "automatic"
      }
    },
    "experimental": {
      "plugins": [
        [
          // 使用本插件
          "swc-plugin-transform-import",
          {
            // 配置对象
            "config": {
              "antd": {
                "transform": "antd/es/${member}",
                "member_transformers": ["kebab_case"],
                "style": "antd/es/${member}/style"
              },
              "@company/components": {
                "transform": "@company/components/${member}",
                "member_transformers": ["kebab_case"]
              }
            }
          }
        ]
      ]
    }
  },
  "module": {
    "type": "es6",
    "resolveFully": true
  }
};

// ============================================================================
// 示例 6: 在 Next.js 中的使用 (next.config.js)
// ============================================================================

/**
 * 在 Next.js 的 next.config.js 中配置 SWC 插件
 */
const nextConfigExample = `
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    swcPlugins: [
      [
        'swc-plugin-transform-import/lib/index.js',
        {
          config: {
            antd: {
              transform: 'antd/es/\${member}',
              member_transformers: ['kebab_case'],
              style: 'antd/es/\${member}/style'
            },
            '@company/components': {
              transform: '@company/components/\${member}',
              member_transformers: ['kebab_case']
            }
          }
        }
      ]
    ]
  }
};

module.exports = nextConfig;
`;

// ============================================================================
// 示例 7: webpack/babel 中的替代方案
// ============================================================================

/**
 * 如果不使用 SWC，可以使用 babel-plugin-import 作为替代
 * 虽然功能略有不同，但都是为了实现按需导入
 */
const babelAlternative = {
  description: '在 babel 中的替代插件：babel-plugin-import',

  babelConfig: {
    plugins: [
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true // 自动导入样式
        },
        'antd'
      ],
      [
        'import',
        {
          libraryName: '@company/components',
          libraryDirectory: 'lib'
        },
        '@company/components'
      ]
    ]
  }
};

// ============================================================================
// 示例 8: 转换前后对比
// ============================================================================

/**
 * 实际转换效果演示
 */
const beforeAfterComparison = {
  // 转换前（未优化）
  before: `
import { Button, Input, Form, Table } from 'antd';
import { DatePicker } from 'antd';

export function Dashboard() {
  return (
    <Form>
      <Form.Item label="Date">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Name">
        <Input />
      </Form.Item>
      <Button type="primary">Submit</Button>
    </Form>
  );
}
  `,

  // 转换后（已优化）
  after: `
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Form from 'antd/es/form';
import 'antd/es/form/style';
import Table from 'antd/es/table';
import 'antd/es/table/style';
import DatePicker from 'antd/es/date-picker';
import 'antd/es/date-picker/style';

export function Dashboard() {
  return (
    <Form>
      <Form.Item label="Date">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Name">
        <Input />
      </Form.Item>
      <Button type="primary">Submit</Button>
    </Form>
  );
}
  `
};

// ============================================================================
// 导出所有示例和配置
// ============================================================================

export {
  antdConfig,
  antdExample,
  antdExpected,
  multiLibraryConfig,
  complexTransformConfig,
  transformationComparison,
  swcrcExample,
  nextConfigExample,
  babelAlternative,
  beforeAfterComparison
};

/**
 * 总结和最佳实践
 *
 * 1. 配置方面
 *    - 为常用的组件库配置转换规则
 *    - 使用合适的成员转换器（通常是 kebab_case）
 *    - 配置样式导入路径（如果需要自动导入样式）
 *
 * 2. 性能优化
 *    - 这个插件可以显著减小打包体积
 *    - 避免导入整个库，而是按需导入组件
 *    - 自动导入组件样式，减少手动配置
 *
 * 3. 兼容性
 *    - 支持 TypeScript 和 JavaScript
 *    - 支持命名导入和默认导入
 *    - 默认导入和命名空间导入保持不变
 *
 * 4. 调试
 *    - 检查转换后的代码是否正确
 *    - 使用 console.debug 查看转换过程
 *    - 确保样式导入路径正确
 */
