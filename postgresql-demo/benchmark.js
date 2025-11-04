import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ 错误：DATABASE_URL 未设置')
  console.error('请编辑 .env.local 文件')
  process.exit(1)
}

const sql = postgres(connectionString)

// 性能测试工具类
class SupabaseBenchmark {
  constructor() {
    this.results = []
  }

  /**
   * 测量操作耗时
   */
  async measure(name, fn) {
    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      this.results.push({
        name,
        duration,
        status: '✅',
        error: null
      })
      return { result, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      this.results.push({
        name,
        duration,
        status: '❌',
        error: error.message
      })
      throw error
    }
  }

  /**
   * 测试连接延迟
   */
  async testLatency() {
    console.log('\n📍 连接延迟测试')
    console.log('─'.repeat(50))

    const latencies = []
    const iterations = 10

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measure(`连接 #${i + 1}`, async () => {
        return await sql`SELECT 1`
      })
      latencies.push(duration)
    }

    const avg = latencies.reduce((a, b) => a + b) / latencies.length
    const min = Math.min(...latencies)
    const max = Math.max(...latencies)

    console.log(`平均延迟: ${avg.toFixed(2)}ms`)
    console.log(`最小延迟: ${min.toFixed(2)}ms`)
    console.log(`最大延迟: ${max.toFixed(2)}ms`)

    return { avg, min, max, latencies }
  }

  /**
   * 创建测试表
   */
  async createTestTable() {
    console.log('\n🔨 创建测试表')
    console.log('─'.repeat(50))

    await this.measure('删除旧表（如果存在）', async () => {
      return await sql`DROP TABLE IF EXISTS benchmark_test`
    })

    await this.measure('创建新表', async () => {
      return await sql`
        CREATE TABLE benchmark_test (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255),
          age INT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    })

    console.log('✅ 测试表创建成功')
  }

  /**
   * 测试单条插入
   */
  async testSingleInsert() {
    console.log('\n📝 单条插入测试')
    console.log('─'.repeat(50))

    const iterations = 50

    for (let i = 0; i < iterations; i++) {
      await this.measure(`单条插入 #${i + 1}`, async () => {
        return await sql`
          INSERT INTO benchmark_test (name, email, age, description)
          VALUES (${`user_${i}`}, ${`user_${i}@example.com`}, ${Math.floor(Math.random() * 80) + 18}, ${`Description for user ${i}`})
        `
      })
    }

    const singleResults = this.results.filter(r => r.name.startsWith('单条插入'))
    const avgDuration = singleResults.reduce((sum, r) => sum + r.duration, 0) / singleResults.length

    console.log(`\n平均单条插入耗时: ${avgDuration.toFixed(2)}ms`)
    console.log(`总耗时: ${singleResults.reduce((sum, r) => sum + r.duration, 0).toFixed(2)}ms`)
  }

  /**
   * 测试批量插入
   */
  async testBulkInsert() {
    console.log('\n📦 批量插入测试')
    console.log('─'.repeat(50))

    const batchSizes = [10, 50, 100, 500]

    for (const batchSize of batchSizes) {
      const values = Array.from({ length: batchSize }, (_, i) => ({
        name: `bulk_user_${i}`,
        email: `bulk_${i}@example.com`,
        age: Math.floor(Math.random() * 80) + 18,
        description: `Bulk insert user ${i}`
      }))

      await this.measure(`批量插入 ${batchSize} 条记录`, async () => {
        return await sql`
          INSERT INTO benchmark_test (name, email, age, description)
          VALUES ${sql(values.map(v => [v.name, v.email, v.age, v.description]))}
        `
      })
    }
  }

  /**
   * 测试查询性能
   */
  async testQueryPerformance() {
    console.log('\n🔍 查询性能测试')
    console.log('─'.repeat(50))

    // 获取总记录数
    const countResult = await sql`SELECT COUNT(*) as count FROM benchmark_test`
    const totalRecords = countResult[0].count
    console.log(`\n当前表中有 ${totalRecords} 条记录\n`)

    // 测试不同大小的查询
    await this.measure('查询所有记录', async () => {
      return await sql`SELECT * FROM benchmark_test`
    })

    await this.measure('查询前100条记录', async () => {
      return await sql`SELECT * FROM benchmark_test LIMIT 100`
    })

    await this.measure('查询前1000条记录', async () => {
      return await sql`SELECT * FROM benchmark_test LIMIT 1000`
    })

    await this.measure('聚合查询（计数）', async () => {
      return await sql`SELECT COUNT(*) FROM benchmark_test`
    })

    await this.measure('聚合查询（分组）', async () => {
      return await sql`SELECT age, COUNT(*) as count FROM benchmark_test GROUP BY age`
    })

    await this.measure('索引查询（主键）', async () => {
      return await sql`SELECT * FROM benchmark_test WHERE id = 1`
    })

    await this.measure('模糊查询', async () => {
      return await sql`SELECT * FROM benchmark_test WHERE name LIKE ${'%user%'} LIMIT 100`
    })
  }

  /**
   * 测试更新操作
   */
  async testUpdatePerformance() {
    console.log('\n✏️ 更新操作测试')
    console.log('─'.repeat(50))

    await this.measure('单条记录更新', async () => {
      return await sql`UPDATE benchmark_test SET age = age + 1 WHERE id = 1`
    })

    await this.measure('批量更新（100条）', async () => {
      return await sql`UPDATE benchmark_test SET updated_at = CURRENT_TIMESTAMP WHERE id <= 100`
    })

    await this.measure('条件更新', async () => {
      return await sql`UPDATE benchmark_test SET age = 99 WHERE age < 25`
    })
  }

  /**
   * 测试删除操作
   */
  async testDeletePerformance() {
    console.log('\n🗑️  删除操作测试')
    console.log('─'.repeat(50))

    // 获取最大 ID
    const maxIdResult = await sql`SELECT MAX(id) as max_id FROM benchmark_test`
    const maxId = maxIdResult[0].max_id

    if (maxId > 1) {
      await this.measure('删除单条记录', async () => {
        return await sql`DELETE FROM benchmark_test WHERE id = ${maxId}`
      })
    }

    // 计数当前记录
    const countResult = await sql`SELECT COUNT(*) as count FROM benchmark_test`
    const currentCount = countResult[0].count

    if (currentCount > 100) {
      const newMaxIdResult = await sql`SELECT MAX(id) as max_id FROM benchmark_test`
      const newMaxId = newMaxIdResult[0].max_id

      await this.measure('删除100条记录', async () => {
        return await sql`DELETE FROM benchmark_test WHERE id > ${newMaxId - 100}`
      })
    }
  }

  /**
   * 测试事务性能
   */
  async testTransactionPerformance() {
    console.log('\n💼 事务性能测试')
    console.log('─'.repeat(50))

    await this.measure('简单事务（5个操作）', async () => {
      return await sql.begin(async (sql) => {
        await sql`INSERT INTO benchmark_test (name, email, age, description) VALUES ('tx_user_1', 'tx1@example.com', 25, 'Transaction test 1')`
        await sql`INSERT INTO benchmark_test (name, email, age, description) VALUES ('tx_user_2', 'tx2@example.com', 26, 'Transaction test 2')`
        await sql`INSERT INTO benchmark_test (name, email, age, description) VALUES ('tx_user_3', 'tx3@example.com', 27, 'Transaction test 3')`
        await sql`UPDATE benchmark_test SET age = 30 WHERE name = 'tx_user_1'`
        return await sql`SELECT COUNT(*) FROM benchmark_test`
      })
    })
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    console.log('\n\n' + '='.repeat(60))
    console.log('📊 性能测试报告')
    console.log('='.repeat(60))

    const successResults = this.results.filter(r => r.status === '✅')
    const failedResults = this.results.filter(r => r.status === '❌')

    console.log(`\n总测试数: ${this.results.length}`)
    console.log(`成功: ${successResults.length} ✅`)
    console.log(`失败: ${failedResults.length} ❌`)

    if (failedResults.length > 0) {
      console.log('\n⚠️  失败的操作:')
      failedResults.forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`)
      })
    }

    console.log('\n📈 详细结果:')
    console.log('─'.repeat(60))

    // 按类别分组
    const categories = {}
    successResults.forEach(r => {
      const category = r.name.split(' ')[0]
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(r)
    })

    Object.entries(categories).forEach(([category, results]) => {
      const durations = results.map(r => r.duration)
      const avg = durations.reduce((a, b) => a + b) / durations.length
      const total = durations.reduce((a, b) => a + b)
      const min = Math.min(...durations)
      const max = Math.max(...durations)

      console.log(`\n${category}:`)
      console.log(`  计数: ${results.length}`)
      console.log(`  平均: ${avg.toFixed(2)}ms`)
      console.log(`  最小: ${min.toFixed(2)}ms`)
      console.log(`  最大: ${max.toFixed(2)}ms`)
      console.log(`  总计: ${total.toFixed(2)}ms`)
    })

    const totalDuration = successResults.reduce((sum, r) => sum + r.duration, 0)
    console.log(`\n总耗时: ${totalDuration.toFixed(2)}ms (${(totalDuration / 1000).toFixed(2)}s)`)

    // 性能建议
    console.log('\n💡 性能建议:')
    const avgLatency = this.results
      .filter(r => r.name.startsWith('连接'))
      .reduce((sum, r) => sum + r.duration, 0) / this.results.filter(r => r.name.startsWith('连接')).length

    if (avgLatency > 100) {
      console.log(`  ⚠️  平均连接延迟 ${avgLatency.toFixed(2)}ms 较高，考虑使用连接池`)
    } else {
      console.log(`  ✅ 连接延迟良好 (${avgLatency.toFixed(2)}ms)`)
    }

    const singleInsertAvg = successResults
      .filter(r => r.name.startsWith('单条插入'))
      .reduce((sum, r) => sum + r.duration, 0) / successResults.filter(r => r.name.startsWith('单条插入')).length

    const bulkInsertResults = successResults.filter(r => r.name.startsWith('批量插入'))
    if (bulkInsertResults.length > 0) {
      const bulkInsertAvg = bulkInsertResults.reduce((sum, r) => sum + r.duration, 0) / bulkInsertResults.length
      const improvement = ((singleInsertAvg - bulkInsertAvg) / singleInsertAvg * 100).toFixed(1)
      console.log(`  ✅ 批量插入比单条插入快 ${improvement}%`)
    }

    console.log('\n' + '='.repeat(60))
  }

  /**
   * 清理测试表
   */
  async cleanup() {
    console.log('\n🧹 清理测试数据')
    console.log('─'.repeat(50))

    try {
      await this.measure('删除测试表', async () => {
        return await sql`DROP TABLE IF EXISTS benchmark_test`
      })
      console.log('✅ 清理完成')
    } catch (error) {
      console.error('❌ 清理失败:', error.message)
    }
  }

  /**
   * 运行所有测试
   */
  async runAll(options = {}) {
    const { cleanup: shouldCleanup = true } = options

    try {
      console.log('\n🚀 开始 Supabase 性能测试...')
      console.log('='.repeat(60))

      await this.testLatency()
      await this.createTestTable()
      await this.testSingleInsert()
      await this.testBulkInsert()
      await this.testQueryPerformance()
      await this.testUpdatePerformance()
      await this.testDeletePerformance()
      await this.testTransactionPerformance()

      this.generateReport()

      if (shouldCleanup) {
        await this.cleanup()
      }
    } catch (error) {
      console.error('\n❌ 测试过程中出错:', error.message)
    } finally {
      await sql.end()
    }
  }
}

// 运行测试
const benchmark = new SupabaseBenchmark()
benchmark.runAll({ cleanup: false }) // cleanup: false 保留测试表用于进一步分析
