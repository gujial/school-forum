[**nuxt-app**](../../../../../../README.md)

***

[nuxt-app](../../../../../../README.md) / [api/files/media/\[tweetId\]/\[filename\]](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [api/files/media/\[tweetId\]/\[filename\].ts:20](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/files/media/[tweetId]/[filename].ts#L20)

读取某条推文目录下的媒体文件。

路由: GET /api/files/media/:tweetId/:filename
权限: 公开

路径参数:
- tweetId: string 推文 ID
- filename: string 文件名（需 URL 编码安全）

返回: 二进制文件流，按扩展名设置 Content-Type

## Param

## Returns
