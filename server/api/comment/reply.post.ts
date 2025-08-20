import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';
import { auditAndReport } from "../../util/contentModeration";

/**
 * 回复评论（子评论）。
 *
 * 路由: POST /api/comment/reply
 * 权限: 登录用户
 *
 * 请求体:
 * - tweet_id: number 所属推文 ID
 * - parent_id: number 父评论 ID
 * - content: string 回复内容
 *
 * 返回:
 * - { success: true }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const body = await readBody(event)
    const { tweet_id, parent_id, content } = body
    const user_id = event.context.auth?.userId

    if (!user_id) {
        return { success: false, message: 'Not authenticated' }
    }
    if (!tweet_id || !parent_id || !content) {
        return { success: false, message: 'Missing parameters' }
    }

    const db = useDatabase()
    try {
        await db.sql`INSERT INTO Comments (tweet_id, user_id, parent_id, content, created_at) VALUES (${tweet_id}, ${user_id}, ${parent_id}, ${content}, NOW())`
        const { rows } = await db.sql`SELECT LAST_INSERT_ID() as comment_id`;
        if (rows == undefined) {
            throw createError({
                statusCode: 401,
                message: 'Create comment failed'
            })
        }
        const commentId = rows[0].comment_id

        auditAndReport(body['content'], tweet_id, commentId)

        return { success: true }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return { success: false, message }
    }
})