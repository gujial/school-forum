import { defineEventHandler, readBody, getQuery } from 'h3'
import { useDatabase } from '../../util/database';

export default defineEventHandler(async (event) => {
    const db = useDatabase();
    let tags, page, pageSize;

    if (event.method === 'GET') {
        const query = getQuery(event);
        tags = query.tags;
        page = parseInt(<string>query.page || '1', 10);
        pageSize = parseInt(<string>query.pageSize || '10', 10);
    } else {
        const body = await readBody(event);
        tags = body.tags;
        page = parseInt(body.page || '1', 10);
        pageSize = parseInt(body.pageSize || '10', 10);
    }

    if (!tags || (Array.isArray(tags) && tags.length === 0)) {
        return {
            success: false,
            message: 'Tags parameter is required'
        };
    }

    const tagStr = Array.isArray(tags) ? tags.join(',') : tags;

    // 计算 LIMIT OFFSET
    const offset = (page - 1) * pageSize;
    const tagCount = (tagStr.match(/,/g) || []).length + 1;

    try {
        const { rows: countRows } = await db.sql`
      SELECT COUNT(*) AS total FROM (
        SELECT t.tweet_id
        FROM Tweets t
        JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
        JOIN TAGS tag ON tt.tag_id = tag.tag_id
        WHERE FIND_IN_SET(tag.name, ${tagStr})
        GROUP BY t.tweet_id
        HAVING COUNT(DISTINCT tag.name) = ${tagCount}
      ) sub;
    `;

        const total = countRows?.[0]?.total || 0;
        const maxPages = Math.ceil(total / pageSize);
        // 调用支持分页的存储过程
        const { rows } = await db.sql`CALL get_tweets_by_tags_desc(${tagStr}, ${pageSize}, ${offset})`;

        const tweets = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

        const processedTweets = tweets.map(tweet => ({
            ...tweet,
            tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : []
        }));

        return {
            success: true,
            data: processedTweets,
            maxPages: maxPages
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch tweets by tags'
        };
    }
});
