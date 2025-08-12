import mysql from 'mysql2/promise'

// 数据库连接池配置
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_forum',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// 创建连接池
const pool = mysql.createPool(poolConfig)

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 执行SQL查询
export async function executeQuery(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return { rows, success: true }
  } catch (error) {
    console.error('数据库查询错误:', error)
    return { error, success: false }
  }
}

// 执行事务
export async function executeTransaction(queries: Array<{ sql: string, params?: any[] }>) {
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const results = []
    for (const query of queries) {
      const [rows] = await connection.execute(query.sql, query.params || [])
      results.push(rows)
    }
    
    await connection.commit()
    return { results, success: true }
  } catch (error) {
    await connection.rollback()
    console.error('事务执行错误:', error)
    return { error, success: false }
  } finally {
    connection.release()
  }
}

// 关闭连接池
export async function closePool() {
  await pool.end()
}

export default pool 