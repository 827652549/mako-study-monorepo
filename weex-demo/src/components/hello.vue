<template>
  <div class="card" @click="handleClick">
    <text class="card-title">{{ title }}</text>
    <text class="card-body">{{ message }}</text>
    <text class="card-count">Clicked: {{ count }}</text>
  </div>
</template>

<script>
const modal = weex.requireModule('modal')

export default {
  name: 'HelloWeex',
  props: {
    title: {
      type: String,
      default: 'Weex Component'
    }
  },
  data() {
    return {
      message: 'This is a reusable Weex Vue component',
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count++
      modal.toast({
        message: `Clicked ${this.count} times`,
        duration: 0.8
      })
    }
  }
}
</script>

<style scoped>
.card {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 34px;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 12px;
}

.card-body {
  font-size: 26px;
  color: #555555;
  margin-bottom: 16px;
}

.card-count {
  font-size: 22px;
  color: #999999;
}
</style>
