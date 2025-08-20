import { defineEventHandler } from 'h3';
import { useDatabase } from '../../../util/database';

/**
 * 获取指定用户的关注列表（分页）。
 *
 * 路由: GET /api/follow/get_following_list/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 查询参数:
 * - page?: number 页号，默认 1
 * - pageSize?: number 每页数量，默认 20
 *
 * 返回:
 * - { success: true, data: { following_id }[], maxPages: number, total: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, total?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const query = getQuery(event);
    const page = query.page ? parseInt(query.page as string) : 1;
    const userId = getRouterParam(event, 'id');

    if (page < 0) {
        return {
            success: false,
            message: 'Wrong page number',
        };
    }

    const limit = query.pageSize ? parseInt(query.pageSize as string) : 20;
    const offset = (page - 1) * limit;

    try {
        const result =
            await db.sql`SELECT COUNT(following_id) AS total FROM Follows WHERE follower_id = ${userId}`;
        if (result.rows === undefined) {
            throw new Error('Failed to retrieve tweet count');
        }
        const total = result.rows[0].total as number;
        const maxPages = Math.ceil(total / limit);

        const { rows } =
            await db.sql`select following_id from Follows where follower_id = ${userId} LIMIT ${limit} OFFSET ${offset}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        return {
            success: true,
            data: rows,
            maxPages: maxPages,
            total: total,
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to follow user',
        };
    }
});
