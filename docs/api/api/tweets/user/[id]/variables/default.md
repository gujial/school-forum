[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/tweets/user/\[id\]](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/tweets/user/\[id\].ts:23](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/tweets/user/[id].ts#L23)

获取指定用户的推文列表（带标签），按时间倒序，分页返回。

路由: GET /api/tweets/user/:id
权限: 公开

路径参数:
- id: string 用户 ID

查询参数:
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 9

返回:
- { success: true, data: any[], total: number }
- { success: false, message: string }

## Param

H3 请求事件对象

## Returns
