[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/report/tweet/\[id\].post](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/report/tweet/\[id\].post.ts:24](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/report/tweet/[id].post.ts#L24)

举报推文。

路由: POST /api/report/tweet/:id
权限: 登录用户

路径参数:
- id: string 推文 ID

请求体:
- content: string 举报理由

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
