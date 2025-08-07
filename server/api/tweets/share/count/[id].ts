import { useDatabase } from '../../../../util/database'

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