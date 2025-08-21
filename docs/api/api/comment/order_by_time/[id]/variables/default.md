[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/comment/order\_by\_time/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/comment/order\_by\_time/\[id\].ts:24](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/comment/order_by_time/[id].ts#L24)

获取某条推文下的顶级评论，按时间倒序，分页返回。

路由: GET /api/comment/order_by_time/:id
权限: 公开

路径参数:
- id: string 推文 ID

查询参数:
- page: number 必填，页号
- pageSize?: number 每页数量，默认 20

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
