import { useDatabase } from '../../util/database'

export default defineEventHandler(async (event) => {
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