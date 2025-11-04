# Supabase 性能测试指南

欢迎使用 PostgreSQL Demo 项目的性能测试套件！本指南将帮助你快速上手。

## 📖 文档导航

### 新手入门 👶
1. **README.md** - 项目概述和快速开始
2. **TESTING_GUIDE.md** ← 你在这里（这个文件）
3. **PERFORMANCE_CHEATSHEET.md** - 性能速查表

### 深度学习 📚
1. **PERFORMANCE_REPORT.md** - 完整的性能分析报告

### 源代码 💻
1. **connect.js** - 基础连接测试
2. **benchmark.js** - 全面的性能基准测试
3. **advanced-benchmark.js** - 深度的性能分析

---

## 🎯 根据你的需求选择

### "我想快速了解 Supabase 的速度"

1. 阅读：**README.md** 的 📊 性能快照部分
2. 运行：`npm run connect`
3. 查看：**PERFORMANCE_CHEATSHEET.md** 的关键指标表

**耗时：5 分钟**

---

### "我想完整测试自己的 Supabase 数据库"

1. 配置：编辑 `.env.local`
2. 运行：`npm run benchmark`
3. 查看：输出的性能报告
4. 分析：对照 **PERFORMANCE_REPORT.md**

**耗时：20 分钟**

---

### "我想深度分析性能瓶颈"

1. 配置：编辑 `.env.local`
2. 运行：`npm run advanced-benchmark`
3. 阅读：**PERFORMANCE_REPORT.md** 的完整分析
4. 参考：**PERFORMANCE_CHEATSHEET.md** 的优化建议
5. 实施：选择适合的优化策略

**耗时：1-2 小时**

---

### "我想对标其他服务"

1. 查看：**PERFORMANCE_REPORT.md** 中的对标表
2. 理解：为什么不同服务有不同性能
3. 评估：你的使用场景是否需要更高性能

**耗时：30 分钟**

---

## 🚀 快速开始

### 步骤 1：配置环境

```bash
# 进入项目目录
cd postgresql-demo

# 安装依赖
npm install

# 编辑 .env.local，填入你的 Supabase 凭证
# DATABASE_URL=postgresql://user:password@host:5432/postgres
```

### 步骤 2：测试连接

```bash
npm run connect
```

预期输出：
```
✅ ✅ ✅ 连接成功！✅ ✅ ✅

当前数据库时间: 2025-11-04T06:30:45.123Z

📊 数据库信息：
  用户: postgres.xxx
  数据库: postgres
  版本: PostgreSQL 15.x
```

### 步骤 3：运行性能测试

选择一个：

**快速测试（~20秒）**
```bash
npm run benchmark
```

**深度测试（~2-3分钟）**
```bash
npm run advanced-benchmark
```

### 步骤 4：分析结果

查看输出的性能数据，对照：
- **PERFORMANCE_CHEATSHEET.md** - 快速查询参考
- **PERFORMANCE_REPORT.md** - 详细分析和建议

---

## 📊 理解输出数据

### 基础测试输出示例

```
📍 连接延迟测试
平均延迟: 269.44ms      ← 网络延迟
最小延迟: 164.16ms      ← 最好的情况
最大延迟: 1186.30ms     ← 最坏的情况（偶发）

📝 单条插入测试
平均单条插入耗时: 171.81ms  ← 单条操作很慢
总耗时: 8590.29ms            ← 50 次插入的总时间

📦 批量插入测试
[各个批量大小的性能数据]

📊 性能测试报告
总测试数: 79
成功: 79 ✅             ← 稳定性好
失败: 0 ❌
```

**关键要点：**
- 延迟 160-170ms 是网络往返时间（RTT）
- 单条操作 170ms 左右基本正常
- 批量操作速度快 10-30 倍
- 成功率 100% 说明连接稳定

### 高级测试输出示例

```
📡 网络延迟分析
平均延迟: 208.98ms
中位数: 164.93ms       ← 50% 的请求在这个时间
P95: 1017.72ms         ← 95% 的请求快于这个时间
P99: 1017.72ms         ← 99% 的请求快于这个时间

延迟分布:
  <100ms: 0%
  100-200ms: 95%       ← 大部分请求在这个范围
  >500ms: 5%           ← 偶发的慢请求
```

**关键要点：**
- P95/P99 用于衡量"最坏情况"的性能
- 95% 的请求延迟 < P95
- 如果 P99 很高，说明有偶发的慢查询

---

## 🔍 常见问题

### Q: 延迟为什么这么高（160-200ms）？

**A:** 这是地理距离和网络延迟导致的。
- Supabase 在澳大利亚（ap-southeast-2）
- 中国到澳大利亚单向延迟 ~80-100ms
- 加上数据库处理、路由等开销
- 总延迟 160-200ms 是正常的

**改善方案：**
1. 迁移到更近的地区（需要 Supabase 支持）
2. 使用缓存减少数据库查询
3. 使用批量操作分摊网络开销

### Q: 为什么单条插入这么慢？

**A:** 每条插入都要往返一次网络（170ms）。

**解决方案：**
```javascript
// ❌ 慢：170ms × 100 = 17 秒
for (let i = 0; i < 100; i++) {
  await sql`INSERT INTO users VALUES (...)`
}

// ✅ 快：360ms 完成
const values = Array.from({ length: 100 }, () => [...])
await sql`INSERT INTO users VALUES ${sql(values)}`
// 性能提升 47 倍！
```

### Q: QPS 为什么这么低（5.67）？

**A:** 网络延迟限制了每秒最多能做多少个简单查询。

`QPS = 1000ms / 平均延迟`

- 延迟 170ms 时，最多 ~6 QPS
- 要提高 QPS，需要：
  1. 减少延迟（迁移地域）
  2. 使用批量操作
  3. 使用缓存和异步处理
  4. 或增加并发数

### Q: 如何改善性能？

**A:** 按优先级：

**高优先级（立即做）**
1. 使用批量操作（性能提升 10-50 倍）
2. 为关键字段创建索引
3. 实现分页查询

**中优先级（一周内）**
1. 添加 Redis 缓存
2. 优化数据库查询
3. 实现连接池（已启用）

**低优先级（按需）**
1. 迁移地域
2. 使用读副本
3. 考虑自建数据库

---

## 📈 性能趋势追踪

定期运行测试，记录性能变化：

```bash
# 创建性能日志
mkdir -p performance-logs

# 定期运行测试并保存结果
npm run benchmark > performance-logs/$(date +%Y%m%d_%H%M%S).log

# 对比不同时间的性能
diff performance-logs/20251104_120000.log \
    performance-logs/20251104_180000.log
```

关注以下指标的变化：
- 平均延迟是否增加
- 错误率是否上升
- 吞吐量是否下降

如果出现趋势性恶化，可能表明：
- 数据量增加导致的性能退化
- 数据库索引需要优化
- Supabase 服务质量问题

---

## 🎓 学习路径

### 初级（了解基础）
1. 运行 `npm run connect`
2. 读 README.md
3. 查看 PERFORMANCE_CHEATSHEET.md

**目标：** 理解 Supabase 的基本性能特性

### 中级（理解原理）
1. 运行 `npm run benchmark`
2. 读 PERFORMANCE_REPORT.md
3. 理解为什么有这些性能特性

**目标：** 知道如何优化你的应用

### 高级（深度优化）
1. 运行 `npm run advanced-benchmark`
2. 分析每个测试项目的详细数据
3. 修改测试参数进行自定义测试

**目标：** 能够针对特定场景优化

---

## 💾 数据保留注意

### benchmark.js
- **保留测试表** ✅（默认行为）
- 用途：进一步分析
- 清理：手动删除或修改脚本

### advanced-benchmark.js
- **自动清理** ✅（默认行为）
- 用途：避免占用空间
- 若需保留：修改脚本末尾的 cleanup 参数

---

## 🔗 相关资源

### Supabase 官方
- [官方文档](https://supabase.io/docs)
- [性能最佳实践](https://supabase.io/docs/guides/database/performance)
- [连接池指南](https://supabase.io/docs/guides/database/connecting-to-postgres)

### PostgreSQL
- [官方文档](https://www.postgresql.org/docs/)
- [性能优化](https://www.postgresql.org/docs/current/performance-tips.html)
- [索引类型](https://www.postgresql.org/docs/current/indexes.html)

### 第三方工具
- [pgAdmin](https://www.pgadmin.org/) - 数据库管理
- [DataGrip](https://www.jetbrains.com/datagrip/) - 数据库 IDE
- [DBeaver](https://dbeaver.io/) - 数据库工具

---

## 📞 获取帮助

### 测试遇到问题？

1. **连接失败**
   - 检查 `.env.local` 中的 DATABASE_URL
   - 确保网络可以访问 Supabase
   - 检查凭证是否正确

2. **参数超限错误**
   - 减少批量大小（<1000）
   - 使用高级测试的分批方法

3. **性能不符预期**
   - 检查是否在高峰时段测试
   - 运行多次检测是否一致
   - 查看 Supabase 仪表板的日志

### 需要优化建议？

1. 查看 PERFORMANCE_CHEATSHEET.md
2. 查看 PERFORMANCE_REPORT.md 的优化建议
3. 根据你的具体场景选择优化策略

---

*最后更新：2025-11-04*
*由 Claude Code 生成*
