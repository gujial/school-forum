import { defineEventHandler, getRouterParam } from 'h3';
import { useDatabase } from '../../util/database';

/**
 * 获取某条推文下的媒体列表（不包含 `media_type = all` 的通用项）。
 *
 * 路由: GET /api/media/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 返回:
 * - { success: true, data: any[] }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const tweetId = getRouterParam(event, 'id');

    try {
        const { rows } =
            await db.sql`SELECT * FROM Media WHERE tweet_id = ${tweetId} AND media_type != ${'all'}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        return {
            success: true,
            data: rows,
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch media data',
        };
    }
});
