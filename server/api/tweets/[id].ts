import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'

export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const tweetId = getRouterParam(event, 'id');

    try {
        const { rows } = await db.sql`SELECT t.*, GROUP_CONCAT(tag_all.name ORDER BY tag_all.name SEPARATOR ',') AS tags
       FROM Tweets t LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
       LEFT JOIN TAGS tag_all ON tt.tag_id = tag_all.tag_id WHERE t.tweet_id = ${tweetId}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Tweet not found'
            };
        }

        const tweet = rows[0];
        console.log(rows)

        const processedTweet = {
            ...tweet,
            tags: typeof tweet.tags === 'string' ? tweet.tags.split(',') : []
        };

        return {
            success: true,
            data: processedTweet
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch tweet'
        };
    }
});
