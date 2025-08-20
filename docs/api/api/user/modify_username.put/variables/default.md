[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/modify\_username.put](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `newUsername`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/user/modify\_username.put.ts:25](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/user/modify_username.put.ts#L25)

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
