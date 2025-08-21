[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/auth/login](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; `token`: `string`; \}\>\>

Defined in: [api/auth/login.ts:40](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/auth/login.ts#L40)

用户登录，验证邮箱与密码，签发 JWT 并设置到 Cookie `auth_token`。

路由: POST /api/auth/login
权限: 公开

请求体:
- email: string 必填
- password: string 必填

返回:
- { success: true, message: string, token: string }
- 失败时抛出 400 错误或返回错误信息

## Param

H3 请求事件对象

## Returns
