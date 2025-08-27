[**nuxt-app**](../../../../../../README.md)

***

[nuxt-app](../../../../../../README.md) / [api/tweets/share/count/\[id\]](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/tweets/share/count/\[id\].ts:19](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/tweets/share/count/[id].ts#L19)

获取某条推文被转发/分享的数量（统计 parent_id 指向该推文的条数）。

路由: GET /api/tweets/share/count/:id
权限: 公开

路径参数:
- id: string 推文 ID

返回:
- { success: true, count: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
