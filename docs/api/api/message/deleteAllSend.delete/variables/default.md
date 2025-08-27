[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/message/deleteAllSend.delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/message/deleteAllSend.delete.ts:18](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/message/deleteAllSend.delete.ts#L18)

清空当前用户发送的全部私信。

路由: DELETE /api/message/deleteAllSend
权限: 登录用户

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
