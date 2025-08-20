import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

/**
 * 管理员删除指定用户。
 *
 * 路由: DELETE /api/admin/delete_user/:id
 * 权限: 管理员
 *
 * 路径参数:
 * - id: string 被删除用户的 user_id
 *
 * 返回:
 * - { success: true, message: string }
 * - { success: false, message: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
    adminAuthMiddleware(event);
    const db = useDatabase()
    const userId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from Users where user_id = ${userId}`

        return {
            success: true,
            message: '用户已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to delete user'
        }
    }
})