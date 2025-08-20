import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

/**
 * 移除指定用户的管理员权限。
 *
 * 路由: DELETE /api/admin/delete/:id
 * 权限: 管理员
 *
 * 路径参数:
 * - id: string 目标用户 ID
 *
 * 返回:
 * - { success: true, message }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
    adminAuthMiddleware(event);
    const db = useDatabase()
    const userId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from Admins where user_id = ${userId}`

        return {
            success: true,
            message: '管理员已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to delete admin'
        }
    }
})