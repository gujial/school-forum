[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/admin/report/list](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/admin/report/list.ts:22](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/admin/report/list.ts#L22)

管理端分页获取举报列表。

路由: GET /api/admin/report/list
权限: 管理员

查询参数:
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 20

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
