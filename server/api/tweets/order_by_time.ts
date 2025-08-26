import { defineEventHandler } from 'h3';
import { useDatabase } from '../../util/database';

/**
 * 按时间倒序分页获取推文列表。
 *
 * 路由: GET /api/tweets/order_by_time/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 页号（page）
 *
 * 返回:
 * - { success: true, data: any[], maxPages: number }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event
 * @returns {Promise<{success: boolean, data?: any[], maxPages?: number, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase();
    let page, pageSize;

    if (event.method === 'GET') {
        const query = getQuery(event);
        page = parseInt(<string>query.page || '1', 10);
        pageSize = parseInt(<string>query.pageSize || '10', 10);
    } else {
        const body = await readBody(event);
        page = parseInt(body.page || '1', 10);
        pageSize = parseInt(body.pageSize || '10', 10);
    }

    if (page < 0) {
        return {
            success: false,
            message: 'Wrong page number',
        };
    }
    const limit = pageSize || 10;
    const offset = (page - 1) * limit;

    try {
        const result = await db.sql`SELECT COUNT(*) AS total FROM Tweets`;
        if (result.rows === undefined) {
            throw new Error('Failed to retrieve tweet count');
        }
        const total = result.rows[0].total as number;
        const maxPages = Math.ceil(total / limit);

        const { rows } = await db.sql`SELECT 
        t.*,
        GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
      FROM Tweets t
      LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
      LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
      GROUP BY t.tweet_id
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        const tweets = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

        const processedTweets = tweets.map((tweet) => ({
            ...tweet,
            tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : [],
        }));

        return {
            success: true,
            data: processedTweets,
            maxPages: maxPages,
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch tweet',
        };
    }
});
