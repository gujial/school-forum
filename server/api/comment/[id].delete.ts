import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';
import adminAuthMiddleware from '../../util/adminAuth'

/**
 * 删除评论（包含其子评论）。
 *
 * 路由: DELETE /api/comment/:id
 * 权限: 登录用户（作者），或管理员
 *
 * 路径参数:
 * - id: string 评论 ID
 *
 * 返回:
 * - { success: true, message }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
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