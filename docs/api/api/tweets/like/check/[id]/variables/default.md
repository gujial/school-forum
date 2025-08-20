[**nuxt-app**](../../../../../../README.md)

***

[nuxt-app](../../../../../../README.md) / [api/tweets/like/check/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `like?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `like`: `boolean`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/like/check/\[id\].ts:21](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/tweets/like/check/[id].ts#L21)

检查当前用户是否点赞了指定推文。

路由: GET /api/tweets/like/check/:id
权限: 登录用户

路径参数:
- id: string 推文 ID

返回:
- { success: true, like: boolean }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
