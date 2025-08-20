import { useDatabase } from '../../../util/database'

/**
 * 获取某条评论下的子评论（按时间正序）。
 *
 * 路由: GET /api/comment/replies/:parent_id
 * 权限: 公开
 *
 * 路径参数:
 * - parent_id: string 父评论 ID
 *
 * 返回:
 * - { success: true, data: any[] }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const parent_id = getRouterParam(event, 'parent_id')
    const db = useDatabase()
    try {
        const { rows } = await db.sql`
      SELECT c.*, u.username
      FROM Comments c
      LEFT JOIN Users u ON c.user_id = u.user_id
      WHERE c.parent_id = ${parent_id}
      ORDER BY c.created_at ASC
    `
        return { success: true, data: rows }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return { success: false, message }
    }
})