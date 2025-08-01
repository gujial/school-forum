import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const tweetId = getRouterParam(event, 'tweetId')
  const filename = getRouterParam(event, 'filename')
  
  if (!tweetId || !filename) {
    throw createError({
      statusCode: 400,
      message: '推文ID或文件名不能为空'
    })
  }

  try {
    const filePath = join(process.cwd(), 'dynamic', 'media', tweetId, filename)
    
    if (!existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        message: '文件不存在'
      })
    }

    // 读取文件
    const fileBuffer = readFileSync(filePath)
    
    // 根据文件扩展名设置Content-Type
    const ext = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg'
    } else if (ext === 'png') {
      contentType = 'image/png'
    } else if (ext === 'gif') {
      contentType = 'image/gif'
    } else if (ext === 'webp') {
      contentType = 'image/webp'
    } else if (ext === 'mp4') {
      contentType = 'video/mp4'
    } else if (ext === 'avi') {
      contentType = 'video/x-msvideo'
    } else if (ext === 'mov') {
      contentType = 'video/quicktime'
    } else if (ext === 'webm') {
      contentType = 'video/webm'
    }
    
    // 设置响应头
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Length', fileBuffer.length.toString())
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 缓存1年
    
    return fileBuffer
  } catch (error) {
    console.error('媒体文件读取错误:', error)
    throw createError({
      statusCode: 500,
      message: '服务器内部错误'
    })
  }
}) 