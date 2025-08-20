[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/message/send.post](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/message/send.post.ts:24](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/message/send.post.ts#L24)

发送私信，可关联推文或评论。

路由: POST /api/message/send
权限: 登录用户

请求体:
- receiver_id: number 接收者用户 ID
- tweet_id?: number 可选，关联推文 ID
- comment_id?: number 可选，关联评论 ID
- content: string 必填，消息内容

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
