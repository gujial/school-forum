[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/files/avatar/\[id\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [api/files/avatar/\[id\].ts:20](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/files/avatar/[id].ts#L20)

读取某用户目录下最新头像文件。

路由: GET /api/files/avatar/:id
权限: 公开

路径参数:
- id: string 用户 ID

返回: 二进制图片数据，默认 Content-Type 为 image/jpeg

## Param

## Returns
