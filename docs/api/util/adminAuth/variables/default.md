[**nuxt-app**](../../../README.md)

***

[nuxt-app](../../../README.md) / [util/adminAuth](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<`void`\>\>

Defined in: [util/adminAuth.ts:17](https://github.com/gujial/school-forum/blob/bd7112d3c56318830c9c57a38cf40d5ca9366cca/server/util/adminAuth.ts#L17)

管理员鉴权中间件：在基础登录校验后，检查当前用户是否存在于 `Admins` 表。
不通过将抛出 401 错误。

路由使用方式：在仅限管理员的接口中先 `await adminAuthMiddleware(event)`。

## Param

H3 请求事件对象

## Returns

通过校验则继续执行

## Throws

非管理员时抛出 401
