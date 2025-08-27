[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/media/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data`: `any`[]; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `data?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/media/\[id\].ts:20](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/media/[id].ts#L20)

获取某条推文下的媒体列表（不包含 `media_type = all` 的通用项）。

路由: GET /api/media/:id
权限: 公开

路径参数:
- id: string 推文 ID

返回:
- { success: true, data: any[] }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
