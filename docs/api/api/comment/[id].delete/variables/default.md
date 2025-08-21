[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/comment/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/comment/\[id\].delete.ts:22](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/comment/[id].delete.ts#L22)

删除评论（包含其子评论）。

路由: DELETE /api/comment/:id
权限: 登录用户（作者），或管理员

路径参数:
- id: string 评论 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
