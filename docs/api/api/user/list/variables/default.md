[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/list](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/user/list.ts:22](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/user/list.ts#L22)

获取用户列表（支持分页与关键词模糊查询）。

路由: GET /api/user/list
权限: 无（公开）

查询参数:
- page: number 当前页，默认 1
- pageSize: number 每页数量，默认 20
- keyword: string 关键词，匹配 username 或 email

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message: string }

## Param

H3 请求事件对象

## Returns
