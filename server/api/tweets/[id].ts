import { defineEventHandler, getRouterParam } from 'h3';
import { useDatabase } from '../../util/database';

/**
 * 获取单条推文详情，包含标签集合。
 *
 * 路由: GET /api/tweets/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 返回:
 * - { success: true, data: { ...tweet, tags: string[] } }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const tweetId = getRouterParam(event, 'id');

    try {
        const { rows } =
            await db.sql`SELECT t.*, GROUP_CONCAT(tag_all.name ORDER BY tag_all.name SEPARATOR ',') AS tags
       FROM Tweets t LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
       LEFT JOIN TAGS tag_all ON tt.tag_id = tag_all.tag_id WHERE t.tweet_id = ${tweetId} GROUP BY t.tweet_id`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Tweet not found',
            };
        }

        const tweet = rows[0];

        const processedTweet = {
            ...tweet,
            tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : [],
        };

        return {
            success: true,
            data: processedTweet,
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch tweet',
        };
    }
});
