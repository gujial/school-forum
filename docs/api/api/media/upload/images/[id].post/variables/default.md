[**nuxt-app**](../../../../../../README.md)

***

[nuxt-app](../../../../../../README.md) / [api/media/upload/images/\[id\].post](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/media/upload/images/\[id\].post.ts:23](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/api/media/upload/images/[id].post.ts#L23)

批量上传图片到指定推文目录，并记录到 `Media` 表。

路由: POST /api/media/upload/images/:id
权限: 公开（建议结合业务策略限制）

路径参数:
- id: string 推文 ID

请求: multipart/form-data，字段名 `file`（可多选）

返回:
- { statusCode: 200, body: { tweetId, filePath: string[] } }

## Param

H3 请求事件对象

## Returns
