import { defineEventHandler, createError } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth'

interface DeleteBody {
  password: string
}

export default defineEventHandler(async (event) => {
  await authMiddleware(event)
  const userInfo = event.context.auth

  const db = useDatabase()
  const { rows } = await db.sql`
    SELECT password FROM Users WHERE user_id = ${userInfo.userId}
  `
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  await db.sql`delete from Users where user_id = ${userInfo.userId}`

  return { success: true, message: 'Account deleted successfully' }
})