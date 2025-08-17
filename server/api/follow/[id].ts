import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth';

export default defineEventHandler(async (event) => {
    await authMiddleware(event)
    const userInfo = event.context.auth
    const db = useDatabase()
    const followingId = getRouterParam(event, 'id');

    try {
        db.sql`insert into Follows(follower_id, following_id) values (${userInfo.user_id}, ${followingId})`;
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to follow user'
        }
    }
})