[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/delete\_account.delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/user/delete\_account.delete.ts:18](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/user/delete_account.delete.ts#L18)

删除当前登录账户。

路由: DELETE /api/user/delete_account
权限: 登录用户

返回:
- { success: true, message }
- 失败时抛出 404 或其他错误

## Param

H3 请求事件对象

## Returns
