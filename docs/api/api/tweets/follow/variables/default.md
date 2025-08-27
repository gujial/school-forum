[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/follow](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/follow.ts:22](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/tweets/follow.ts#L22)

按关注分页获取推文列表。

路由: GET /api/tweets/order_by_time/:id
权限: 公开

参数来源:
- GET 查询参数: tags, page?, pageSize?
- POST JSON 体: tags, page?, pageSize?

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message }

## Param

## Returns
