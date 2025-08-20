import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

/**
 * 取消关注指定用户。
 *
 * 路由: DELETE /api/follow/:id
 * 权限: 登录用户
 *
 * 路径参数:
 * - id: string 被取消关注用户 ID
 *
 * 返回:
 * - { success: true, follow: false }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, follow?: boolean, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const followingId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from Follows where follower_id = ${userInfo.userId} and following_id = ${followingId}`;

        return {
            success: true,
            follow: false
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to follow user'
        }
    }
})