import { useDatabase } from '../../../util/database'

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
    return { success: true, data: rows, total: Number(countRows[0].count) }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, message }
  }
})