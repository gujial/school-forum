import { defineEventHandler, getRouterParam } from 'h3'
import authMiddleware from '../../../util/auth';
import { useDatabase } from '../../../util/database';

/**
 * 检查当前用户是否已关注目标用户。
 *
 * 路由: GET /api/follow/check/:id
 * 权限: 登录用户
 *
 * 路径参数:
 * - id: string 目标用户 ID
 *
 * 返回:
 * - { success: true, follow: boolean }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, follow?: boolean, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const db = useDatabase();
    const userId = getRouterParam(event, 'id');
    const userInfo = event.context.auth

    if (userId == undefined) {
        return {
            success: false,
            message: 'Need ids'
        }
    }

    try {
        const { rows } = await db.sql`SELECT * FROM Follows WHERE follower_id = ${userInfo.userId} AND following_id = ${userId}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        if (rows.length > 0) {
            return {
                success: true,
                follow: true
            };
        } else {
            return {
                success: true,
                follow: false
            };
        }
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to follow'
        };
    }
});
