[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/auth/logout](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/auth/logout.ts:17](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/auth/logout.ts#L17)

用户退出登录，清除 Cookie `auth_token`。

路由: POST/GET /api/auth/logout
权限: 登录用户（但清 Cookie 操作本身允许幂等）

返回:
- { success: true, message: string }

## Param

H3 请求事件对象

## Returns
