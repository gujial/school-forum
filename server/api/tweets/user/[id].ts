import { useDatabase } from '../../../util/database'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const db = useDatabase()
  try {
    const { rows } = await db.sql`
      SELECT * FROM Tweets
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return { success: true, data: rows }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, message }
  }
})