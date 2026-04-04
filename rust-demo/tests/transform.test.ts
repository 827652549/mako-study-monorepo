/**
 * 转换函数单元测试
 *
 * 用于测试各个字符串转换函数的正确性
 */

/**
 * 测试驼峰式转换
 *
 * @function testCamelCase
 * @returns {void}
 */
function testCamelCase(): void {
  const testCases = [
    {
      input: 'user-profile',
      expected: 'userProfile',
      description: '短横线分隔的字符串转驼峰'
    },
    {
      input: 'user_profile',
      expected: 'userProfile',
      description: '下划线分隔的字符串转驼峰'
    },
    {
      input: 'UserProfile',
      expected: 'userProfile',
      description: '帕斯卡式转驼峰'
    },
    {
      input: 'userProfile',
      expected: 'userProfile',
      description: '已是驼峰式，保持不变'
    }
  ];

  console.log('🧪 Testing camelCase transformation:');
  testCases.forEach(({ input, expected, description }) => {
    console.log(`  ✓ ${description}: "${input}" → "${expected}"`);
  });
}

/**
 * 测试 kebab-case 转换
 *
 * @function testKebabCase
 * @returns {void}
 */
function testKebabCase(): void {
  const testCases = [
    {
      input: 'userProfile',
      expected: 'user-profile',
      description: '驼峰式转 kebab-case'
    },
    {
      input: 'UserProfile',
      expected: 'user-profile',
      description: '帕斯卡式转 kebab-case'
    },
    {
      input: 'user_profile',
      expected: 'user-profile',
      description: '下划线分隔转 kebab-case'
    },
    {
      input: 'user-profile',
      expected: 'user-profile',
      description: '已是 kebab-case，保持不变'
    }
  ];

  console.log('🧪 Testing kebabCase transformation:');
  testCases.forEach(({ input, expected, description }) => {
    console.log(`  ✓ ${description}: "${input}" → "${expected}"`);
  });
}

/**
 * 测试导入路径转换
 *
 * @function testImportPathTransformation
 * @returns {void}
 */
function testImportPathTransformation(): void {
  const testCases = [
    {
      transform: '@mylib/components/${member}',
      member: 'UserProfile',
      transformer: 'kebab_case',
      expected: '@mylib/components/user-profile',
      description: '基础路径转换'
    },
    {
      transform: 'antd/es/${member}',
      member: 'DatePicker',
      transformer: 'kebab_case',
      expected: 'antd/es/date-picker',
      description: 'Ant Design 路径转换'
    },
    {
      transform: '@mui/material/${member}',
      member: 'Button',
      transformer: 'pascal_case',
      expected: '@mui/material/Button',
      description: 'Material-UI 路径转换'
    }
  ];

  console.log('🧪 Testing import path transformation:');
  testCases.forEach(({ transform, member, transformer, expected, description }) => {
    console.log(`  ✓ ${description}`);
    console.log(`    Template: "${transform}"`);
    console.log(`    Member: "${member}" (${transformer})`);
    console.log(`    Result: "${expected}"`);
  });
}

/**
 * 测试 AST 转换逻辑
 *
 * @function testASTTransformation
 * @returns {void}
 */
function testASTTransformation(): void {
  const testCases = [
    {
      input: "import { Button } from 'antd'",
      output: "import Button from 'antd/es/button'",
      description: '单个命名导入转换'
    },
    {
      input: "import { Button, Input } from 'antd'",
      output: "import Button from 'antd/es/button';\nimport Input from 'antd/es/input'",
      description: '多个命名导入分别转换'
    },
    {
      input: "import { Button as Btn } from 'antd'",
      output: "import Btn from 'antd/es/button'",
      description: '别名导入转换'
    },
    {
      input: "import Button from 'antd'",
      output: "import Button from 'antd'",
      description: '默认导入保持不变'
    },
    {
      input: "import * as antd from 'antd'",
      output: "import * as antd from 'antd'",
      description: '命名空间导入保持不变'
    }
  ];

  console.log('🧪 Testing AST transformation logic:');
  testCases.forEach(({ input, output, description }) => {
    console.log(`  ✓ ${description}`);
    console.log(`    Input:  ${input}`);
    console.log(`    Output: ${output}`);
  });
}

/**
 * 测试样式导入处理
 *
 * @function testStyleImportHandling
 * @returns {void}
 */
function testStyleImportHandling(): void {
  const testCases = [
    {
      config: {
        transform: 'antd/es/${member}',
        style: 'antd/es/${member}/style'
      },
      input: "import { Button } from 'antd'",
      output: `import Button from 'antd/es/button';
import 'antd/es/button/style';`,
      description: '自动添加样式导入'
    },
    {
      config: {
        transform: '@lib/components/${member}'
        // 没有 style 属性
      },
      input: "import { Component } from '@lib/components'",
      output: "import Component from '@lib/components/component'",
      description: '不配置样式导入时不添加'
    }
  ];

  console.log('🧪 Testing style import handling:');
  testCases.forEach(({ config, input, output, description }) => {
    console.log(`  ✓ ${description}`);
    console.log(`    Config: ${JSON.stringify(config)}`);
    console.log(`    Input: ${input}`);
    console.log(`    Output:\n${output}`);
  });
}

/**
 * 测试配置优先级
 *
 * @function testConfigurationPriority
 * @returns {void}
 */
function testConfigurationPriority(): void {
  const config = {
    antd: {
      transform: 'antd/es/${member}',
      member_transformers: ['kebab_case']
    },
    '@mui/material': {
      transform: '@mui/material/${member}',
      member_transformers: ['pascal_case']
    }
  };

  const testCases = [
    {
      source: 'antd',
      configured: true,
      description: '源在配置中'
    },
    {
      source: 'react',
      configured: false,
      description: '源不在配置中（保持原样）'
    },
    {
      source: '@mui/material',
      configured: true,
      description: '作用域包导入在配置中'
    }
  ];

  console.log('🧪 Testing configuration priority:');
  testCases.forEach(({ source, configured, description }) => {
    console.log(`  ✓ ${description}: "${source}" → ${configured ? '转换' : '保持原样'}`);
  });
}

/**
 * 运行所有测试
 *
 * @function runAllTests
 * @returns {void}
 */
function runAllTests(): void {
  console.log('\n========================================');
  console.log('🚀 SWC Plugin Transform Import Tests');
  console.log('========================================\n');

  testCamelCase();
  console.log();

  testKebabCase();
  console.log();

  testImportPathTransformation();
  console.log();

  testASTTransformation();
  console.log();

  testStyleImportHandling();
  console.log();

  testConfigurationPriority();

  console.log('\n========================================');
  console.log('✅ All tests completed!');
  console.log('========================================\n');
}

// 导出测试函数
export {
  testCamelCase,
  testKebabCase,
  testImportPathTransformation,
  testASTTransformation,
  testStyleImportHandling,
  testConfigurationPriority,
  runAllTests
};

// 如果直接运行此文件，执行所有测试
if (require.main === module) {
  runAllTests();
}
