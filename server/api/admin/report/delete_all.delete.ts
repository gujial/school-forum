import { defineEventHandler } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

/**
 * 管理端清空全部举报记录。
 *
 * 路由: DELETE /api/admin/report/delete_all
 * 权限: 管理员
 *
 * 返回:
 * - { success: true, message }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
    await adminAuthMiddleware(event);
    const _userInfo = event.context.auth
    const db = useDatabase()

    try {
        await db.sql`DELETE FROM Reports`;

        return {
            success: true,
            message: '举报已全部删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch report'
        }
    }
})