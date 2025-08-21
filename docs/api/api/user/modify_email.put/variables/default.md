[**nuxt-app**](../../../../README.md)

***

[nuxt-app](../../../../README.md) / [api/user/modify\_email.put](../README.md) / default

# Variable: default

> **default**: `any`

Defined in: [api/user/modify\_email.put.ts:20](https://github.com/gujial/school-forum/blob/46eca051e02385d54a0c540369b17bb449ad978a/server/api/user/modify_email.put.ts#L20)

修改当前用户的邮箱。

路由: PUT /api/user/modify_email
权限: 登录用户

请求体:
- newEmail: string 必填，新邮箱

返回:
- { success: true, message, newEmail }
- { success: false, message }

## Param

H3 请求事件对象

## Returns
