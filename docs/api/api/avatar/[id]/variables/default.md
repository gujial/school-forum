[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/avatar/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/avatar/\[id\].ts:20](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/avatar/[id].ts#L20)

获取指定用户的头像 URL。

路由: GET /api/avatar/:id
权限: 公开

路径参数:
- id: string 用户 ID

返回:
- { success: true, data: string }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
