import { IncomingForm } from 'formidable'
import { mkdirSync, copyFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { useDatabase } from '../../util/database'
import * as crypto from 'crypto'

/**
 * 上传媒体文件（未关联推文，得到通用 URL）。
 *
 * 路由: POST /api/media/upload
 * 权限: 公开（建议结合业务策略限制）
 *
 * 请求: multipart/form-data，字段名 `file`
 *
 * 返回:
 * - { statusCode: 200, filePath: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{statusCode: number, filePath: string}>}
 */
export default defineEventHandler(async (event) => {
  const form = new IncomingForm({ multiples: false })

  const uploadDir = join(process.cwd(), 'dynamic', 'media')
  mkdirSync(uploadDir, { recursive: true })

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (files.file == undefined) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid file'
        })
      }

      const db = useDatabase()
      const file = files.file[0]

      if (file.originalFilename == null) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid filename'
        })
      }

      const uuid = crypto.randomUUID();
      const filePath = join(uploadDir, `${uuid}.${file.originalFilename.split('.').pop()}`)
      try {
        copyFileSync(file.filepath, filePath)
        unlinkSync(file.filepath) // Delete the temporary file after copying
      } catch (copyError) {
        return reject(copyError)
      }

      await db.sql`INSERT INTO Media (media_url, media_type) VALUES (${`/api/files/media/${uuid}.${file.originalFilename.split('.').pop()}`}, ${'all'})`

      resolve({
        statusCode: 200,
        filePath: `/api/files/media/${uuid}.${file.originalFilename.split('.').pop()}`
      })
    })
  })
})
