[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/auth/register](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/auth/register.ts:43](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/auth/register.ts#L43)

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
