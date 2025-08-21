import { defineEventHandler, getRouterParam } from 'h3';
import { useDatabase } from '../../util/database';
import authMiddleware from '../../util/auth';

/**
 * 关注指定用户。
 *
 * 路由: POST /api/follow/:id
 * 权限: 登录用户
 *
 * 路径参数:
 * - id: string 被关注用户 ID
 *
 * 返回:
 * - { success: true, follow: true }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, follow?: boolean, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const userInfo = event.context.auth;
    const db = useDatabase();
    const followingId = getRouterParam(event, 'id');

    try {
        await db.sql`insert into Follows(follower_id, following_id) values (${userInfo.userId}, ${followingId})`;

        return {
            success: true,
            follow: true,
        };
    } catch (error: unknown) {
        console.error('Database error:', error);
        return {
            success: false,
            message: String(error),
        };
    }
});
