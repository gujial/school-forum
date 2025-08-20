[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/comment/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data`: `any`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `data?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/comment/\[id\].ts:20](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/comment/[id].ts#L20)

获取单条评论详情。

路由: GET /api/comment/:id
权限: 公开

路径参数:
- id: string 评论 ID

返回:
- { success: true, data }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
