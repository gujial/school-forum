import { useDatabase } from '../../../util/database'

export default defineEventHandler(async (event) => {
    const parent_id = getRouterParam(event, 'parent_id')
    const db = useDatabase()
    try {
        const { rows } = await db.sql`
      SELECT c.*, u.username
      FROM Comments c
      LEFT JOIN Users u ON c.user_id = u.user_id
      WHERE c.parent_id = ${parent_id}
      ORDER BY c.created_at ASC
    `
        return { success: true, data: rows }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return { success: false, message }
    }
})