[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/follow/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `follow`: `boolean`; `message?`: `undefined`; `success`: `boolean`; \} \| \{ `follow?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/follow/\[id\].delete.ts:21](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/follow/[id].delete.ts#L21)

取消关注指定用户。

路由: DELETE /api/follow/:id
权限: 登录用户

路径参数:
- id: string 被取消关注用户 ID

返回:
- { success: true, follow: false }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
