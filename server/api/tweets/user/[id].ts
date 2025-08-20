import { useDatabase } from '../../../util/database'

/**
 * 获取指定用户的推文列表（带标签），按时间倒序，分页返回。
 *
 * 路由: GET /api/tweets/user/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 查询参数:
 * - page?: number 页号，默认 1
 * - pageSize?: number 每页数量，默认 9
 *
 * 返回:
 * - { success: true, data: any[], total: number }
 * - { success: false, message: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], total?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const db = useDatabase()
  try {
    const page = Number(getQuery(event).page || 1)
    const pageSize = Number(getQuery(event).pageSize || 9)
    const offset = (page - 1) * pageSize
    const { rows } = await db.sql`
      SELECT 
        t.*,
        GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
      FROM Tweets t
      LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
      LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
      WHERE t.user_id = ${userId}
      GROUP BY t.tweet_id
      ORDER BY t.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `
    const { rows: countRows } = await db.sql`
      SELECT COUNT(*) AS count FROM Tweets WHERE user_id = ${userId}
    `

    const tweets = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    const processedTweets = tweets.map(tweet => ({
      ...tweet,
      tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : []
    }));

    return { success: true, data: processedTweets, total: Number(countRows[0].count) }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, message }
  }
})