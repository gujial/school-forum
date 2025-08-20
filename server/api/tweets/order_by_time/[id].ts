import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../../util/database'

/**
 * 按时间倒序分页获取推文列表。
 *
 * 路由: GET /api/tweets/order_by_time/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 页号（page）
 *
 * 返回:
 * - { success: true, data: any[], maxPages: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const pageParam = getRouterParam(event, 'id')

  if (pageParam == undefined) {
    return {
      success: false,
      message: 'Need page number'
    }
  }

  const page = parseInt(pageParam)

  if (page < 0) {
    return {
      success: false,
      message: 'Wrong page number'
    }
  }
  const limit = 20
  const offset = (page - 1) * limit

  try {
    const result = await db.sql`SELECT COUNT(*) AS total FROM Tweets`
    if (result.rows === undefined) {
      throw new Error('Failed to retrieve tweet count')
    }
    const total = result.rows[0].total as number
    const maxPages = Math.ceil(total / limit);

    const { rows } =
      await db.sql`SELECT 
        t.*,
        GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
      FROM Tweets t
      LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
      LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
      GROUP BY t.tweet_id
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`

    if (rows === undefined) {
      throw new Error('Query returned undefined')
    }

    const tweets = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    const processedTweets = tweets.map(tweet => ({
      ...tweet,
      tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : []
    }));

    return {
      success: true,
      data: processedTweets,
      maxPages: maxPages
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      message: 'Failed to fetch tweet'
    }
  }
})
