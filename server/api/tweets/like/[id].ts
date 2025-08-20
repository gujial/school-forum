import { defineEventHandler, getRouterParam } from 'h3';
import authMiddleware from '../../../util/auth';
import { useDatabase } from '../../../util/database';

/**
 * 点赞或取消点赞指定推文（幂等切换）。
 *
 * 路由: POST /api/tweets/like/:id
 * 权限: 登录用户
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 返回:
 * - { success: true, message }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const db = useDatabase();
    const tweetId = getRouterParam(event, 'id');
    const userInfo = event.context.auth;

    if (tweetId == undefined) {
        return {
            success: false,
            message: 'Need ids',
        };
    }

    try {
        const { rows } =
            await db.sql`SELECT * FROM Likes WHERE user_id = ${userInfo.userId} AND tweet_id = ${tweetId}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        if (rows.length > 0) {
            await db.sql`DELETE FROM Likes WHERE user_id = ${userInfo.userId} AND tweet_id = ${tweetId}`;
        } else {
            await db.sql`INSERT INTO Likes (user_id, tweet_id) VALUES (${userInfo.userId}, ${tweetId})`;
        }

        return {
            success: true,
            message: 'Like/Unlike successfully',
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to Like',
        };
    }
});
