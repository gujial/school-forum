// middleware/auth.ts

import { defineEventHandler } from 'h3';
import { useDatabase } from './database';
import authMiddleware from './auth';

export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const userInfo = event.context.auth;
    const db = useDatabase();

    try {
        const { rows } = await db.sql`select * from Admins where user_id = ${userInfo.userId}`;

        if (rows.length < 1) {
            throw createError({
                statusCode: 401,
                statusMessage: '没有操作权限',
            });
        }
    } catch (err) {
        throw err;
    }
});
