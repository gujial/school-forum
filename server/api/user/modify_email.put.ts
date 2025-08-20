import { useDatabase } from '../../util/database';
import authMiddleware from '../../util/auth';

/**
 * 修改当前用户的邮箱。
 *
 * 路由: PUT /api/user/modify_email
 * 权限: 登录用户
 *
 * 请求体:
 * - newEmail: string 必填，新邮箱
 *
 * 返回:
 * - { success: true, message, newEmail }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string, newEmail?: string}>}
 */
export default defineEventHandler(async (event) => {
    await authMiddleware(event);

    const body = await readBody<{ newEmail?: string }>(event);
    const newEmail = body?.newEmail?.trim();
    const userInfo = event.context.auth;

    if (!newEmail) {
        throw createError({ statusCode: 400, statusMessage: '新邮箱不能为空' });
    }

    const db = useDatabase();
    try {
        // 检查是否已经被占用
        const { rows: existRows } = await db.sql`
      SELECT user_id FROM Users WHERE email = ${newEmail}
    `;
        if (existRows.length > 0) {
            return { success: false, message: '该邮箱已被使用' };
        }

        // 更新邮箱
        await db.sql`
      UPDATE Users 
      SET email = ${newEmail} 
      WHERE user_id = ${userInfo.userId}
    `;

        return { success: true, message: '邮箱修改成功', newEmail };
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return { success: false, message };
    }
});
