import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const followingId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from Follows where follower_id = ${userInfo.userId} and following_id = ${followingId}`;

        return {
            success: true,
            follow: false
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to follow user'
        }
    }
})