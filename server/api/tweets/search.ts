import { defineEventHandler, getQuery } from 'h3'
import { useDatabase } from '../../util/database'

/**
 * 搜索推文，支持关键词与时间排序，带分页。
 *
 * 路由: GET /api/tweets/search
 * 权限: 公开
 *
 * 查询参数:
 * - keyword?: string 关键词，默认空
 * - page?: number 页号，默认 1
 * - pageSize?: number 每页数量，默认 20
 * - order?: 'asc' | 'desc' 时间顺序，默认 desc
 *
 * 返回:
 * - { success: true, data: any[], maxPages: number }
 * - { success: false, message: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const query = getQuery(event)

    const keyword = query.keyword ? String(query.keyword).trim() : ''
    const page = query.page ? parseInt(query.page as string) : 1
    const limit = query.pageSize ? parseInt(query.pageSize as string) : 20
    const order = query.order === 'asc' ? 'ASC' : 'DESC' // 默认倒序
    const offset = (page - 1) * limit

    if (page <= 0) {
        return {
            success: false,
            message: 'Invalid page number'
        }
    }

    try {
        // 统计总数
        const countRes = await db.sql`
            SELECT COUNT(*) AS total 
            FROM Tweets 
            WHERE content LIKE ${'%' + keyword + '%'}
        `
        if (!countRes.rows) {
            throw new Error('Failed to count tweets')
        }
        const total = Number(countRes.rows[0].total) || 0
        const maxPages = Math.ceil(total / limit)

        // 查询数据
        if (order === 'DESC') {
            const { rows: tweets } = await db.sql`
            SELECT t.tweet_id, t.user_id, t.content, t.created_at, GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
            FROM Tweets t
            LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
            LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
            WHERE content LIKE ${'%' + keyword + '%'}
            GROUP BY t.tweet_id
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `
            const processedTweets = tweets.map(tweet => ({
                ...tweet,
                tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : []
            }));

            return {
                success: true,
                data: processedTweets,
                maxPages
            }
        } else {
            const { rows: tweets } = await db.sql`
            SELECT t.tweet_id, t.user_id, t.content, t.created_at, GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
            FROM Tweets t
            LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
            LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
            WHERE content LIKE ${'%' + keyword + '%'}
            GROUP BY t.tweet_id
            ORDER BY created_at ASC
            LIMIT ${limit} OFFSET ${offset}
        `
            const processedTweets = tweets.map(tweet => ({
                ...tweet,
                tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : []
            }));

            return {
                success: true,
                data: processedTweets,
                maxPages
            }
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch tweets'
        }
    }
})
