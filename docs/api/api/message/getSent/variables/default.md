[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/message/getSent](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/message/getSent.ts:22](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/message/getSent.ts#L22)

获取当前用户发出的私信，按时间倒序分页。

路由: GET /api/message/getSent
权限: 登录用户

查询参数:
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 20

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
