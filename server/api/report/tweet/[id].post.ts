import { defineEventHandler, readBody, createError } from 'h3'
import authMiddleware from '../../../util/auth';
import { useDatabase } from '../../../util/database';

export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const db = useDatabase()
    const body = await readBody(event)
    const userInfo = event.context.auth
    const tweetId = getRouterParam(event, 'id')

    if (!body['content']) {
        return {
            success: false,
            message: '内容不能为空'
        }
    }

    const newReport = {
        user_id: userInfo.userId,
        content: body['content'],
        tweet_id: tweetId
    }

    try {
        await db.sql`INSERT INTO Reports(user_id, content, tweet_id) values (${newReport.user_id}, ${newReport.content}, ${newReport.tweet_id})`;

        return {
            success: true,
            message: 'Report created successfully'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to create tweet'
        }
    }
})
