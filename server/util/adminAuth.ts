// middleware/auth.ts

import { defineEventHandler } from 'h3';
import { useDatabase } from './database';
import authMiddleware from './auth';

/**
 * 管理员鉴权中间件：在基础登录校验后，检查当前用户是否存在于 `Admins` 表。
 * 不通过将抛出 401 错误。
 *
 * 路由使用方式：在仅限管理员的接口中先 `await adminAuthMiddleware(event)`。
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<void>} 通过校验则继续执行
 * @throws {import('h3').H3Error} 非管理员时抛出 401
 */
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
