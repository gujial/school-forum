[**nuxt-app**](../../../../../../README.md)

***

[nuxt-app](../../../../../../README.md) / [api/media/upload/video/\[id\].post](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/media/upload/video/\[id\].post.ts:23](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/media/upload/video/[id].post.ts#L23)

上传单个视频到指定推文目录，并记录到 `Media` 表。

路由: POST /api/media/upload/video/:id
权限: 公开（建议结合业务策略限制）

路径参数:
- id: string 推文 ID

请求: multipart/form-data，字段名 `file`

返回:
- { statusCode: 200, body: { tweetId, filePath } }

## Param

H3 请求事件对象

## Returns
