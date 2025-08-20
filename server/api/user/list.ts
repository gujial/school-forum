import { defineEventHandler, getQuery } from 'h3'
import { useDatabase } from '../../util/database'

export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const query = getQuery(event)

    if (query == undefined) {
        return {
            success: false,
            message: 'Need page number'
        }
    }

    const page = query.page ? parseInt(query.page as string) : 1
    const limit = query.pageSize ? parseInt(query.pageSize as string) : 20
    const keyword = query.keyword ? (query.keyword as string).trim() : ''

    if (page <= 0) {
        return {
            success: false,
            message: 'Wrong page number'
        }
    }

    const offset = (page - 1) * limit

    try {
        const totalResult = await db.sql`SELECT COUNT(*) AS total FROM Users WHERE username LIKE ${'%' + keyword + '%'} OR email LIKE ${'%' + keyword + '%'}`
        if (!totalResult.rows) {
            throw new Error('Failed to retrieve user count')
        }
        const total = Number(totalResult.rows[0].total)
        const maxPages = Math.ceil(total / limit)

        const { rows } = await db.sql`
            SELECT 
                u.user_id, 
                u.username, 
                u.email, 
                u.created_at,
            EXISTS (
                SELECT 1 
                FROM admins a 
                WHERE a.user_id = u.user_id
                ) AS admin
            FROM Users u
            WHERE u.username LIKE ${'%' + keyword + '%'} 
                OR u.email LIKE ${'%' + keyword + '%'}
            ORDER BY u.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
            `

        if (!rows) {
            throw new Error('Query returned undefined')
        }

        return {
            success: true,
            data: rows,
            maxPages: maxPages
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to fetch Users'
        }
    }
})
