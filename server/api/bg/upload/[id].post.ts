import { IncomingForm } from 'formidable'
import { mkdirSync, copyFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { useDatabase } from '../../../util/database'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const form = new IncomingForm({ multiples: false })

  if (!userId) {
    throw createError({ statusCode: 400, message: 'Missing user id' })
  }

  const uploadDir = join(process.cwd(), 'dynamic', 'bg', userId)
  mkdirSync(uploadDir, { recursive: true })

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) return reject(err)
      if (!files.file) {
        return reject(createError({ statusCode: 400, message: 'No file uploaded' }))
      }
      const db = useDatabase()
      const file = Array.isArray(files.file) ? files.file[0] : files.file
      const originalFilename = file.originalFilename ?? ''
      const ext = originalFilename ? originalFilename.slice(originalFilename.lastIndexOf('.')) : ''
      const unique = Date.now()
      const newFilename = `${userId}_${unique}${ext}`
      const filePath = join(uploadDir, newFilename)

      // 删除旧背景
      const { rows } = await db.sql`SELECT bg_url FROM Users WHERE user_id = ${userId}`
      if (rows && rows[0] && rows[0].bg_url) {
        const oldUrl = rows[0].bg_url
        const parts = oldUrl.split('/')
        const oldFilename = parts[parts.length - 1]
        const oldFilePath = join(uploadDir, oldFilename)
        if (existsSync(oldFilePath)) {
          try { unlinkSync(oldFilePath) } catch (e) {}
        }
      }

      try {
        copyFileSync(file.filepath, filePath)
        unlinkSync(file.filepath)
      } catch (e) {
        return reject(e)
      }

      const bgUrl = `/api/files/bg/${userId}/${newFilename}`
      await db.sql`UPDATE Users SET bg_url = ${bgUrl} WHERE user_id = ${userId}`

      resolve({ success: true, data: bgUrl })
    })
  })
})