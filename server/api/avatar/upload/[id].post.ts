import { IncomingForm } from 'formidable'
import { mkdirSync, copyFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { useDatabase } from '../../../util/database'

export default defineEventHandler(async (event) => {
  const form = new IncomingForm({ multiples: false })
  const userId = getRouterParam(event, 'id')

  if (userId == undefined) {
    throw createError({
      statusCode: 401,
      message: 'Need user id'
    })
  }

  const uploadDir = join(process.cwd(), 'dynamic', 'avatars', userId)
  mkdirSync(uploadDir, { recursive: true })

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (files.file == undefined) {
        return reject(createError({
          statusCode: 401,
          statusMessage: 'Invalid file'
        }))
      }

      const db = useDatabase()
      const file = files.file[0]

      if (file.originalFilename == null) {
        return reject(createError({
          statusCode: 401,
          statusMessage: 'Invalid filename'
        }))
      }

      // 查询旧头像路径并删除
      const { rows } = await db.sql`SELECT avatar_url FROM Avatar WHERE user_id = ${userId}`
      if (rows && rows[0] && rows[0].avatar_url) {
        const oldUrl = rows[0].avatar_url
        // 解析出旧文件名
        const parts = oldUrl.split('/')
        const oldFilename = parts[parts.length - 1]
        const oldFilePath = join(uploadDir, oldFilename)
        if (existsSync(oldFilePath)) {
          try {
            unlinkSync(oldFilePath)
          } catch (e) {
            // 可以选择忽略删除失败
            console.error('删除旧头像失败:', e)
          }
        }
      } else {
        await db.sql`INSERT INTO Avatar (avatar_url, user_id) VALUES (${''}, ${userId})`
      }

      const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf('.'))
      const unique = Date.now() // 或用 uuid
      const newFilename = `${userId}_${unique}${ext}`
      const filePath = join(uploadDir, newFilename)

      try {
        copyFileSync(file.filepath, filePath)
        unlinkSync(file.filepath) // Delete the temporary file after copying
      } catch (copyError) {
        return reject(copyError)
      }

      await db.sql`UPDATE Avatar SET avatar_url = ${`/api/files/avatar/${userId}/${newFilename}`} WHERE user_id = ${userId}`

      resolve({
        statusCode: 200,
        data: {
          userId,
          filePath: `/api/files/avatar/${userId}/${newFilename}`
        }
      })
    })
  })
})
