// server/api/auth/logout.ts

import { defineEventHandler, setCookie } from 'h3'

/**
 * 用户退出登录，清除 Cookie `auth_token`。
 *
 * 路由: POST/GET /api/auth/logout
 * 权限: 登录用户（但清 Cookie 操作本身允许幂等）
 *
 * 返回:
 * - { success: true, message: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    secure: false,
    maxAge: -1
  })

  return {
    success: true,
    message: 'Logout successful'
  }
})
