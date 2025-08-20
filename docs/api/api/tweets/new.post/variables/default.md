[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/new.post](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; `tweet_id?`: `undefined`; \} \| \{ `message`: `string`; `success`: `boolean`; `tweet_id`: `any`; \}\>\>

Defined in: [api/tweets/new.post.ts:25](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/tweets/new.post.ts#L25)

创建推文（可附带标签与媒体）。

路由: POST /api/tweets/new
权限: 登录用户

请求体:
- content: string 必填，推文内容
- parent_id?: number 可选，引用的父推文 ID（转发/评论）
- attachments?: string[] 可选，已上传媒体的 URL 列表
- tags?: string[] | string 可选，标签集合

返回:
- { success: true, tweet_id: number, message: string }
- { success: false, message: string }

## Param

H3 请求事件对象

## Returns
