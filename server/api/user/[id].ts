import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'

/**
 * 获取指定用户的公开信息与是否为管理员标记。
 *
 * 路由: GET /api/user/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 返回:
 * - { success: true, user: { user_id, username, email, created_at, admin } }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, user?: any, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const userId = getRouterParam(event, 'id');

    try {
        const { rows } = await db.sql`SELECT * FROM Users WHERE user_id = ${userId}`;
  
        if (rows === undefined) {
          throw new Error('Query returned undefined');
        }
        
        if (rows.length === 0) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        const admin = await db.sql`select * from Admins where user_id = ${userId}`
  
        return {
            success: true,
            user: {
              user_id: rows[0].user_id,
              username: rows[0].username,
              email: rows[0].email,
              created_at: rows[0].created_at,
              admin: admin.rows.length > 0
            }
          };;
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch user'
        };
    }
})