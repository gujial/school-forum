import { defineEventHandler, getRouterParam } from 'h3'
import authMiddleware from '../../../../util/auth';
import { useDatabase } from '../../../../util/database';

/**
 * 检查当前用户是否点赞了指定推文。
 *
 * 路由: GET /api/tweets/like/check/:id
 * 权限: 登录用户
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 返回:
 * - { success: true, like: boolean }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, like?: boolean, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const db = useDatabase();
    const tweetId = getRouterParam(event, 'id');
    const userInfo = event.context.auth

    if (tweetId == undefined) {
        return {
          success: false,
          message: 'Need ids'
        }
      }
  
    try {
        const {rows} = await db.sql`SELECT * FROM Likes WHERE user_id = ${userInfo.userId} AND tweet_id = ${tweetId}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
          }

        if (rows.length > 0) {
            return {
                success: true,
                like: true
            };
        } else {
            return {
                success: true,
                like: false
            };
        }
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to Like'
        };
    }
  });
  