[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/delete\_account.delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/user/delete\_account.delete.ts:18](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/user/delete_account.delete.ts#L18)

删除当前登录账户。

路由: DELETE /api/user/delete_account
权限: 登录用户

返回:
- { success: true, message }
- 失败时抛出 404 或其他错误

## Param

H3 请求事件对象

## Returns
