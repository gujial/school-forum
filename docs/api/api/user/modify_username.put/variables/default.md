[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/modify\_username.put](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; `username`: `string`; \}\>\>

Defined in: [api/user/modify\_username.put.ts:25](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/user/modify_username.put.ts#L25)

修改当前用户的用户名。

路由: PUT /api/user/modify_username
权限: 登录用户

请求体:
- newUsername: string 必填，新的用户名

返回:
- { success: true, message, newUsername }
- 失败时抛出 400 等错误

## Param

H3 请求事件对象

## Returns
