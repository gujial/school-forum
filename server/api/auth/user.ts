// server/api/auth/user.ts

import { defineEventHandler } from 'h3';
import authMiddleware from '../../util/auth';
import { useDatabase } from '../../util/database';

/**
 * 获取当前登录用户信息与是否为管理员标记。
 *
 * 路由: GET /api/auth/user
 * 权限: 登录用户
 *
 * 返回:
 * - { success: true, user: { user_id, username, email, created_at, admin } }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, user?: any, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);

    const userInfo = event.context.auth;
    const db = useDatabase();
    try {
        const { rows } = await db.sql`SELECT * FROM Users WHERE user_id = ${userInfo.userId}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
        }

        if (rows.length === 0) {
            return {
                success: false,
                message: '数据库中没有用户，请注册',
            };
        }

        const admin = await db.sql`select * from Admins where user_id = ${userInfo.userId}`;

        return {
            success: true,
            user: {
                user_id: rows[0].user_id,
                username: rows[0].username,
                email: rows[0].email,
                created_at: rows[0].created_at,
                admin: admin.rows.length > 0,
            },
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch user',
        };
    }
});
