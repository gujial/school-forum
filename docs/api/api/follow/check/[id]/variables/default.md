[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/follow/check/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `follow?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `follow`: `boolean`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/follow/check/\[id\].ts:21](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/follow/check/[id].ts#L21)

检查当前用户是否已关注目标用户。

路由: GET /api/follow/check/:id
权限: 登录用户

路径参数:
- id: string 目标用户 ID

返回:
- { success: true, follow: boolean }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
