// Web 端入口 - 在浏览器中预览 Weex 组件
import Vue from 'vue'
import App from './app.vue'

// Web 端模拟 weex 全局对象
if (typeof weex === 'undefined') {
  window.weex = {
    requireModule(name) {
      const modules = {
        modal: {
          toast({ message, duration }) {
            console.log(`[Weex modal.toast] ${message} (${duration}s)`)
            let el = document.getElementById('weex-toast')
            if (!el) {
              el = document.createElement('div')
              el.id = 'weex-toast'
              el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:10px 24px;border-radius:6px;font-size:14px;z-index:9999;transition:opacity 0.3s'
              document.body.appendChild(el)
            }
            el.textContent = message
            el.style.opacity = '1'
            clearTimeout(el._timer)
            el._timer = setTimeout(() => { el.style.opacity = '0' }, (duration || 1.5) * 1000)
          },
          alert({ title, message, okTitle }) {
            console.log(`[Weex modal.alert] ${title}: ${message}`)
            window.alert(`${title}\n${message}`)
          }
        },
        navigator: {
          push({ url, animated }) {
            console.log(`[Weex navigator.push] ${url}`)
          },
          pop({ animated }) {
            console.log('[Weex navigator.pop]')
          }
        }
      }
      return modules[name] || { _warn: `${name} module not available in web preview` }
    }
  }
}

// ====== Weex 标签 -> Web 端组件映射 ======
// <text> -> <span>
Vue.component('text', {
  render(h) {
    return h('span', { style: { display: 'inline' } }, this.$slots.default)
  }
})

// <image> -> <img>
Vue.component('image', {
  render(h) {
    return h('img', {
      attrs: { src: this.src },
      on: this.$listeners,
      style: { display: 'block' }
    })
  },
  props: ['src']
})

// <list> -> <div> (Web 端用 div 模拟，CSS overflow-y: auto)
Vue.component('list', {
  render(h) {
    return h('div', {
      style: { display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: '1' },
      on: this.$listeners
    }, this.$slots.default)
  }
})

// <cell> -> <div>
Vue.component('cell', {
  render(h) {
    return h('div', {
      style: { display: 'flex', flexDirection: 'column' }
    }, this.$slots.default)
  }
})

// <scroller> -> <div> with scroll
Vue.component('scroller', {
  render(h) {
    return h('div', {
      style: { display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: '1' },
      on: this.$listeners
    }, this.$slots.default)
  }
})

// <loading> -> <div> (Web 端简化)
Vue.component('loading', {
  render(h) {
    const show = this.display === 'show'
    return h('div', {
      style: { display: show ? 'flex' : 'none', justifyContent: 'center', padding: '10px' }
    }, this.$slots.default)
  },
  props: ['display']
})

// <refresh> -> <div>
Vue.component('refresh', {
  render(h) {
    return h('div', this.$slots.default)
  }
})

new Vue({
  el: '#app',
  render: h => h(App)
})
