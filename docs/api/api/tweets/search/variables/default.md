[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/search](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/search.ts:23](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/tweets/search.ts#L23)

搜索推文，支持关键词与时间排序，带分页。

路由: GET /api/tweets/search
权限: 公开

查询参数:
- keyword?: string 关键词，默认空
- page?: number 页号，默认 1
- pageSize?: number 每页数量，默认 20
- order?: 'asc' | 'desc' 时间顺序，默认 desc

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message: string }

## Param

H3 请求事件对象

## Returns
