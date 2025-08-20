import { defineEventHandler, getQuery } from 'h3';
import { useDatabase } from '../../../util/database';
import adminAuthMiddleware from '../../../util/adminAuth';

/**
 * 管理端分页获取举报列表。
 *
 * 路由: GET /api/admin/report/list
 * 权限: 管理员
 *
 * 查询参数:
 * - page?: number 页号，默认 1
 * - pageSize?: number 每页数量，默认 20
 *
 * 返回:
 * - { success: true, data: any[], maxPages: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await adminAuthMiddleware(event);
    const db = useDatabase();
    const query = getQuery(event);

    if (query == undefined) {
        return {
            success: false,
            message: 'Need page number',
        };
    }

    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.pageSize ? parseInt(query.pageSize as string) : 20;

    if (page <= 0) {
        return {
            success: false,
            message: 'Wrong page number',
        };
    }

    const offset = (page - 1) * limit;

    try {
        const totalResult = await db.sql`SELECT COUNT(*) AS total FROM Reports`;
        if (!totalResult.rows) {
            throw new Error('Failed to retrieve report count');
        }
        const total = Number(totalResult.rows[0].total);
        const maxPages = Math.ceil(total / limit);

        const { rows } = await db.sql`
            SELECT * from Reports
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
            `;

        if (!rows) {
            throw new Error('Query returned undefined');
        }

        return {
            success: true,
            data: rows,
            maxPages: maxPages,
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch Reports',
        };
    }
});
