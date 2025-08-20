import { defineEventHandler, readBody, createError } from 'h3';
import bcrypt from 'bcryptjs';
import { useDatabase } from '../../util/database';
import authMiddleware from '../../util/auth';

interface PasswordBody {
    oldPassword: string;
    newPassword: string;
}

/**
 * 修改当前用户的密码。
 *
 * 路由: PUT /api/user/modify_password
 * 权限: 登录用户
 *
 * 请求体:
 * - oldPassword: string 必填，旧密码
 * - newPassword: string 必填，新密码
 *
 * 返回:
 * - { success: true, message }
 * - 失败时抛出 400/401/404 等错误
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event); // 获取当前用户信息
    const body = await readBody<PasswordBody>(event);
    const { oldPassword, newPassword } = body;
    const userInfo = event.context.auth;

    if (!oldPassword || !newPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Both old and new passwords are required',
        });
    }

    const db = useDatabase();
    const { rows } = await db.sql`
    SELECT password FROM Users WHERE user_id = ${userInfo.userId}
  `;

    if (rows.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) {
        throw createError({ statusCode: 401, statusMessage: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.sql`
    UPDATE Users SET password = ${hashedPassword} WHERE user_id = ${userInfo.userId}
  `;

    return { success: true, message: 'Password updated successfully' };
});
