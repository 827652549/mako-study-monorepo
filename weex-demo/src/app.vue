<template>
  <div class="container">
    <text class="title">Hello Weex!</text>
    <text class="subtitle">This is a minimal Weex + Vue 2 demo</text>

    <!-- Weex 特有的 <image> 组件 -->
    <image
      class="logo"
      src="https://weex.apache.org/assets/img/weex_logo_blue.png"
      @load="onImageLoad"
    />

    <!-- Weex modal 模块演示 -->
    <div class="btn-group">
      <text class="btn" @click="showToast">Show Toast</text>
      <text class="btn" @click="showAlert">Show Alert</text>
    </div>

    <!-- 列表组件演示 -->
    <list class="list">
      <cell v-for="(item, index) in items" :key="index">
        <div class="list-item">
          <text class="item-text">{{ item.title }}</text>
          <text class="item-desc">{{ item.desc }}</text>
        </div>
      </cell>
    </list>
  </div>
</template>

<script>
// Weex 模块通过 weex.requireModule 引入
const modal = weex.requireModule('modal')
const navigator = weex.requireModule('navigator')

export default {
  name: 'App',
  data() {
    return {
      imageLoaded: false,
      items: [
        { title: 'Weex 组件', desc: 'div / text / image / list / scroller' },
        { title: 'Weex 模块', desc: 'modal / navigator / storage / animation' },
        { title: '布局方式', desc: 'Flexbox 是 Weex 的默认布局模型' },
        { title: 'JS-Native 通信', desc: 'callNative / callJS 双向桥接' },
        { title: '热更新', desc: 'JS Bundle 动态下发，无需应用商店审核' },
        { title: '渲染流程', desc: 'Vue Runtime -> VDOM -> Native DOM -> 原生组件树' }
      ]
    }
  },
  methods: {
    onImageLoad() {
      this.imageLoaded = true
      console.log('Image loaded')
    },
    showToast() {
      // Weex modal 模块的 toast 方法
      modal.toast({
        message: 'Hello from Weex!',
        duration: 1.5
      })
    },
    showAlert() {
      modal.alert({
        title: 'Weex Alert',
        message: 'This is a native alert via Weex modal module',
        okTitle: 'Got it'
      })
    }
  }
}
</script>

<!-- Weex 只支持 scoped 样式，且使用 px 单位（会被自动转换为 dp/pt） -->
<style scoped>
.container {
  flex: 1;
  background-color: #f5f5f5;
  padding-top: 60px;
  padding-left: 30px;
  padding-right: 30px;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #1a73e8;
  text-align: center;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 28px;
  color: #666666;
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 200px;
  height: 200px;
  align-self: center;
  margin-bottom: 40px;
}

.btn-group {
  flex-direction: row;
  justify-content: center;
  margin-bottom: 30px;
}

.btn {
  font-size: 28px;
  color: #ffffff;
  background-color: #1a73e8;
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 32px;
  padding-right: 32px;
  border-radius: 8px;
  margin-left: 10px;
  margin-right: 10px;
}

.list {
  flex: 1;
}

.list-item {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.item-text {
  font-size: 30px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8px;
}

.item-desc {
  font-size: 24px;
  color: #999999;
}
</style>
