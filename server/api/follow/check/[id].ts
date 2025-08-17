import { defineEventHandler, getRouterParam } from 'h3'
import authMiddleware from '../../../util/auth';
import { useDatabase } from '../../../util/database';

export default defineEventHandler(async (event) => {
    await authMiddleware(event);
    const db = useDatabase();
    const userId = getRouterParam(event, 'id');
    const userInfo = event.context.auth

    if (userId == undefined) {
        return {
          success: false,
          message: 'Need ids'
        }
      }
  
    try {
        const {rows} = await db.sql`SELECT * FROM Follows WHERE follower_id = ${userInfo.userId} AND following_id = ${userId}`;

        if (rows === undefined) {
            throw new Error('Query returned undefined');
          }

        if (rows.length > 0) {
            return {
                success: true,
                follow: true
            };
        } else {
            return {
                success: true,
                follow: false
            };
        }
    } catch (error) {
        console.error('Database error:', error);
        return {
            success: false,
            message: 'Failed to follow'
        };
    }
  });
  