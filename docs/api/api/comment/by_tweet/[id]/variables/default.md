[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/comment/by\_tweet/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/comment/by\_tweet/\[id\].ts:23](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/comment/by_tweet/[id].ts#L23)

获取某条推文下的顶级评论（不包含子评论），按时间正序，分页返回。

路由: GET /api/comment/by_tweet/:id
权限: 公开

路径参数:
- id: string 推文 ID

查询参数:
- page: number 必填，页号

返回:
- { success: true, data: any[], maxPages: number }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
