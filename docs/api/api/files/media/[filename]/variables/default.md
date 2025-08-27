[**nuxt-app**](../../../../../README.md)

***

[nuxt-app](../../../../../README.md) / [api/files/media/\[filename\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [api/files/media/\[filename\].ts:19](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/files/media/[filename].ts#L19)

读取通用媒体文件（未关联推文目录）。

路由: GET /api/files/media/:filename
权限: 公开

路径参数:
- filename: string 文件名（需 URL 编码安全）

返回: 二进制文件流，按扩展名设置 Content-Type

## Param

## Returns
