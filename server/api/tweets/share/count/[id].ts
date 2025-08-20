import { useDatabase } from '../../../../util/database'

/**
 * 获取某条推文被转发/分享的数量（统计 parent_id 指向该推文的条数）。
 *
 * 路由: GET /api/tweets/share/count/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 返回:
 * - { success: true, count: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, count?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
  const tweet_id = getRouterParam(event, 'id')
  const db = useDatabase()
  try {
    const { rows } = await db.sql`SELECT COUNT(*) AS count FROM Tweets WHERE parent_id = ${tweet_id}`
    return { success: true, count: Number(rows[0].count) }
  } catch (e) {
    return { 
      success: false, 
      message: e instanceof Error ? e.message : String(e) 
    }
  }
})