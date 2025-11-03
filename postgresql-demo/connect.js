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

async function testConnection() {
  try {
    console.log('正在连接到 Supabase PostgreSQL...')
    console.log(`连接字符串: ${connectionString.replace(/:[^@]*@/, ':***@')}\n`)

    // 测试连接
    const result = await sql`SELECT NOW() as current_time`
    console.log('✅ ✅ ✅ 连接成功！✅ ✅ ✅\n')
    console.log('当前数据库时间:', result[0].current_time)

    // 获取数据库信息
    const dbResult = await sql`
      SELECT
        current_user as user,
        current_database() as database,
        version() as version
    `

    console.log('\n📊 数据库信息：')
    console.log(`  用户: ${dbResult[0].user}`)
    console.log(`  数据库: ${dbResult[0].database}`)
    console.log(`  版本: ${dbResult[0].version.split(',')[0]}`)

    return true
  } catch (error) {
    console.error('❌ 连接失败！')
    console.error(`错误: ${error.message}`)
    if (error.code) {
      console.error(`代码: ${error.code}`)
    }
    return false
  } finally {
    await sql.end()
  }
}

testConnection()
