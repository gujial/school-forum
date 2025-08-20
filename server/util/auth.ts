// middleware/auth.ts

import { defineEventHandler, createError, getCookie } from 'h3';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'twitterClone';

/**
 * 认证中间件：从 Cookie 中读取 `auth_token`，校验 JWT，
 * 并在 `event.context.auth` 上注入 `{ userId, username }`。
 *
 * 路由使用方式：在需要登录的接口中先 `await authMiddleware(event)`。
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<void>} 验证通过则继续，失败抛出 401 错误
 * @throws {import('h3').H3Error} 未登录或 Token 无效时抛出 401
 */
export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token');

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Not authenticated',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
        event.context.auth = {
            userId: decoded.userId,
            username: decoded.username,
        };
    } catch (error) {
        throw createError({
            statusCode: 401,
            statusMessage: String(error),
        });
    }
});
