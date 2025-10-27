// wrap-css-loader.js
module.exports = function(source, map, meta) {
    const path = require('path');

    // 打印当前处理的绝对路径
    console.log('\x1b[36m%s\x1b[0m', '📂 CSS Loader 正在处理:');
    console.log('├─ 绝对路径:', this.resourcePath);
    console.log('├─ 相对路径:', path.relative(process.cwd(), this.resourcePath));
    console.log('└─ 查询参数:', this.resourceQuery || '无');

    // 调用原始 css-loader
    return require('css-loader').call(this, source, map, meta);
};