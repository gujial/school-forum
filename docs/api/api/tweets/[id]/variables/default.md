[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/\[id\].ts:20](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/tweets/[id].ts#L20)

获取单条推文详情，包含标签集合。

路由: GET /api/tweets/:id
权限: 公开

路径参数:
- id: string 推文 ID

返回:
- { success: true, data: { ...tweet, tags: string[] } }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
