import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDatabase } from '../../util/database'

/**
 * 获取单条评论详情。
 *
 * 路由: GET /api/comment/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 评论 ID
 *
 * 返回:
 * - { success: true, data }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const commentId = getRouterParam(event, 'id');

    try {
        const { rows } = await db.sql`SELECT * FROM Comments WHERE comment_id = ${commentId}`;

        if (rows == undefined) {
            throw createError({
                statusCode: 401,
                message: 'Create fetch failed'
            })
        }

        if (rows.length == 0) {
            throw createError({
                statusCode: 401,
                message: 'Create fetch failed'
            })
        }

        return {
            success: true,
            data: rows[0]
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch comment'
        }
    }
})