import { IncomingForm } from 'formidable'
import { mkdirSync, copyFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { useDatabase } from '../../../util/database'

/**
 * 上传并替换指定用户的背景图，删除旧背景文件并更新 `Users.bg_url`。
 *
 * 路由: POST /api/bg/upload/:id
 * 权限: 登录用户（通常应与自身 ID 匹配，具体由业务层校验）
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 请求: multipart/form-data，字段名 `file`
 *
 * 返回:
 * - { success: true, data: string } 背景图 URL
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, data: string}>}
 */
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