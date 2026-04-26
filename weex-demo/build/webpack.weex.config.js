// Weex 原生构建配置
// 输出的 JS Bundle 由 Weex SDK 在 iOS/Android 端加载执行
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/entry.weex.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.weex.js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      // Weex 端使用 weex-vue-framework 而非 vue
      'vue$': 'weex-vue-framework'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // Weex 编译器优化
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  // Weex 不需要 style-loader，样式会被编译到 JS 中
  // Weex 原生端不需要 html-webpack-plugin
}
