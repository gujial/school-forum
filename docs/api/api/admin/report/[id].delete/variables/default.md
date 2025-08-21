[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/admin/report/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/admin/report/\[id\].delete.ts:21](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/admin/report/[id].delete.ts#L21)

管理端删除单条举报记录。

路由: DELETE /api/admin/report/:id
权限: 管理员

路径参数:
- id: string 举报 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
