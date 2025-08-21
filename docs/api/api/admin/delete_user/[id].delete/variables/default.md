[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/admin/delete\_user/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/admin/delete\_user/\[id\].delete.ts:21](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/admin/delete_user/[id].delete.ts#L21)

管理员删除指定用户。

路由: DELETE /api/admin/delete_user/:id
权限: 管理员

路径参数:
- id: string 被删除用户的 user_id

返回:
- { success: true, message: string }
- { success: false, message: string }

## Param

H3 请求事件对象

## Returns
