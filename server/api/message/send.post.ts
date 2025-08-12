import { defineEventHandler, readBody } from 'h3'
import authMiddleware from '../../util/auth';
import { useDatabase } from '../../util/database';

export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const body = await readBody(event)

    if (!body['content']) {
        return {
            success: false,
            message: 'Invalid input content'
        }
    }

    try {
        await db.sql`INSERT INTO Messages (sender_id, receiver_id, tweet_id, comment_id, content) VALUES (${userInfo.userId}, ${body['receiver_id']}, ${body['tweet_id']?body['tweet_id']:null}, ${body['comment_id']?body['comment_id']:null}, ${body['content']})`

        return {
            success: true,
            message: 'Message created successfully'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to create Message'
        }
    }
})