import { defineEventHandler, readBody, createError } from 'h3'
import authMiddleware from '../../util/auth';
import { useDatabase } from '../../util/database';

export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const body = await readBody(event)
    await authMiddleware(event);
    const userInfo = event.context.auth

    // 验证输入参数
    if (!body['content']) {
        return {
            success: false,
            message: 'Invalid input parameters'
        }
    }

    const newTweet = {
        user_id: userInfo.userId,
        content: body['content'],
        parent_id: body['parent_id'] || null
    }

    try {
        await db.sql`INSERT INTO Tweets (user_id, parent_id, content) VALUES (${newTweet.user_id}, ${newTweet.parent_id}, ${newTweet.content})`;
        const { rows } = await db.sql`SELECT * FROM Tweets WHERE user_id = ${newTweet.user_id} ORDER BY created_at DESC LIMIT 1`;
        if (rows == undefined) {
            throw createError({
                statusCode: 401,
                message: 'Create tweet failed'
            })
        }
        const tweetId = rows[0].tweet_id;

        for (const file of body['attachments'] || []) {
            await db.sql`UPDATE Media SET tweet_id = ${rows[0].tweet_id} WHERE tweet_id IS NULL AND media_type = ${'all'} AND media_url = ${file}`
        }

        if (body['tags'] && body['tags'].length > 0) {
            const tagStr = Array.isArray(body['tags']) ? body['tags'].join(',') : body['tags'];
            await db.sql`CALL add_tweet_tags(${tweetId}, ${tagStr})`;
        }

        return {
            success: true,
            tweet_id: rows[0].tweet_id,
            message: 'Tweet created successfully'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to create tweet'
        }
    }
})
