[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/message/get](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; `total?`: `undefined`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; `total`: `number`; \}\>\>

Defined in: [api/message/get.ts:22](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/message/get.ts#L22)

获取当前用户收到的私信（排除自己发给自己的），按时间倒序分页。

路由: GET /api/message/get
权限: 登录用户

查询参数:
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 20

返回:
- { success: true, data: any[], maxPages: number, total: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
