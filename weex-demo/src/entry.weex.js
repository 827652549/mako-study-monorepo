// Weex 原生端入口 - 编译为 JS Bundle 供原生 SDK 加载
// 与 web 入口的区别：不需要挂载到 DOM，Weex SDK 会接管渲染
import Vue from 'vue'
import App from './app.vue'

// Weex 原生环境中 weex 全局对象由 SDK 注入
App.el = '#root'
new Vue(App)
