import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

export default defineEventHandler(async (event) => {
    adminAuthMiddleware(event);
    const db = useDatabase()
    const userId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from Users where user_id = ${userId}`

        return {
            success: true,
            message: '用户已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to delete user'
        }
    }
})