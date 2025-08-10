import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

export default defineEventHandler(async (event) => {
    authMiddleware(event);
    const db = useDatabase()
    const messageId = getRouterParam(event, 'id');

    try {
        await db.sql`DELETE FROM Messages WHERE message_id = ${messageId}`;

        return {
            success: true,
            message: '消息已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch messae'
        }
    }
})