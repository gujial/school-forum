import { defineEventHandler, getRouterParam } from 'h3';
import { useDatabase } from '../../../util/database';
import adminAuthMiddleware from '../../../util/adminAuth';

/**
 * 管理端删除单条举报记录。
 *
 * 路由: DELETE /api/admin/report/:id
 * 权限: 管理员
 *
 * 路径参数:
 * - id: string 举报 ID
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
    const db = useDatabase();
    const reportId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from reports where report_id = ${reportId}`;

        return {
            success: true,
            message: '举报已删除',
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to delete report',
        };
    }
});
