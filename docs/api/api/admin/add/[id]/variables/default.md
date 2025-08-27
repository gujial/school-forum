[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/admin/add/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/admin/add/\[id\].ts:21](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/admin/add/[id].ts#L21)

添加管理员权限给指定用户。

路由: POST /api/admin/add/:id
权限: 管理员

路径参数:
- id: string 目标用户 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
