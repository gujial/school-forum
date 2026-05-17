import mysql from 'mysql2/promise'

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_forum',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(poolConfig)

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

export async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return { rows, success: true }
  } catch (error) {
    console.error('数据库查询错误:', error)
    return { error, success: false }
  }
}

export async function executeTransaction(queries) {
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

export async function closePool() {
  await pool.end()
}

export default pool