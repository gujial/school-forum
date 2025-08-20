import { useDatabase } from '../../util/database';

/**
 * 获取指定用户的背景图 URL。
 *
 * 路由: GET /api/bg/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 返回:
 * - { success: true, data: string }
 * - { success: false, data: '' }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data: string}>}
 */
export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');
    const db = useDatabase();
    try {
        const { rows } = await db.sql`SELECT bg_url FROM Users WHERE user_id = ${userId}`;
        if (!rows || rows.length === 0 || !rows[0].bg_url) {
            return { success: false, data: '' };
        }
        return { success: true, data: rows[0].bg_url };
    } catch {
        return { success: false, data: '' };
    }
});
