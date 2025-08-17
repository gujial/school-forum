import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const followingId = getRouterParam(event, 'id');

    try {
        db.sql`delete from Follows where follower_id = ${userInfo.user_id} and following_id = ${followingId}`;
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to follow user'
        }
    }
})