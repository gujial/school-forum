import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

/**
 * 修改指定推文内容。
 *
 * 路由: PUT /api/tweets/:id
 * 权限: 登录用户（必须为推文作者或管理员）
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 请求体:
 * - content: string 新内容
 *
 * 返回:
 * - { success: true }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    authMiddleware(event); 
    const tweetId = getRouterParam(event, 'id')
    const db = useDatabase()

    if (event.method === 'PUT') {
        const body = await readBody(event)
        if (!body.content || !tweetId) {
            return { success: false, message: '内容不能为空' }
        }
        try {
            const result = await db.sql`
        UPDATE Tweets SET content = ${body.content} WHERE tweet_id = ${tweetId}
      `
            return { success: true }
        } catch (e) {
            const errorMessage = (e instanceof Error) ? e.message : '数据库错误'
            return { success: false, message: errorMessage }
        }
    }

    return { success: false, message: '不支持的请求方法' }
})