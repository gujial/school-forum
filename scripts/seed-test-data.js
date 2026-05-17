import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { executeTransaction, testConnection } from '../server/config/database.runtime.js'

async function seedTestData() {
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('无法连接到数据库，请检查配置')
    process.exit(1)
  }

  const sqlFilePath = path.join('scripts', 'seed-test-data.sql')
  const sql = fs.readFileSync(sqlFilePath, 'utf8')
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  try {
    console.log(`📝 准备执行 ${statements.length} 条种子SQL语句...`)

    const result = await executeTransaction(
      statements.map((statement) => ({ sql: statement }))
    )

    if (result.success) {
      console.log('✅ 测试数据插入成功')
    } else {
      throw new Error(String(result.error))
    }
  } catch (error) {
    console.error('❌ 测试数据插入失败:', error)
    process.exit(1)
  }
}

seedTestData()