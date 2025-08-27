[**nuxt-app**](../../../README.md)

***

[nuxt-app](../../../README.md) / [util/database](../README.md) / Database

# Class: Database

Defined in: [util/database.ts:4](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/util/database.ts#L4)

## Constructors

### Constructor

> **new Database**(): `Database`

#### Returns

`Database`

## Methods

### exec()

> **exec**(`sql`): `Promise`\<\{ `error?`: `undefined`; `results`: `any`[]; `success`: `boolean`; \} \| \{ `error`: `any`; `results?`: `undefined`; `success`: `boolean`; \}\>

Defined in: [util/database.ts:45](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/util/database.ts#L45)

#### Parameters

##### sql

`string`

#### Returns

`Promise`\<\{ `error?`: `undefined`; `results`: `any`[]; `success`: `boolean`; \} \| \{ `error`: `any`; `results?`: `undefined`; `success`: `boolean`; \}\>

***

### sql()

> **sql**\<`T`\>(`strings`, ...`values`): `Promise`\<\{ `rows`: `T`[]; `success`: `boolean`; \}\>

Defined in: [util/database.ts:6](https://github.com/gujial/school-forum/blob/b5556fe3e8a472a3deef560b7e825ac0f4c95b87/server/util/database.ts#L6)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### strings

`TemplateStringsArray`

##### values

...`any`[]

#### Returns

`Promise`\<\{ `rows`: `T`[]; `success`: `boolean`; \}\>
