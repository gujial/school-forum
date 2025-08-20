import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

export default defineEventHandler(async (event) => {
    await adminAuthMiddleware(event);
    const userInfo = event.context.auth
    const db = useDatabase()

    try {
        await db.sql`DELETE FROM Reports`;

        return {
            success: true,
            message: '举报已全部删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch report'
        }
    }
})