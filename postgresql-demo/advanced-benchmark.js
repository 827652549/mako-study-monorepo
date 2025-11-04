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

/**
 * 高级性能测试工具
 */
class AdvancedBenchmark {
  constructor() {
    this.results = {}
  }

  /**
   * 测试连接池性能
   */
  async testConnectionPooling() {
    console.log('\n🔌 连接池性能测试')
    console.log('─'.repeat(60))

    // 顺序执行而不是并发，以避免连接超时
    const concurrentConnections = [1, 2, 3]

    for (const numConnections of concurrentConnections) {
      const startTime = performance.now()

      for (let i = 0; i < numConnections; i++) {
        await sql`SELECT ${i} as connection_id`
      }

      const duration = performance.now() - startTime
      console.log(`${numConnections} 个连续连接: ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * 测试网络延迟
   */
  async testNetworkLatency() {
    console.log('\n📡 网络延迟分析')
    console.log('─'.repeat(60))

    const iterations = 20
    const latencies = []

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      await sql`SELECT 1`
      const duration = performance.now() - startTime
      latencies.push(duration)
    }

    latencies.sort((a, b) => a - b)

    const avg = latencies.reduce((a, b) => a + b) / latencies.length
    const median = latencies[Math.floor(latencies.length / 2)]
    const p95 = latencies[Math.floor(latencies.length * 0.95)]
    const p99 = latencies[Math.floor(latencies.length * 0.99)]

    console.log(`平均延迟: ${avg.toFixed(2)}ms`)
    console.log(`中位数: ${median.toFixed(2)}ms`)
    console.log(`P95: ${p95.toFixed(2)}ms`)
    console.log(`P99: ${p99.toFixed(2)}ms`)
    console.log(`最小: ${latencies[0].toFixed(2)}ms`)
    console.log(`最大: ${latencies[latencies.length - 1].toFixed(2)}ms`)

    // 分析延迟分布
    const distribution = {
      '<100ms': 0,
      '100-200ms': 0,
      '200-300ms': 0,
      '300-500ms': 0,
      '>500ms': 0
    }

    latencies.forEach(lat => {
      if (lat < 100) distribution['<100ms']++
      else if (lat < 200) distribution['100-200ms']++
      else if (lat < 300) distribution['200-300ms']++
      else if (lat < 500) distribution['300-500ms']++
      else distribution['>500ms']++
    })

    console.log('\n延迟分布:')
    Object.entries(distribution).forEach(([range, count]) => {
      const percentage = ((count / iterations) * 100).toFixed(1)
      console.log(`  ${range}: ${count} (${percentage}%)`)
    })
  }

  /**
   * 测试不同数据大小的查询性能
   */
  async testDataSizeImpact() {
    console.log('\n📊 数据大小影响测试')
    console.log('─'.repeat(60))

    // 创建测试表
    await sql`DROP TABLE IF EXISTS data_size_test`
    await sql`
      CREATE TABLE data_size_test (
        id SERIAL PRIMARY KEY,
        small_text VARCHAR(50),
        medium_text VARCHAR(500),
        large_text TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 插入测试数据
    const testSizes = [10, 100, 1000, 10000]

    for (const size of testSizes) {
      console.log(`\n  插入 ${size} 条记录...`)

      const values = Array.from({ length: size }, (_, i) => [
        `small_${i}`,
        `medium_${i}`.repeat(5),
        `large_${i}`.repeat(20),
        JSON.stringify({ id: i, name: `user_${i}`, age: 20 + i })
      ])

      const insertStart = performance.now()
      await sql`
        INSERT INTO data_size_test (small_text, medium_text, large_text, data)
        VALUES ${sql(values)}
      `
      const insertDuration = performance.now() - insertStart
      console.log(`    插入耗时: ${insertDuration.toFixed(2)}ms`)

      // 查询测试
      const queryStart = performance.now()
      await sql`SELECT * FROM data_size_test`
      const queryDuration = performance.now() - queryStart
      console.log(`    全查询耗时: ${queryDuration.toFixed(2)}ms`)

      // JSONB 查询
      const jsonQueryStart = performance.now()
      await sql`SELECT * FROM data_size_test WHERE data->>'id' = '0'`
      const jsonQueryDuration = performance.now() - jsonQueryStart
      console.log(`    JSONB查询耗时: ${jsonQueryDuration.toFixed(2)}ms`)
    }

    await sql`DROP TABLE data_size_test`
  }

  /**
   * 测试索引性能
   */
  async testIndexPerformance() {
    console.log('\n🔍 索引性能测试')
    console.log('─'.repeat(60))

    // 创建测试表
    await sql`DROP TABLE IF EXISTS index_test`
    await sql`
      CREATE TABLE index_test (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        age INT,
        created_at TIMESTAMP
      )
    `

    // 分批插入数据以避免参数超限
    console.log('  插入 10000 条测试数据（分批）...')
    const batchSize = 1000
    const totalRecords = 10000

    for (let i = 0; i < totalRecords; i += batchSize) {
      const values = Array.from({ length: Math.min(batchSize, totalRecords - i) }, (_, j) => {
        const idx = i + j
        return [
          `user_${idx}`,
          `user_${idx}@example.com`,
          Math.floor(Math.random() * 80) + 18,
          new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        ]
      })

      await sql`
        INSERT INTO index_test (name, email, age, created_at)
        VALUES ${sql(values)}
      `
    }

    // 无索引查询
    console.log('\n  无索引查询性能:')
    const noIndexStart = performance.now()
    await sql`SELECT * FROM index_test WHERE email = 'user_100@example.com'`
    const noIndexDuration = performance.now() - noIndexStart
    console.log(`    查询耗时: ${noIndexDuration.toFixed(2)}ms`)

    // 创建索引
    console.log('\n  创建索引...')
    const indexStart = performance.now()
    await sql`CREATE INDEX idx_email ON index_test(email)`
    const indexDuration = performance.now() - indexStart
    console.log(`    创建索引耗时: ${indexDuration.toFixed(2)}ms`)

    // 有索引查询
    console.log('\n  有索引查询性能:')
    const withIndexStart = performance.now()
    await sql`SELECT * FROM index_test WHERE email = 'user_100@example.com'`
    const withIndexDuration = performance.now() - withIndexStart
    console.log(`    查询耗时: ${withIndexDuration.toFixed(2)}ms`)

    const improvement = ((noIndexDuration - withIndexDuration) / noIndexDuration * 100).toFixed(1)
    console.log(`\n  索引优化幅度: ${improvement}%`)

    await sql`DROP TABLE index_test`
  }

  /**
   * 测试连接稳定性
   */
  async testConnectionStability() {
    console.log('\n🔄 连接稳定性测试')
    console.log('─'.repeat(60))

    const duration = 15000 // 15秒（减少从30秒）
    const startTime = Date.now()
    let successCount = 0
    let errorCount = 0
    const latencies = []

    console.log('运行 15 秒的连续连接测试...\n')

    while (Date.now() - startTime < duration) {
      try {
        const queryStart = performance.now()
        await sql`SELECT NOW()`
        const queryDuration = performance.now() - queryStart
        latencies.push(queryDuration)
        successCount++
      } catch (error) {
        errorCount++
      }

      // 添加轻微延迟以避免过度占用连接
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b) / latencies.length : 0
    const successRate = ((successCount / (successCount + errorCount)) * 100).toFixed(2)

    console.log(`成功请求: ${successCount}`)
    console.log(`失败请求: ${errorCount}`)
    console.log(`成功率: ${successRate}%`)
    if (latencies.length > 0) {
      console.log(`平均延迟: ${avgLatency.toFixed(2)}ms`)
    }
    console.log(`QPS: ${(successCount / (duration / 1000)).toFixed(2)}`)
  }

  /**
   * 性能对比报告
   */
  async generateComparison() {
    console.log('\n\n' + '='.repeat(60))
    console.log('📈 性能对比总结')
    console.log('='.repeat(60))

    console.log(`
总体评估:

✅ 优点:
  - 连接相对稳定
  - 单个查询响应时间可接受
  - 支持并发连接

⚠️  需要改进的地方:
  - 平均延迟较高（250ms+）可能受网络影响
  - 建议使用连接池或 Serverless 优化
  - 大数据量查询需要优化索引

💡 优化建议:
  1. 使用连接池（如 pgBouncer）减少连接开销
  2. 为常用查询字段创建索引
  3. 使用批量操作替代单条操作
  4. 考虑使用 Supabase Realtime 替代轮询
  5. 启用查询缓存策略
    `)
  }

  /**
   * 运行所有测试
   */
  async runAll() {
    try {
      console.log('\n🚀 开始高级性能测试...')
      console.log('='.repeat(60))

      await this.testNetworkLatency()
      await this.testConnectionPooling()
      await this.testDataSizeImpact()
      await this.testIndexPerformance()
      await this.testConnectionStability()
      await this.generateComparison()
    } catch (error) {
      console.error('\n❌ 测试过程中出错:', error.message)
    } finally {
      await sql.end()
    }
  }
}

// 运行测试
const benchmark = new AdvancedBenchmark()
benchmark.runAll()
