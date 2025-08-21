[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/admin/delete/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/admin/delete/\[id\].delete.ts:21](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/admin/delete/[id].delete.ts#L21)

移除指定用户的管理员权限。

路由: DELETE /api/admin/delete/:id
权限: 管理员

路径参数:
- id: string 目标用户 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
