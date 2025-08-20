[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/follow/get\_follower\_list/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; `total?`: `undefined`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; `total`: `number`; \}\>\>

Defined in: [api/follow/get\_follower\_list/\[id\].ts:24](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/follow/get_follower_list/[id].ts#L24)

获取指定用户的粉丝列表（分页）。

路由: GET /api/follow/get_follower_list/:id
权限: 公开

路径参数:
- id: string 用户 ID

查询参数:
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 20

返回:
- { success: true, data: { follower_id }[], maxPages: number, total: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
