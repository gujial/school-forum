[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/message/deleteAllReceive.delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/message/deleteAllReceive.delete.ts:18](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/message/deleteAllReceive.delete.ts#L18)

清空当前用户收到的全部私信。

路由: DELETE /api/message/deleteAllReceive
权限: 登录用户

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
