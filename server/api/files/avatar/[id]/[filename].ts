import { sendStream } from 'h3'
import { join } from 'path'
import { existsSync, createReadStream } from 'fs'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const filename = getRouterParam(event, 'filename')

  if (userId === undefined || filename === undefined) {
    return { statusCode: 400, message: 'Missing user id or filename' }
  }

  const filePath = join(process.cwd(), 'dynamic', 'avatars', userId, filename)

  if (!existsSync(filePath)) {
    return { statusCode: 404, message: 'File not found' }
  }

  return sendStream(event, createReadStream(filePath))
})