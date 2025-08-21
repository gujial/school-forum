[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/comment/reply.post](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/comment/reply.post.ts:23](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/comment/reply.post.ts#L23)

回复评论（子评论）。

路由: POST /api/comment/reply
权限: 登录用户

请求体:
- tweet_id: number 所属推文 ID
- parent_id: number 父评论 ID
- content: string 回复内容

返回:
- { success: true }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
