[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/by\_tags\_asc](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `data?`: `undefined`; `maxPages?`: `undefined`; `message`: `string`; `success`: `boolean`; \} \| \{ `data`: `any`[]; `maxPages`: `number`; `message?`: `undefined`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/by\_tags\_asc.ts:23](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/tweets/by_tags_asc.ts#L23)

按标签过滤推文（需同时包含全部指定标签），按时间正序分页。

路由: GET/POST /api/tweets/by_tags_asc
权限: 公开

参数来源:
- GET 查询参数: tags, page?, pageSize?
- POST JSON 体: tags, page?, pageSize?

tags 支持逗号分隔字符串或数组，去重后按全部包含匹配。

返回:
- { success: true, data: any[], maxPages }
- { success: false, message }

## Param

## Returns
