[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/message/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/message/\[id\].delete.ts:21](https://github.com/gujial/school-forum/blob/d3dfcba3990433a263f51380abf1db2e35ed6fbd/server/api/message/[id].delete.ts#L21)

删除一条私信。

路由: DELETE /api/message/:id
权限: 登录用户（应为消息发送者或接收者）

路径参数:
- id: string 私信 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
