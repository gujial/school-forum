[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/tweets/order\_by\_time/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/order\_by\_time/\[id\].ts:20](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/tweets/order_by_time/[id].ts#L20)

按时间倒序分页获取推文列表。

路由: GET /api/tweets/order_by_time/:id
权限: 公开

路径参数:
- id: string 页号（page）

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message }

## Param

## Returns
