const withPlugins = require("next-compose-plugins");
const withTM = require("next-transpile-modules");
const withImage = require("next-images");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const package = require("./package.json");
const path = require("path");
const { corpdV1Packages } = require("./corpdv1-packages");
const { isDebugMode } = require("./scripts/constant");
const { ANALYZE_SPEED, ANALYZE_BUNDLE, autoOpen, NODE_ENV } = process.env;
// 使用next-transpile-modules插件，将指定的模块进行转译，避免esModule/commonJS混用
const shouldTransModule = [
  "core-js",
  "@ctrip/corp-cloud-internation/node_modules/@ctrip/corpDesign-h5",
  "@ctrip/corp-bizComp-costcenter/node_modules/@ctrip/corpd-h5",
  "@ctrip/corp-bizComp-costcenter/node_modules/@ctrip/corpd",
  "@ctrip/corp-bizComp-flight-passengerType-h5", // 在查询框模块的dependencies里，会被装到node_modules最外层
  "@ctrip/corp-bizComp-flight-city-h5", // 在查询框模块的dependencies里，会被装到node_modules最外层
  "@ctrip/corp-flight-business-h5-multi-pass-prompt", // 在查询框模块的dependencies里，会被装到node_modules最外层
  "@ctrip/corp-flight-business-h5-policy-passenger",
];

const transModuleExclude = [
  "@ctrip/corp-app-fetch-processor",
  "@ctrip/corp-fe-log",
];

if (package.dependencies) {
  Object.keys(package.dependencies).forEach((key) => {
    if (transModuleExclude.includes(key)) {
      return;
    }
    if (key.indexOf("@ctrip") > -1) shouldTransModule.push(key);
  });
}

function configStyleLoader(rules) {
  rules
    .filter((rule) => rule.oneOf)
    .forEach(({ oneOf }) => {
      oneOf.forEach(({ use }) => {
        Array.isArray(use) &&
          use.forEach((item) => {
            if (
              item.loader &&
              item.loader.indexOf("mini-css-extract-plugin") > -1
            ) {
              item.options.publicPath = "../../";
            }
            if (item.loader && item.loader.indexOf("sass-loader") > -1) {
              item.options = {
                ...item.options,
                additionalData: `@import "@ctrip/corp-flight-business-theme-utils/variables.scss";`,
              };
            }
          });
      });
    });

  return rules;
}
// babel转译指定模块，有些依赖包必须走babel转译，实现px2rem等功能
const babelTransModule = [
  '@ctrip/corp-bizComp-flight-delivery-h5',
  '@react-spring',
]

const nextConfig = {
  basePath: package.homepage,
  distDir: "build",
  generateBuildId: async () => {
    return `flight-booking-h5-v2-${+new Date()}`
  },
  compiler: {
    styledComponents: true,
    removeConsole: !isDebugMode,
  },
  experimental: {
    esmExternals: 'loose',
    swcPlugins: [
      [
        "@ctrip/swc-plugin-transform-import",
        {
          "@ctrip/corpd-h5": {
            transform: "@ctrip/corpd-h5/dist/components/${member}",
            style: "@ctrip/corpd-h5/dist/components/${member}/index.css",
            memberTransformers: ["upper_first"],
          },
        },
      ],
    ],
  },
  webpack: (config, { isServer, defaultLoaders }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    config.module.rules = configStyleLoader(config.module.rules);
    config.module.rules.push({
      test: /\.(mjs|cjs|js|jsx|ts|tsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'customBabel.config.js'), // 只给指定包用
        },
      },
      include: function (moduleId) {
        return babelTransModule.some(pkg => {
          const pkgname = path.join(...pkg.split('/')); 
          return moduleId.indexOf(pkgname) > -1
        })
      }
    });
    config.module.rules.unshift({
      test: /\.js$/,
      use: {
        loader: "swc-loader",
        options: {
          jsc: {
            experimental: {
              plugins: [
                [
                  "@ctrip/swc-plugin-alias",
                  {
                    alias: {
                      "@ctrip/corpd-h5": "@ctrip/corpd-h5-v1",
                    },
                  },
                ],
              ],
            },
          },
        },
      },
      include: function (file) {
        // 需要处理的包列表
        return corpdV1Packages.some(pkg => {
          const pkgname = path.join(...pkg.split('/')); 
          return file.indexOf(pkgname) > -1
        });
      },
    }, {
      test: /\.js$/,
      use: {
        loader: "swc-loader",
        options: {
          jsc: {
            experimental: {
              plugins: [
                [
                  "@ctrip/swc-plugin-alias",
                  {
                    alias: {
                      "@ctrip/corp-bizComp-approval-form-h5": "@ctrip/corp-bizComp-approval-form-h5-pro-max",
                    },
                  },
                ],
              ],
            },
          },
        },
      },
      include: function (file) {
        // 需要处理的包列表
        const packagesToProcess = [
          '@ctrip/corp-fe-bizcomp-new-flight-search',
        ];
        return packagesToProcess.some(pkg => {
          const pkgname = path.join(...pkg.split('/')); 
          return file.indexOf(pkgname) > -1
        });
      },
    });
    // 分析构建速度
    if (ANALYZE_SPEED) {
      config.plugins.push(new SpeedMeasurePlugin());
    }
    // 接入代码覆盖率分析（runtime）
    if (!isServer) {
      config.plugins.push(require('@ctrip/unplugin-code-coverage-ast/webpack')({
        source: '700003_corp/corp-flight-booking-h5-v2', // 必填，请填第一步中生成的 source 值
        platform: 'ares', // 必填，请填写真实的发布平台（web目前支持 ares 和 captain 两个取值）
      }))
    }
    // 分析构建体积
    if (ANALYZE_BUNDLE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: autoOpen === "true" ? "server" : "static",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: autoOpen === "true",
          generateStatsFile: false,
          reportFilename: `report.${package.version
            }.${new Date().getTime()}.html`,
        })
      );
    }
    // 根据 node_module 里面的 sideEffects 配置进行tree-shaking
    // 这个配置 next 是默认打开的, 如果确认一个包有没有基于 package.json 的sideEffects来, 可以设置成false, 然后通过可视化分析bundle验证.
    // config.optimization.sideEffects = true
    if (isDebugMode) {
      // 将 moduleId 编号显式命名,方便火焰图定位性能问题
      config.optimization.moduleIds = 'named'
      // 将 chunkIds 编号显式命名,方便火焰图定位性能问题
      config.optimization.chunkIds = 'named'
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    disableStaticImages: true,
  },
  productionBrowserSourceMaps: isDebugMode,
};

module.exports = withPlugins(
  [withTM(shouldTransModule)],
  withImage(nextConfig)
);
