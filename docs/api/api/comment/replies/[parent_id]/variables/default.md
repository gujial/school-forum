[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/comment/replies/\[parent\_id\]](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/comment/replies/\[parent\_id\].ts:19](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/comment/replies/[parent_id].ts#L19)

获取某条评论下的子评论（按时间正序）。

路由: GET /api/comment/replies/:parent_id
权限: 公开

路径参数:
- parent_id: string 父评论 ID

返回:
- { success: true, data: any[] }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
