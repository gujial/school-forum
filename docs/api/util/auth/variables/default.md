[**nuxt-app**](../../../README.md)

***

[nuxt-app](../../../README.md) / [util/auth](../README.md) / default

# Variable: default

> **default**: `EventHandler`\<`EventHandlerRequest`, `Promise`\<`void`\>\>

Defined in: [util/auth.ts:18](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/util/auth.ts#L18)

认证中间件：从 Cookie 中读取 `auth_token`，校验 JWT，
并在 `event.context.auth` 上注入 `{ userId, username }`。

路由使用方式：在需要登录的接口中先 `await authMiddleware(event)`。

## Param

H3 请求事件对象

## Returns

验证通过则继续，失败抛出 401 错误

## Throws

未登录或 Token 无效时抛出 401
