[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/follow/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `follow`: `boolean`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `follow?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/follow/\[id\].ts:21](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/follow/[id].ts#L21)

关注指定用户。

路由: POST /api/follow/:id
权限: 登录用户

路径参数:
- id: string 被关注用户 ID

返回:
- { success: true, follow: true }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
