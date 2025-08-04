import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDatabase } from '../../util/database'

export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const commentId = getRouterParam(event, 'id');

    try {
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
            message: 'Failed to fetch comment'
        }
    }
})