[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/modify\_password.put](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/user/modify\_password.put.ts:28](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/user/modify_password.put.ts#L28)

修改当前用户的密码。

路由: PUT /api/user/modify_password
权限: 登录用户

请求体:
- oldPassword: string 必填，旧密码
- newPassword: string 必填，新密码

返回:
- { success: true, message }
- 失败时抛出 400/401/404 等错误

## Param

H3 请求事件对象

## Returns
