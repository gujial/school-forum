import { defineEventHandler, readBody } from 'h3'
import authMiddleware from '../../util/auth';
import { useDatabase } from '../../util/database';
import { auditAndReport } from "../../util/contentModeration";

export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const body = await readBody(event)

    if (!body['tweet_id'] || !body['content']) {
        return {
            success: false,
            message: 'Invalid input parameters'
        }
    }

    try {
        await db.sql`INSERT INTO Comments (tweet_id, user_id, content) VALUES (${body['tweet_id']}, ${userInfo.userId}, ${body['content']})`
        const { rows } = await db.sql`SELECT LAST_INSERT_ID() as comment_id`;
        if (rows == undefined) {
            throw createError({
                statusCode: 401,
                message: 'Create comment failed'
            })
        }

        const commentId = rows[0].comment_id

        auditAndReport(body['content'], body['tweet_id'], commentId)

        return {
            success: true,
            message: 'Comment created successfully'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to create Comment'
        }
    }
})