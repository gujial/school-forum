[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/report/comment/\[id\].post](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/report/comment/\[id\].post.ts:25](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/report/comment/[id].post.ts#L25)

举报评论。

路由: POST /api/report/comment/:id
权限: 登录用户

路径参数:
- id: string 评论 ID

请求体:
- content: string 举报理由
- tweet_id: number 所属推文 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
