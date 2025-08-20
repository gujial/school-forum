import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../../util/database'
import adminAuthMiddleware from '../../../util/adminAuth'

export default defineEventHandler(async (event) => {
    await adminAuthMiddleware(event);
    const db = useDatabase()
    const reportId = getRouterParam(event, 'id');

    try {
        await db.sql`delete from reports where report_id = ${reportId}`

        return {
            success: true,
            message: '举报已删除'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to delete report'
        }
    }
})