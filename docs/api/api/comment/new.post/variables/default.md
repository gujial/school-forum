[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/comment/new.post](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/comment/new.post.ts:23](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/comment/new.post.ts#L23)

新增评论（针对推文）。

路由: POST /api/comment/new
权限: 登录用户

请求体:
- tweet_id: number 目标推文 ID
- content: string 评论内容

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
