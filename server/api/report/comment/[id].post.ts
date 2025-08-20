import { defineEventHandler, readBody } from 'h3'
import authMiddleware from '../../../util/auth';
import { useDatabase } from '../../../util/database';

/**
 * 举报评论。
 *
 * 路由: POST /api/report/comment/:id
 * 权限: 登录用户
 *
 * 路径参数:
 * - id: string 评论 ID
 *
 * 请求体:
 * - content: string 举报理由
 * - tweet_id: number 所属推文 ID
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
    const body = await readBody(event)
    const userInfo = event.context.auth
    const commentId = getRouterParam(event, 'id')

    if (!body['content']) {
        return {
            success: false,
            message: '内容不能为空'
        }
    }

    const newReport = {
        user_id: userInfo.userId,
        content: body['content'],
        tweet_id: body['tweet_id'],
        comment_id: commentId
    }

    try {
        await db.sql`INSERT INTO Reports(user_id, content, tweet_id, comment_id) values (${newReport.user_id}, ${newReport.content}, ${newReport.tweet_id}, ${newReport.comment_id})`;

        return {
            success: true,
            message: 'Report created successfully'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to create tweet'
        }
    }
})
