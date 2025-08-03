import { useDatabase } from '../../util/database'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const db = useDatabase()
  try {
    const { rows } = await db.sql`SELECT bg_url FROM Users WHERE user_id = ${userId}`
    if (!rows || rows.length === 0 || !rows[0].bg_url) {
      return { success: false, data: '' }
    }
    return { success: true, data: rows[0].bg_url }
  } catch (e) {
    return { success: false, data: '' }
  }
})