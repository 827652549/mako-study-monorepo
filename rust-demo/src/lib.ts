import { Plugin } from '@swc/core';

/**
 * 支持的成员名称转换类型
 *
 * @typedef {('camel_case' | 'kebab_case' | 'dashed_case' | 'pascal_case' | 'snake_case' | 'upper_case' | 'upper_first' | 'lower_case' | 'lower_first')} TransformMember
 *
 * 转换类型说明:
 * - camel_case: 转换为驼峰式 (UserProfile -> userProfile)
 * - kebab_case: 转换为短横线分隔 (UserProfile -> user-profile)
 * - dashed_case: 同 kebab_case
 * - pascal_case: 转换为帕斯卡式 (user_profile -> UserProfile)
 * - snake_case: 转换为蛇形 (UserProfile -> user_profile)
 * - upper_case: 全大写 (userProfile -> USERPROFILE)
 * - lower_case: 全小写 (UserProfile -> userprofile)
 * - upper_first: 首字母大写 (userProfile -> UserProfile)
 * - lower_first: 首字母小写 (UserProfile -> userProfile)
 */
type TransformMember =
  | 'camel_case'
  | 'kebab_case'
  | 'dashed_case'
  | 'pascal_case'
  | 'snake_case'
  | 'upper_case'
  | 'upper_first'
  | 'lower_case'
  | 'lower_first';

/**
 * 转换成员名称的函数映射表
 * 将每个转换类型映射到对应的转换函数
 */
const TRANSFORM_MEMBER_MAPPING: Record<TransformMember, (str: string) => string> = {
  camel_case: camelCase,
  kebab_case: kebabCase,
  dashed_case: kebabCase, // 与 kebab_case 相同
  pascal_case: pascalCase,
  snake_case: snakeCase,
  upper_case: upperCase,
  upper_first: upperFirst,
  lower_case: lowerCase,
  lower_first: lowerFirst,
};

/**
 * 将字符串转换为驼峰式大小写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 驼峰式字符串
 *
 * @example
 * camelCase('user-profile') // 'userProfile'
 * camelCase('user_profile') // 'userProfile'
 * camelCase('UserProfile')  // 'userProfile'
 */
function camelCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word, i) => i === 0 ? word.toLowerCase() : capitalize(word))
    .join('');
}

/**
 * 将字符串转换为短横线分隔式（kebab-case）
 *
 * @param {string} str - 输入字符串
 * @returns {string} 短横线分隔的字符串
 *
 * @example
 * kebabCase('userProfile') // 'user-profile'
 * kebabCase('UserProfile') // 'user-profile'
 * kebabCase('user_profile') // 'user-profile'
 */
function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 将字符串转换为帕斯卡式大小写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 帕斯卡式字符串
 *
 * @example
 * pascalCase('user-profile') // 'UserProfile'
 * pascalCase('user_profile') // 'UserProfile'
 * pascalCase('userProfile')  // 'UserProfile'
 */
function pascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(capitalize)
    .join('');
}

/**
 * 将字符串转换为蛇形大小写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 蛇形字符串
 *
 * @example
 * snakeCase('userProfile')  // 'user_profile'
 * snakeCase('UserProfile')  // 'user_profile'
 * snakeCase('user-profile') // 'user_profile'
 */
function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * 将字符串转换为全大写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 全大写字符串
 *
 * @example
 * upperCase('userProfile') // 'USERPROFILE'
 */
function upperCase(str: string): string {
  return str.toUpperCase();
}

/**
 * 将字符串转换为全小写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 全小写字符串
 *
 * @example
 * lowerCase('UserProfile') // 'userprofile'
 */
function lowerCase(str: string): string {
  return str.toLowerCase();
}

/**
 * 将字符串首字母转换为大写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 首字母大写的字符串
 *
 * @example
 * upperFirst('userProfile') // 'UserProfile'
 */
function upperFirst(str: string): string {
  return capitalize(str);
}

/**
 * 将字符串首字母转换为小写
 *
 * @param {string} str - 输入字符串
 * @returns {string} 首字母小写的字符串
 *
 * @example
 * lowerFirst('UserProfile') // 'userProfile'
 */
function lowerFirst(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 将字符串首字母转换为大写（辅助函数）
 *
 * @param {string} str - 输入字符串
 * @returns {string} 首字母大写的字符串
 *
 * @private
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 单个导入源的转换配置接口
 *
 * @interface TransformVisitorSubConfig
 * @property {string} transform - 转换后的导入路径模板，支持 ${member} 占位符
 * @property {TransformMember[]} member_transformers - 成员名称转换类型列表，按顺序应用
 * @property {string} [style] - 可选的样式导入路径模板，同样支持 ${member} 占位符
 *
 * @example
 * {
 *   transform: '@mylib/components/{{member}}',
 *   member_transformers: ['kebab_case'],
 *   style: '@mylib/components/{{member}}/style'
 * }
 */
interface TransformVisitorSubConfig {
  /** 转换后的导入路径模板 */
  transform: string;
  /** 成员名称转换器列表 */
  member_transformers: TransformMember[];
  /** 可选的样式导入路径模板 */
  style?: string;
}

/**
 * 完整的转换配置映射
 * 键为导入源路径，值为对应的转换配置
 *
 * @interface TransformVisitorConfig
 *
 * @example
 * {
 *   '@mylib/components': { transform: '...', member_transformers: [...] },
 *   'antd': { transform: '...', member_transformers: [...] }
 * }
 */
interface TransformVisitorConfig {
  [importSource: string]: TransformVisitorSubConfig;
}

/**
 * 插件的配置接口
 *
 * @interface Config
 * @property {TransformVisitorConfig} config - 导入转换配置映射
 *
 * @example
 * {
 *   config: {
 *     '@mylib/components': {
 *       transform: '@mylib/components/{{member}}',
 *       member_transformers: ['kebab_case'],
 *       style: '@mylib/components/{{member}}/style'
 *     }
 *   }
 * }
 */
interface Config {
  /** 转换配置映射 */
  config: TransformVisitorConfig;
}

/**
 * 转换导入路径
 * 根据转换器列表按顺序转换成员名称，然后替换路径模板中的 ${member} 占位符
 *
 * @param {string} transform - 转换路径模板，包含 ${member} 占位符
 * @param {string} member - 需要转换的成员名称
 * @param {TransformMember[]} memberTransformers - 转换器类型列表，按顺序应用
 * @returns {string} 转换后的导入路径
 *
 * @example
 * // 示例1：单个转换
 * transformImportPath(
 *   '@mylib/components/{{member}}',
 *   'UserProfile',
 *   ['kebab_case']
 * )
 * // 返回: '@mylib/components/user-profile'
 *
 * @example
 * // 示例2：多个转换（按顺序应用）
 * transformImportPath(
 *   'antd/es/{{member}}',
 *   'MyButton',
 *   ['snake_case', 'lower_case']
 * )
 * // 返回: 'antd/es/my_button'
 */
function transformImportPath(
  transform: string,
  member: string,
  memberTransformers: TransformMember[]
): string {
  // 按顺序应用所有转换器
  let transformedMember = member;

  for (const transformer of memberTransformers) {
    const fn = TRANSFORM_MEMBER_MAPPING[transformer];
    if (fn) {
      transformedMember = fn(transformedMember);
    }
  }

  // 调试日志，输出转换后的成员名称
  console.debug(`transformed member is ${transformedMember}`);

  // 替换路径模板中的占位符
  return transform.replace('${member}', transformedMember);
}

/**
 * SWC 导入转换插件主函数
 *
 * 该插件会遍历 AST，找到所有的导入声明（ImportDeclaration），
 * 并根据配置转换导入路径和成员名称。
 *
 * 主要功能：
 * 1. 检查导入源是否在配置中
 * 2. 对每个命名导入进行成员名称转换
 * 3. 生成新的导入声明，使用转换后的路径
 * 4. 如果配置有样式路径，自动创建对应的样式导入
 * 5. 保留默认导入和命名空间导入不变
 *
 * @param {Config} config - 插件配置对象
 * @returns {Plugin} SWC 插件对象
 *
 * @example
 * // 在 .swcrc 或构建配置中使用
 * {
 *   "jsc": {
 *     "experimental": {
 *       "plugins": [
 *         [
 *           "swc-plugin-transform-import",
 *           {
 *             "config": {
 *               "@mylib/components": {
 *                 "transform": "@mylib/components/{{member}}",
 *                 "member_transformers": ["kebab_case"],
 *                 "style": "@mylib/components/{{member}}/style"
 *               }
 *             }
 *           }
 *         ]
 *       ]
 *     }
 *   }
 * }
 */
export default function transformPlugin(config: Config): Plugin {
  // 获取或初始化转换配置映射
  const configs: TransformVisitorConfig = config.config || {};

  return {
    name: 'swc-plugin-transform-import',

    visitor: {
      /**
       * 访问模块节点
       * 遍历模块体中的所有语句，处理导入声明
       *
       * @param {any} path - AST 路径对象，包含当前节点信息
       */
      Module(path) {
        const module = path.node;
        const transformedBody: any[] = [];

        // 遍历模块中的所有语句
        for (const node of module.body) {
          // 只处理导入声明，其他语句保持原样
          if (node.type === 'ImportDeclaration') {
            const importDecl = node;
            const importSource = importDecl.source.value;

            // 查找该导入源的配置
            const importConfig = configs[importSource];

            if (importConfig) {
              // 检查是否存在默认导入或命名空间导入
              // 这些类型的导入不需要转换，直接保留
              const hasDefaultOrNamespace = importDecl.specifiers.some(
                (spec) =>
                  spec.type === 'ImportDefaultSpecifier' ||
                  spec.type === 'ImportNamespaceSpecifier'
              );

              if (!hasDefaultOrNamespace) {
                // 处理命名导入（named imports）
                for (const spec of importDecl.specifiers) {
                  if (spec.type === 'ImportSpecifier') {
                    // 获取导入的成员名称
                    const importedName =
                      spec.imported?.type === 'StringLiteral'
                        ? spec.imported.value
                        : spec.imported?.value || '';

                    // 转换导入路径
                    const transformedPath = transformImportPath(
                      importConfig.transform,
                      importedName,
                      importConfig.member_transformers
                    );

                    // 创建转换后的导入声明
                    const newImportDecl = {
                      type: 'ImportDeclaration' as const,
                      source: { type: 'StringLiteral' as const, value: transformedPath },
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

                    // 如果配置了样式路径，创建对应的样式导入
                    if (importConfig.style) {
                      const styledPath = transformImportPath(
                        importConfig.style,
                        importedName,
                        importConfig.member_transformers
                      );

                      const styleImport = {
                        type: 'ImportDeclaration' as const,
                        source: { type: 'StringLiteral' as const, value: styledPath },
                        specifiers: [], // 样式导入不需要指定具体导入项
                      };

                      transformedBody.push(styleImport);
                    }
                  }
                }
              } else {
                // 包含默认导入或命名空间导入，保持原样
                transformedBody.push(node);
              }
            } else {
              // 导入源不在配置中，保持原样
              transformedBody.push(node);
            }
          } else {
            // 非导入声明，保持原样
            transformedBody.push(node);
          }
        }

        // 更新模块体
        path.node.body = transformedBody;
      },
    },
  };
}
