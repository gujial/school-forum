[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/bg/upload/\[id\].post](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/bg/upload/\[id\].post.ts:23](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/bg/upload/[id].post.ts#L23)

上传并替换指定用户的背景图，删除旧背景文件并更新 `Users.bg_url`。

路由: POST /api/bg/upload/:id
权限: 登录用户（通常应与自身 ID 匹配，具体由业务层校验）

路径参数:
- id: string 用户 ID

请求: multipart/form-data，字段名 `file`

返回:
- { success: true, data: string } 背景图 URL

## Param

H3 请求事件对象

## Returns
