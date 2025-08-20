import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

export default defineEventHandler(async (event) => {
    adminAuthMiddleware(event);
    const db = useDatabase()
    const userId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from Admins where user_id = ${userId}`

        return {
            success: true,
            message: '管理员已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to delete admin'
        }
    }
})