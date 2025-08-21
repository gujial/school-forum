[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/media/upload.post](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/media/upload.post.ts:21](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/media/upload.post.ts#L21)

上传媒体文件（未关联推文，得到通用 URL）。

路由: POST /api/media/upload
权限: 公开（建议结合业务策略限制）

请求: multipart/form-data，字段名 `file`

返回:
- { statusCode: 200, filePath: string }

## Param

H3 请求事件对象

## Returns
