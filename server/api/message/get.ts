import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

/**
 * 获取当前用户收到的私信（排除自己发给自己的），按时间倒序分页。
 *
 * 路由: GET /api/message/get
 * 权限: 登录用户
 *
 * 查询参数:
 * - page?: number 页号，默认 1
 * - pageSize?: number 每页数量，默认 20
 *
 * 返回:
 * - { success: true, data: any[], maxPages: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const query = getQuery(event)

    if (query == undefined) {
        return {
            success: false,
            message: 'Need page number'
        }
    }

    const page = query.page as number

    if (page < 0) {
        return {
            success: false,
            message: 'Wrong page number'
        }
    }
    const limit = query.pageSize ? parseInt(query.pageSize as string) : 20
    const offset = (page - 1) * limit

    try {
        const result = await db.sql`SELECT COUNT(*) AS total FROM Messages WHERE receiver_id = ${userInfo.userId} AND sender_id != ${userInfo.userId}`
        if (result.rows === undefined) {
            throw new Error('Failed to retrieve message count')
        }
        const total = result.rows[0].total as number
        const maxPages = Math.ceil(total / limit);

        const { rows } =
            await db.sql`SELECT * FROM Messages WHERE receiver_id = ${userInfo.userId} AND sender_id != ${userInfo.userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`

        if (rows === undefined) {
            throw new Error('Query returned undefined')
        }

        return {
            success: true,
            data: rows,
            maxPages: maxPages
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch Messages'
        }
    }
})
