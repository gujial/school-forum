import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';
import adminAuthMiddleware from '../../util/adminAuth'

export default defineEventHandler(async (event) => {
    authMiddleware(event);
    const db = useDatabase()
    const commentId = getRouterParam(event, 'id');
    const userInfo = event.context.auth;

    try {
        const { rows } = await db.sql`select user_id from Comments where comment_id = ${commentId}`

        if (rows[0].user_id != userInfo.userId) {
            adminAuthMiddleware(event);
        }

        await db.sql`DELETE FROM Comments WHERE comment_id = ${commentId}`;
        await db.sql`DELETE FROM Comments WHERE parent_id = ${commentId}`;

        return {
            success: true,
            message: '评论已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to delete comment'
        }
    }
})