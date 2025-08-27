[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/\[id\].put](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/tweets/\[id\].put.ts:24](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/tweets/[id].put.ts#L24)

修改指定推文内容。

路由: PUT /api/tweets/:id
权限: 登录用户（必须为推文作者或管理员）

路径参数:
- id: string 推文 ID

请求体:
- content: string 新内容

返回:
- { success: true }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
