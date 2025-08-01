import { executeQuery, executeTransaction } from '../config/database'

// 数据库工具类，提供与原来useDatabase()兼容的接口
export class Database {
  // 执行SQL查询，返回与原来db0兼容的格式
  async sql<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: T[], success: boolean }> {
    // 构建SQL语句
    let sql = ''
    const params: any[] = []
    
    for (let i = 0; i < strings.length; i++) {
      sql += strings[i]
      if (i < values.length) {
        sql += '?'
        params.push(values[i])
      }
    }
    
    const result = await executeQuery(sql, params)
    
    if (!result.success) {
      throw new Error(`数据库查询失败: ${result.error}`)
    }
    
    // 返回与原来db0兼容的格式
    return {
      rows: Array.isArray(result.rows) ? result.rows as T[] : [result.rows] as T[],
      success: true
    }
  }
  
  // 执行多条SQL语句（事务）
  async exec(sql: string) {
    // 分割多条SQL语句
    const statements = sql.split(';').filter(stmt => stmt.trim())
    const queries = statements.map(stmt => ({ sql: stmt.trim() }))
    
    const result = await executeTransaction(queries)
    
    if (!result.success) {
      throw new Error(`数据库执行失败: ${result.error}`)
    }
    
    return result
  }
}

// 创建数据库实例
export function useDatabase(): Database {
  return new Database()
} 