import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

export default defineEventHandler(async (event) => {
    authMiddleware(event);
    const userInfo = event.context.auth
    const db = useDatabase()

    try {
        await db.sql`DELETE FROM Messages WHERE sender_id = ${userInfo.userId}`;

        return {
            success: true,
            message: '消息已全部删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch message'
        }
    }
})