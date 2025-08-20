import { defineEventHandler, readBody } from 'h3';
import authMiddleware from '../../util/auth';
import { useDatabase } from '../../util/database';

/**
 * 发送私信，可关联推文或评论。
 *
 * 路由: POST /api/message/send
 * 权限: 登录用户
 *
 * 请求体:
 * - receiver_id: number 接收者用户 ID
 * - tweet_id?: number 可选，关联推文 ID
 * - comment_id?: number 可选，关联评论 ID
 * - content: string 必填，消息内容
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
    const userInfo = event.context.auth;
    const db = useDatabase();
    const body = await readBody(event);

    if (!body['content']) {
        return {
            success: false,
            message: 'Invalid input content',
        };
    }

    try {
        await db.sql`INSERT INTO Messages (sender_id, receiver_id, tweet_id, comment_id, content) VALUES (${userInfo.userId}, ${body['receiver_id']}, ${body['tweet_id'] ? body['tweet_id'] : null}, ${body['comment_id'] ? body['comment_id'] : null}, ${body['content']})`;

        return {
            success: true,
            message: 'Message created successfully',
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to create Message',
        };
    }
});
