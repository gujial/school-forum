import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

/**
 * 删除一条私信。
 *
 * 路由: DELETE /api/message/:id
 * 权限: 登录用户（应为消息发送者或接收者）
 *
 * 路径参数:
 * - id: string 私信 ID
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
    const db = useDatabase()
    const messageId = getRouterParam(event, 'id');

    try {
        await db.sql`DELETE FROM Messages WHERE message_id = ${messageId}`;

        return {
            success: true,
            message: '消息已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch messae'
        }
    }
})