import { defineEventHandler, getRouterParam } from 'h3'
import { useDatabase } from '../../util/database'

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