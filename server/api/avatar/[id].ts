import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'

/**
 * 获取指定用户的头像 URL。
 *
 * 路由: GET /api/avatar/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 返回:
 * - { success: true, data: string }
 * - { success: false, message }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data?: string, message?: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const userId = getRouterParam(event, 'id');
  
    try {
        const { rows } = await db.sql`SELECT * FROM Avatar WHERE user_id = ${userId}`;
  
        if (rows === undefined) {
          throw new Error('Query returned undefined');
        }
        
        if (rows.length === 0) {
            return {
                success: false,
                message: 'User not found'
            };
        }
  
        return {
            success: true,
            data: rows[0].avatar_url
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to fetch avatar'
        };
    }
  });
  