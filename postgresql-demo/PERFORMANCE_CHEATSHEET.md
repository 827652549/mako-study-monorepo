# Supabase 性能速查表

## 🚀 快速命令

```bash
# 测试连接
npm run connect

# 基础性能测试（~20秒）
npm run benchmark

# 高级性能测试（~2-3分钟）
npm run advanced-benchmark
```

---

## 📊 关键性能指标一览表

| 操作 | 耗时 | 吞吐量 | 备注 |
|-----|------|--------|-----|
| **连接延迟** | 165-209ms | - | 中位数 165ms，P95 超过 1s |
| **单条查询** | ~170ms | 6 QPS | 受网络延迟主导 |
| **单条插入** | ~172ms | 6条/秒 | 效率低，不推荐 |
| **批量插入 (10条)** | ~330ms | 30条/秒 | 性能提升 5 倍 |
| **批量插入 (50条)** | ~360ms | 138条/秒 | 性能提升 23 倍 |
| **批量插入 (100条)** | ~370ms | 272条/秒 | 性能提升 45 倍 |
| **批量插入 (500条)** | ~360ms | 1,400条/秒 | 最优配置！ |
| **全表查询 (10K条)** | ~1,069ms | - | 数据传输为主 |
| **JSONB查询** | ~165ms | 6 QPS | 索引优化良好 |
| **索引创建** | ~189ms | - | 10K 条记录 |
| **事务操作** | ~1,160ms | <1 QPS | 5个操作组合 |
| **连接稳定性** | - | 5.67 QPS | 15秒测试 100% 成功 |

---

## ✅ 最佳实践

### 1. 批量操作优先

```javascript
// ❌ 不好：172ms × 100 = 17秒
for (let i = 0; i < 100; i++) {
  await sql`INSERT INTO users VALUES (...)`
}

// ✅ 好：500-700ms 完成
const values = Array.from({ length: 100 }, () => [...])
await sql`INSERT INTO users VALUES ${sql(values)}`
```

### 2. 分页查询

```javascript
// ❌ 不好：返回 10,000 条
const users = await sql`SELECT * FROM users`

// ✅ 好：只返回 50 条
const users = await sql`
  SELECT * FROM users
  LIMIT 50 OFFSET 0
`
```

### 3. 字段选择

```javascript
// ❌ 不好：获取所有字段
const users = await sql`SELECT * FROM users`

// ✅ 好：只选需要的字段
const users = await sql`
  SELECT id, name, email FROM users
`
```

### 4. 索引策略

```sql
-- 为常查字段创建索引
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_user_id ON posts(user_id);
CREATE INDEX idx_created_at ON users(created_at);
```

### 5. 实时同步

```javascript
// ❌ 不好：每秒轮询一次
setInterval(async () => {
  const data = await sql`SELECT * FROM users`
}, 1000)

// ✅ 好：事件驱动
supabase
  .from('users')
  .on('*', payload => console.log(payload))
  .subscribe()
```

---

## 🎯 根据场景选择方案

### Web 应用（用户操作）
- 使用分页查询
- 单条查询 170ms 可接受
- 重要数据加缓存
- 批量操作异步处理

### 数据导入/ETL
- 使用 500 条批量大小
- 可达 1,400 条/秒
- 考虑离峰时段运行

### 实时应用
- 使用 Supabase Realtime
- 避免轮询
- WebSocket 连接复用

### 分析查询
- 考虑数据仓库（如 ClickHouse）
- 或使用分析专用索引
- 离线计算推荐

### 高并发 API
- 启用连接池（已启用）
- 添加缓存层（Redis）
- 考虑读副本

---

## ⚠️ 性能陷阱

### 1. 并发连接超限
```javascript
// ❌ 危险：同时发起 50 个连接
const promises = Array.from({ length: 50 }, () =>
  sql`SELECT * FROM users`
)
await Promise.all(promises) // 可能超时

// ✅ 安全：顺序执行或使用连接池
for (let i = 0; i < 50; i++) {
  await sql`SELECT * FROM users`
}
```

### 2. 大参数列表
```javascript
// ❌ 危险：插入超过 65534 个参数
const values = Array.from({ length: 50000 }, () => [...])
await sql`INSERT INTO users VALUES ${sql(values)}`

// ✅ 安全：分批插入
const batchSize = 1000
for (let i = 0; i < values.length; i += batchSize) {
  const batch = values.slice(i, i + batchSize)
  await sql`INSERT INTO users VALUES ${sql(batch)}`
}
```

### 3. 没有索引的大表查询
```javascript
// ❌ 慢：10,000 条记录扫描 500+ ms
const user = await sql`
  SELECT * FROM users WHERE email = ${'user@example.com'}
`

// ✅ 快：有索引的查询 170ms
CREATE INDEX idx_email ON users(email);
const user = await sql`
  SELECT * FROM users WHERE email = ${'user@example.com'}
`
```

---

## 🔧 环境优化

### 连接字符串选择

**连接池（推荐）**
```
postgresql://user:password@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```
- 适合 Web 应用
- 自动连接复用
- 延迟 165-200ms

**直接连接**
```
postgresql://user:password@db.xxx.supabase.co:5432/postgres
```
- 适合长连接应用
- 更低的连接延迟
- 单客户端使用

---

## 📈 性能监控建议

### 监控哪些指标

1. **查询响应时间** - 定时记录，检测漂移
2. **错误率** - 超时/失败比例
3. **连接池使用率** - 是否充分利用
4. **吞吐量** - QPS 趋势

### 监控工具

```javascript
// 简单的性能监控
const metrics = {
  queries: 0,
  errors: 0,
  totalTime: 0
}

const trackQuery = async (fn) => {
  metrics.queries++
  const start = performance.now()
  try {
    const result = await fn()
    metrics.totalTime += performance.now() - start
    return result
  } catch (error) {
    metrics.errors++
    throw error
  }
}

// 每分钟输出报告
setInterval(() => {
  console.log(`QPS: ${metrics.queries / 60}`)
  console.log(`Error Rate: ${(metrics.errors / metrics.queries * 100).toFixed(2)}%`)
  console.log(`Avg Latency: ${(metrics.totalTime / metrics.queries).toFixed(2)}ms`)
  metrics = { queries: 0, errors: 0, totalTime: 0 }
}, 60000)
```

---

## 🔄 性能测试时间表

| 频率 | 测试 | 目的 |
|-----|------|-----|
| 每日 | `npm run benchmark` | 检测性能异常 |
| 每周 | `npm run advanced-benchmark` | 跟踪趋势 |
| 每月 | 深度分析 + 优化 | 持续改进 |
| 部署前 | 完整测试套件 | 验证性能 |

---

## 💡 进一步优化方向

### 短期（立即可做）
- [ ] 转换所有单条操作为批量
- [ ] 为高频查询字段创建索引
- [ ] 实现分页查询
- [ ] 添加 Redis 缓存

### 中期（1-2周）
- [ ] 实现查询监控和告警
- [ ] 优化数据库连接配置
- [ ] 考虑使用 CDN
- [ ] 评估读副本需求

### 长期（1个月+）
- [ ] 考虑数据库分片
- [ ] 评估迁移到不同地区
- [ ] 构建完整的可观测性系统
- [ ] 考虑自建数据库成本效益

---

## 📞 获取帮助

如性能不满足需求：

1. **查看详细报告**：`PERFORMANCE_REPORT.md`
2. **重新运行测试**：检测是否是一次性问题
3. **检查索引**：确保关键字段有索引
4. **查看 Supabase 仪表板**：检查数据库日志
5. **联系 Supabase 支持**：获取专业建议

---

*上次更新：2025-11-04*
*mako 的 Supabase 性能速查表*
