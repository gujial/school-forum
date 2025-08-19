import { defineEventHandler, readBody, createError } from 'h3'
import { useDatabase } from '../../util/database'
import authMiddleware from '../../util/auth'

interface UsernameBody {
  newUsername: string
}

export default defineEventHandler(async (event) => {
  await authMiddleware(event)
  const body = await readBody<UsernameBody>(event)
  const { newUsername } = body
  const userInfo = event.context.auth

  if (!newUsername) {
    throw createError({ statusCode: 400, statusMessage: 'New username is required' })
  }

  const db = useDatabase()
  // 检查是否已存在
  const { rows: exist } = await db.sql`
    SELECT user_id FROM Users WHERE username = ${newUsername}
  `
  if (exist.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Username already taken' })
  }

  await db.sql`
    UPDATE Users SET username = ${newUsername} WHERE user_id = ${userInfo.userId}
  `

  return { success: true, message: 'Username updated successfully', newUsername }
})