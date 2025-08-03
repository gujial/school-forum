import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const body = await readBody(event)
    const { tweet_id, parent_id, content } = body
    const user_id = event.context.auth?.userId

    if (!user_id) {
        return { success: false, message: 'Not authenticated' }
    }
    if (!tweet_id || !parent_id || !content) {
        return { success: false, message: 'Missing parameters' }
    }

    const db = useDatabase()
    try {
        await db.sql`
      INSERT INTO Comments (tweet_id, user_id, parent_id, content, created_at)
      VALUES (${tweet_id}, ${user_id}, ${parent_id}, ${content}, NOW())
    `
        return { success: true }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return { success: false, message }
    }
})