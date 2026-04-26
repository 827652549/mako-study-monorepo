<template>
  <!-- <list> 是 Weex 特有的长列表组件，对应 Android RecyclerView / iOS UITableView -->
  <!-- 核心优势：自动回收不可见的 cell，性能远优于 <scroller> + v-for -->
  <list class="list" @loadmore="loadMore">
    <!-- <cell> 是 list 的直接子组件，每个 cell 代表一个可回收的列表项 -->
    <cell v-for="(item, index) in dataList" :key="item.id">
      <div class="item" :style="{ backgroundColor: item.color }">
        <text class="item-index">#{{ index + 1 }}</text>
        <text class="item-title">{{ item.name }}</text>
      </div>
    </cell>

    <!-- <loading> 是 Weex 列表的下拉刷新组件 -->
    <loading @loading="onRefresh" :display="refreshing ? 'show' : 'hide'">
      <text class="loading-text">Refreshing...</text>
    </loading>
  </list>
</template>

<script>
const modal = weex.requireModule('modal')

export default {
  name: 'WeexList',
  data() {
    return {
      refreshing: false,
      dataList: Array.from({ length: 20 }, (_, i) => ({
        id: i,
        name: `Weex Feature ${i + 1}`,
        color: i % 2 === 0 ? '#e3f2fd' : '#fff3e0'
      }))
    }
  },
  methods: {
    loadMore() {
      // <list> 的 loadmore 事件 - 触底自动加载更多
      const nextId = this.dataList.length
      const newItems = Array.from({ length: 10 }, (_, i) => ({
        id: nextId + i,
        name: `Weex Feature ${nextId + i + 1}`,
        color: (nextId + i) % 2 === 0 ? '#e3f2fd' : '#fff3e0'
      }))
      this.dataList.push(...newItems)
      modal.toast({ message: `Loaded ${newItems.length} more items`, duration: 0.5 })
    },
    onRefresh() {
      this.refreshing = true
      setTimeout(() => {
        this.dataList = Array.from({ length: 20 }, (_, i) => ({
          id: i,
          name: `Refreshed Feature ${i + 1}`,
          color: i % 2 === 0 ? '#e8f5e9' : '#fce4ec'
        }))
        this.refreshing = false
      }, 1000)
    }
  }
}
</script>

<style scoped>
.list {
  flex: 1;
}

.item {
  flex-direction: row;
  align-items: center;
  padding: 24px;
  margin-bottom: 8px;
  margin-left: 20px;
  margin-right: 20px;
  border-radius: 8px;
}

.item-index {
  font-size: 28px;
  font-weight: bold;
  color: #1a73e8;
  margin-right: 20px;
  width: 60px;
}

.item-title {
  font-size: 28px;
  color: #333333;
}

.loading-text {
  font-size: 24px;
  color: #999999;
  text-align: center;
  padding: 20px;
}
</style>
