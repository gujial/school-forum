import { useDatabase } from '../../../util/database'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const db = useDatabase()
  try {
    const page = Number(getQuery(event).page || 1)
    const pageSize = Number(getQuery(event).pageSize || 9)
    const offset = (page - 1) * pageSize
    const { rows } = await db.sql`
      SELECT * FROM Tweets WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `
    const { rows: countRows } = await db.sql`
      SELECT COUNT(*) AS count FROM Tweets WHERE user_id = ${userId}
    `
    const maxPages = Math.ceil(Number(countRows[0].count) / pageSize)
    return { success: true, data: rows, maxPages }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, message }
  }
})