import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import { useDatabase } from '../../../util/database'

/**
 * 获取某条推文下的顶级评论，按时间倒序，分页返回。
 *
 * 路由: GET /api/comment/order_by_time/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 查询参数:
 * - page: number 必填，页号
 * - pageSize?: number 每页数量，默认 20
 *
 * 返回:
 * - { success: true, data: any[], maxPages: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const tweetId = getRouterParam(event, 'id')
    const query = getQuery(event)
  
    if (tweetId == undefined || query == undefined) {
      return {
        success: false,
        message: 'Need page number and id'
      }
    }
  
    const page = query.page as number
  
    if (page < 0) {
      return {
        success: false,
        message: 'Wrong page number'
      }
    }
    const limit = query.pageSize ? parseInt(query.pageSize as string) : 20
    const offset = (page - 1) * limit
  
    try {
      const result = await db.sql`SELECT COUNT(*) AS total FROM Comments WHERE tweet_id = ${tweetId} AND parent_id is NULL`
      if (result.rows === undefined) {
        throw new Error('Failed to retrieve tweet count')
      }
      const total = result.rows[0].total as number
      const maxPages = Math.ceil(total / limit);
  
      const { rows } =
        await db.sql`SELECT * FROM Comments WHERE tweet_id = ${tweetId} AND parent_id is NULL ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  
      if (rows === undefined) {
        throw new Error('Query returned undefined')
      }
  
      return {
        success: true,
        data: rows,
        maxPages: maxPages
      }
    } catch (error) {
      console.error('Database error:', error)
      return {
        success: false,
        message: 'Failed to fetch Comments'
      }
    }
  })
  