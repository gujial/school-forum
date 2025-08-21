[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/auth/register](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/auth/register.ts:36](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/auth/register.ts#L36)

用户注册，创建用户记录并初始化头像。

路由: POST /api/auth/register
权限: 公开

请求体:
- username: string 必填
- email: string 必填
- password: string 必填

返回:
- { success: true, message: string }

## Param

H3 请求事件对象

## Returns
