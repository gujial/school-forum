[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/auth/user](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; `user?`: `undefined`; \} \| \{ `message?`: `undefined`; `success`: `boolean`; `user`: \{ `admin`: `boolean`; `created_at`: `any`; `email`: `any`; `user_id`: `any`; `username`: `any`; \}; \}\>\>

Defined in: [api/auth/user.ts:20](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/auth/user.ts#L20)

获取当前登录用户信息与是否为管理员标记。

路由: GET /api/auth/user
权限: 登录用户

返回:
- { success: true, user: { user_id, username, email, created_at, admin } }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
