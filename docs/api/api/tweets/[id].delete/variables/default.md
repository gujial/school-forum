[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/tweets/\[id\].delete](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/tweets/\[id\].delete.ts:44](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/api/tweets/[id].delete.ts#L44)

删除指定推文，连带清理关联媒体与无引用标签。

路由: DELETE /api/tweets/:id
权限: 登录用户（作者），或管理员

路径参数:
- id: string 推文 ID

返回:
- { success: true, message }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
