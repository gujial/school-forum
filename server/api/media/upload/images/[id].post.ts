import { IncomingForm } from 'formidable'
import { mkdirSync, copyFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { useDatabase } from '../../../../util/database'

/**
 * 批量上传图片到指定推文目录，并记录到 `Media` 表。
 *
 * 路由: POST /api/media/upload/images/:id
 * 权限: 公开（建议结合业务策略限制）
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 请求: multipart/form-data，字段名 `file`（可多选）
 *
 * 返回:
 * - { statusCode: 200, body: { tweetId, filePath: string[] } }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{statusCode: number, body: string}>}
 */
export default defineEventHandler(async (event) => {
  const tweetId = getRouterParam(event, 'id')
  const form = new IncomingForm({ multiples: true }) // Allow multiple files

  if (tweetId == undefined) {
    throw createError({
      statusCode: 401,
      message: 'Need tweet id'
    })
  }

  const uploadDir = join(process.cwd(), 'dynamic', 'media', tweetId)
  mkdirSync(uploadDir, { recursive: true })

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.file || !files.file.length) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid file'
        })
      }

      const db = useDatabase()
      const fileArray = Array.isArray(files.file) ? files.file : [files.file]
      const data = []

      for (const f of fileArray) {
        if (f.originalFilename == null) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Invalid filename'
          })
        }

        const filePath = join(uploadDir, f.originalFilename)
        // Copy file instead of renaming it, then delete the original
        try {
          copyFileSync(f.filepath, filePath)
          unlinkSync(f.filepath) // Delete the temporary file after copying
        } catch (copyError) {
          return reject(copyError)
        }

        await db.sql`INSERT INTO Media (tweet_id, media_url, media_type) VALUES (${tweetId}, ${`/api/files/media/${tweetId}/${f.originalFilename}`}, ${'image'})`
        data.push(`/api/files/media/${tweetId}/${f.originalFilename}`)
      }

      resolve({
        statusCode: 200,
        body: JSON.stringify({
          tweetId,
          filePath: data
        })
      })
    })
  })
})
