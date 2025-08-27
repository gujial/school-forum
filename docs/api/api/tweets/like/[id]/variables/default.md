[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/tweets/like/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>\>

Defined in: [api/tweets/like/\[id\].ts:21](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/tweets/like/[id].ts#L21)

点赞或取消点赞指定推文（幂等切换）。

路由: POST /api/tweets/like/:id
权限: 登录用户

路径参数:
- id: string 推文 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
