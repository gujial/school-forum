[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/follow/get\_following\_list/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; `total?`: `undefined`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; `total`: `number`; \}\>\>

Defined in: [api/follow/get\_following\_list/\[id\].ts:24](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/follow/get_following_list/[id].ts#L24)

获取指定用户的关注列表（分页）。

路由: GET /api/follow/get_following_list/:id
权限: 公开

路径参数:
- id: string 用户 ID

查询参数:
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 20

返回:
- { success: true, data: { following_id }[], maxPages: number, total: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
