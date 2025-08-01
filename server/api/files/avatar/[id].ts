import { readFileSync, existsSync, readdir } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  
  if (!userId) {
    throw createError({
      statusCode: 400,
      message: '用户ID不能为空'
    })
  }

  try {
    // 查找用户头像文件
    const avatarDir = join(process.cwd(), 'dynamic', 'avatars', userId)
    const files = await readdir(avatarDir)
    
    if (files.length === 0) {
      throw createError({
        statusCode: 404,
        message: '头像文件不存在'
      })
    }

    // 获取第一个文件（通常只有一个头像文件）
    const avatarFile = files[0]
    const filePath = join(avatarDir, avatarFile)
    
    if (!existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        message: '头像文件不存在'
      })
    }

    // 读取文件
    const fileBuffer = readFileSync(filePath)
    
    // 设置响应头
    setHeader(event, 'Content-Type', 'image/jpeg')
    setHeader(event, 'Content-Length', fileBuffer.length.toString())
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 缓存1年
    
    return fileBuffer
  } catch (error) {
    console.error('头像文件读取错误:', error)
    throw createError({
      statusCode: 500,
      message: '服务器内部错误'
    })
  }
}) 