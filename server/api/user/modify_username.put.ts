import { defineEventHandler, readBody, createError } from 'h3';
import { useDatabase } from '../../util/database';
import authMiddleware from '../../util/auth';

interface UsernameBody {
    username: string;
}

/**
 * 修改当前用户的用户名。
 *
 * 路由: PUT /api/user/modify_username
 * 权限: 登录用户
 *
 * 请求体:
 * - newUsername: string 必填，新的用户名
 *
 * 返回:
 * - { success: true, message, newUsername }
 * - 失败时抛出 400 等错误
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string, newUsername?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const body = await readBody<UsernameBody>(event);
    const { username } = body;
    const userInfo = event.context.auth;

    if (!username) {
        throw createError({ statusCode: 400, statusMessage: 'New username is required' });
    }

    const db = useDatabase();
    // 检查是否已存在
    const { rows: exist } = await db.sql`
    SELECT user_id FROM Users WHERE username = ${username}
  `;
    if (exist.length > 0) {
        throw createError({ statusCode: 400, statusMessage: 'Username already taken' });
    }

    await db.sql`
    UPDATE Users SET username = ${username} WHERE user_id = ${userInfo.userId}
  `;

    return { success: true, message: 'Username updated successfully', username };
});
