'use strict';
//
// // 引入文件系统模块
// const fs = require('fs');
// // 引入操作系统模块
// const os = require('os');
// // 引入路径模块
const path = require('path');
// // 引入 Webpack 模块
// const webpack = require('webpack');
// // 引入模块解析模块
// const resolve = require('resolve');
// // 引入 Plug'n'Play 插件
// const PnpWebpackPlugin = require('pnp-webpack-plugin');
// // 引入 HTML Webpack 插件，用于生成 HTML 文件
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// // 引入大小写敏感路径插件
// const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// // 引入内联块 HTML 插件
// const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
// // 引入 Terser 插件，用于压缩 JavaScript 代码
// const TerserPlugin = require('terser-webpack-plugin');
// // 引入 Mini CSS Extract 插件，用于提取 CSS 到单独的文件
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// // 引入优化 CSS 资产插件
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// // 引入安全的 PostCSS 解析器
// const safePostCssParser = require('postcss-safe-parser');
// // 引入 Manifest 插件，用于生成资产清单
// const ManifestPlugin = require('webpack-manifest-plugin');
// // 引入插值 HTML 插件
// const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
// // 引入 Workbox Webpack 插件，用于生成服务 worker
// const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
// // 引入监视缺失节点模块插件
// const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
// // 引入模块作用域插件
// const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// // 引入获取 CSS 模块本地标识符的函数
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
// // 引入路径配置模块
const paths = require('./paths');
// // 引入模块配置模块
// const modules = require('./modules');
// // 引入获取客户端环境变量的函数
// const getClientEnvironment = require('./env');
// // 引入模块未找到插件
// const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
// // 引入 Fork TsChecker Webpack 插件，用于 TypeScript 类型检查
// const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
// // 引入 TypeScript 格式化器
// const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
// // 引入 Webpack 包分析插件
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// // 引入 ESLint 插件
// const ESLintPlugin = require('eslint-webpack-plugin');
// // 引入代码覆盖率分析插件
// const AnalyzerInjectAstPlugin = require('@ctrip/code-coverage-ast/plugins/AnalyzerInjectAstPlugin')
// // 获取当前分支名称
// const branchName = process.env.CI_COMMIT_REF_NAME || ''
// // 判断是否禁用 ESLint 检查
// const disableEslintCheck = process.env.DISABLE_ESLINT_CHECK === 'true';
// // 引入项目的 package.json 文件
// const packageConfig = require('../package.json');
//
// // 项目源文件路径
const srcPath = path.join(__dirname, '../src');
//
// // 引入 PostCSS 规范化插件
const postcssNormalize = require('postcss-normalize');
//
// // 引入应用的 package.json 文件
// const appPackageJson = require(paths.appPackageJson);
// // 获取项目版本号
// const version = packageConfig?.version;
// // 处理后的版本号，将点号替换为短横线
// const bundledVersion = version.replace(/\./g, '-')
//
// // 获取当前分支名称
// const CI_COMMIT_REF_NAME = process.env?.CI_COMMIT_REF_NAME || ''
// // 6.25更新, 只有dev_开头的分支可以打开sourceMap, 否则走历史逻辑
// const isSourceMapOpen = CI_COMMIT_REF_NAME.includes('dev_')
// // Source maps are resource heavy and can cause out of memory issue for large source files.
// // 虽然开启sourcemap，但其将传入内网，外网无法访问
// const shouldUseSourceMap = true;
// console.log('shouldUseSourceMap', shouldUseSourceMap)
// // 引入速度测量插件
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const config = require("../fetch.config.json");
// // 创建速度测量插件实例
const smp = new SpeedMeasurePlugin();
// // 可以利用的cpu个数
// const cpusAvailableLen = os.cpus().filter(e=>e.model!== 'unknown').length
// console.log('可以利用的cpu逻辑核心个数 cpusAvailableLen',cpusAvailableLen)
// // Some apps do not need the benefits of saving a web request, so not inlining the chunk
// // makes for a smoother build process.
// // 判断是否内联运行时块
// const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK!== 'false';
//
// // 图片内联大小限制
const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '50000');
//
// // 检查是否设置了 TypeScript
// const useTypeScript = fs.existsSync(paths.appTsConfig);
//
// // 样式文件正则表达式
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
//
// // 获取子环境配置
// const getSubEnv = () => {
//   if (process.env.NODE_ENV === 'development') {
//     const config = require('../fetch.config.json');
//     return config?.developmentSubEnv || '';
//   }
//
//   return ''
// }


// 这是生产环境和开发环境的配置。
// 它专注于开发者体验、快速重建和最小化的包。
module.exports = function (webpackEnv) {
  // 判断是否为开发环境
  const isEnvDevelopment = webpackEnv === 'development';
  // 判断是否为生产环境
  const isEnvProduction = webpackEnv === 'production';

  // 用于在生产环境中启用性能分析的变量
  // 传递到别名对象中。如果在构建命令中传递了标志，则使用该标志
  const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile');

  // 我们将为应用程序提供 `paths.publicUrlOrPath`
  // 作为 `index.html` 中的 %PUBLIC_URL% 和 JavaScript 中的 process.env.PUBLIC_URL。
  // 省略尾部斜杠，因为 %PUBLIC_URL%/xyz 看起来比 %PUBLIC_URL%xyz 更好。
  // 获取要注入到应用程序中的环境变量。
  // const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

  // 获取子环境配置
  // const subEnv = getSubEnv()

  // 获取样式加载器的通用函数
  const getStyleLoaders = (cssOptions, preProcessor, preProcessorOptions) => {
    const loaders = [
      // 开发环境时使用 style-loader
      isEnvDevelopment && require.resolve('style-loader'),
      // 生产环境时使用 MiniCssExtractPlugin.loader
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css 位于 `static/css` 中，使用 '../../' 定位到 index.html 文件夹
        // 在生产环境中，`paths.publicUrlOrPath` 可以是相对路径
        options: paths.publicUrlOrPath.startsWith('.')? { publicPath: '../../' } : {},
      },
      // 使用 css-loader
      {
        loader: require.resolve('./loader/wrap-css-loader.js'), // 替换原 css-loader
        options: cssOptions
      },
      // 使用 postcss-loader
      {
        // PostCSS 的选项，因为我们会引用这些选项两次
        // 根据 package.json 中指定的浏览器支持添加供应商前缀
        loader: require.resolve('postcss-loader'),
        options: {
          // 外部 CSS 导入工作所必需的
          // https://github.com/facebook/create-react-app/issues/2677
          // ident: 'postcss',
          postcssOptions: {
            plugins: [
              ['tailwindcss', {}],
              ['postcss-flexbugs-fixes', {}],
              ['postcss-preset-env', {
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              }],
              [postcssNormalize()],
            ],
          },
          // 生产环境且需要使用源映射时启用源映射
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
    ].filter(Boolean);
    // 如果有预处理程序，则添加相应的加载器
    if (preProcessor) {
      loaders.push(
          {
            loader: require.resolve('resolve-url-loader'),
            options: {
              // 生产环境且需要使用源映射时启用源映射
              sourceMap: isEnvProduction && shouldUseSourceMap,
            },
          },
          {
            loader: require.resolve(preProcessor),
            options: {
              // 预处理程序的其他选项
              ...preProcessorOptions,
            },
          }
      );
    }
    return loaders;
  };

  // 开关函数，用于控制是否使用速度测量插件
  function smpSwitch(obj) {
    const isSmpOpen = true
    if (isSmpOpen) {
      return smp.wrap(obj);
    }
    return obj;
  }

  return smpSwitch({
    // 设置 Webpack 模式为生产环境或开发环境
    mode: 'production',
    // 生产环境时提前停止编译
    bail: isEnvProduction,
    // 应用程序的入口点
    entry: [
      // 包含 WebpackDevServer 的替代客户端。客户端的工作是
      // 通过套接字连接到 WebpackDevServer 并接收更改通知。
      // 当你保存文件时，客户端将应用热更新（如果是 CSS 更改），或者刷新页面（如果是 JS 更改）。当你
      // 出现语法错误时，此客户端将显示语法错误覆盖层。
      // 注意：我们使用自定义客户端而不是默认的 WebpackDevServer 客户端，
      // 以为 Create React App 用户带来更好的体验。如果你更喜欢股票客户端，可以将下面一行替换为这两行：
      // require.resolve('webpack-dev-server/client') + '?/',
      // require.resolve('webpack/hot/dev-server'),
      // 开发环境时引入 React 开发工具的 Webpack 热更新客户端
      isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
      // 应用程序的代码
      paths.appIndexJs,
      // 我们最后包含应用程序代码，以便在初始化期间出现运行时错误时，
      // 不会破坏 WebpackDevServer 客户端，并且更改 JS 代码仍会触发刷新。
    ].filter(Boolean),
    // 解析配置
    resolve: {
      // 这允许你设置 Webpack 查找模块的备用位置。
      // 我们将这些路径放在第二位，因为我们希望 `node_modules` 在有冲突时“获胜”。这与 Node 的解析机制匹配。
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules', paths.appNodeModules],
      alias: {
        // 支持 React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
        // 允许使用 ReactDevTools 进行更好的性能分析
        ...(isEnvProductionProfile && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        }),
        // '@': `${srcPath}/`,
        // react: path.resolve(__dirname, '../node_modules', 'react'),
        // '@ctrip/corpcrossflightcabinlist/WebIndexV2': '@ctrip/corpcrossflightcabinlist/dist/esm/WebIndexV2',
      },
    },
    // 模块配置
    module: {
      strictExportPresence: true,
      rules: [
        // 禁用 require.ensure，因为它不是标准的语言特性。
        { parser: { requireEnsure: false } },
        {
          test: /\.(?:js|mjs|cjs|jsx|ts|tsx)$/,
          exclude: {
            and: [/node_modules/], // 排除 node_modules 中的库...
            not: [
              // 除了一些需要进行转译的库，因为它们使用了现代语法
              /@ctrip[\\\/]corp-cloud-online-layout/,
              /[\\\/]node_modules[\\\/]@react-spring[\\\/]/,
              /[\\\/]node_modules[\\\/]@tanstack[\\\/]virtual-core[\\\/]/
            ],
          },
          use: {
            loader: 'babel-loader',
            options: {
              customize: require.resolve('babel-preset-react-app/webpack-overrides'),
              presets: [['@babel/preset-env', { targets: 'defaults' }]],
              plugins: [
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-optional-chaining',
              ],
            },
          },
        },
        {
          // "oneOf" 将遍历所有后续的加载器，直到有一个加载器满足要求。
          // 当没有加载器匹配时，它将回退到加载器列表末尾的 "file" 加载器。
          oneOf: [
            // "url" 加载器的工作方式与 "file" 加载器类似，
            // 不同之处在于它将小于指定限制（以字节为单位）的资产嵌入为数据 URL，以避免请求。
            // 缺少 `test` 等同于匹配。
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.eot$/, /\.ttf$/, /\.woff$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // 添加对 CSS 模块的支持，但使用 SASS
            // 使用扩展名为.module.scss 或.module.sass 的文件。
            {
              test: sassModuleRegex,
              include: srcPath,
              use: getStyleLoaders(
                  {
                    importLoaders: 3,
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                    modules: {
                      getLocalIdent: getCSSModuleLocalIdent,
                    },
                  },
                  'sass-loader'
              ),
            },
            // 对 SASS 的可选支持（使用.scss 或.sass 扩展名）。
            // 默认情况下，我们支持扩展名为.module.scss 或.module.sass 的 SASS 模块。
            {
              test: sassRegex,
              include: srcPath,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                  {
                    importLoaders: 3,
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                  },
                  'sass-loader',
                  {
                    additionalData: `@import "@ctrip/corp-flight-business-theme-utils/variables.scss";`,
                  }
              ),
              // 即使包含的包声称没有副作用，也不要将 CSS 导入视为死代码。
              // 当 Webpack 为此添加警告或错误时，请删除此设置。
              // 请参阅 https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // 添加对 CSS 模块的支持（https://github.com/css-modules/css-modules）
            // 使用扩展名为.module.css 的文件。
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            // "postcss" 加载器将 autoprefixer 应用于我们的 CSS。
            // "css" 加载器解析 CSS 中的路径，并将资产添加为依赖项。
            // "style" 加载器将 CSS 转换为注入 <style> 标签的 JS 模块。
            // 在生产环境中，我们使用 MiniCSSExtractPlugin 将 CSS 提取到一个文件中，
            // 但在开发环境中，"style" 加载器启用了 CSS 的热编辑。
            // 默认情况下，我们支持扩展名为.module.css 的 CSS 模块。
            {
              test: cssRegex,
              exclude: [
                  cssModuleRegex,
                  sassRegex,
                  sassModuleRegex,
              ],
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }),
              // 即使包含的包声称没有副作用，也不要将 CSS 导入视为死代码。
              // 当 Webpack 为此添加警告或错误时，请删除此设置。
              // 请参阅 https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },

            // "file" 加载器确保这些资产由 WebpackDevServer 提供服务。
            // 当你 `import` 一个资产时，你会得到它的（虚拟）文件名。
            // 在生产环境中，它们将被复制到 `build` 文件夹中。
            // 此加载器不使用 "test"，因此它将捕获所有通过其他加载器的模块。
            {
              loader: require.resolve('file-loader'),
              // 排除 `js` 文件，以确保 "css" 加载器正常工作，
              // 因为它会注入其运行时，否则会通过 "file" 加载器进行处理。
              // 同时排除 `html` 和 `json` 扩展名，以便它们由 webpack 的内部加载器处理。
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** 停止 ** 你是否要添加新的加载器？
            // 确保在 "file" 加载器之前添加新的加载器。
          ],
        },
      ],
    },
    // 插件配置
    plugins: [

        '@babel/preset-react',
        // '@babel/plugin-syntax-jsx'

    ].filter(Boolean),
    // 一些库导入 Node 模块，但在浏览器中不使用它们。
    // 告诉 Webpack 为它们提供空的模拟，以便导入它们可以正常工作。
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    // 关闭性能处理，因为我们通过 FileSizeReporter 利用自己的提示
    performance: false,
  });
};