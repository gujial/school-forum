import { defineEventHandler } from 'h3';
import { useDatabase } from '../../util/database';
import authMiddleware from '../../util/auth';

/**
 * 清空当前用户发送的全部私信。
 *
 * 路由: DELETE /api/message/deleteAllSend
 * 权限: 登录用户
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

    try {
        await db.sql`DELETE FROM Messages WHERE sender_id = ${userInfo.userId}`;

        return {
            success: true,
            message: '消息已全部删除',
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch message',
        };
    }
});
