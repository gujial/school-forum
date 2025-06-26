# “可圈可点”校园论坛平台

![icon](./public/icon.png)<br/>
“可圈可点”校园论坛平台
> 以下内容根据开发进程可能会有所变动

## 运行

```shell
pnpm install
pnpm run dev
```

## 部署

```shell
pnpm install
```

先设置好图片服务器再构建

```shell
pnpm run build
cp -r .data .output
cd .output
mkdir dynamic
node ./server/index.mjs
```

## 图片服务器

任选 http Server 在`dynamic`文件夹启动即可，以 python 为例

```shell
cd dynamic
python -m http.server 3001
```

在`nuxt.config.ts`中编辑配置

```typescript
runtimeConfig: {
    image_server: "http://<your-host>:3001"
},
```

## 技术栈

- [nuxt3](https://nuxt.com/)
- [nitro](https://nitro.unjs.io/)
- [vue](https://vuejs.org/)
- [vuetify](https://vuetifyjs.com/zh-Hans/)
- [Vuetify Nuxt Module](https://vuetify-nuxt-module.netlify.app/)
- [sidebase/nuxt-auth](https://sidebase.io/nuxt-auth/getting-started)
- [vueuse](https://vueuse.org/)
- [colorMode](https://color-mode.nuxtjs.org/)
- [vuei18n](https://vue-i18n.intlify.dev/)
- [mdi](https://pictogrammers.com/library/mdi/)
- [nuxt/i18n](https://i18n.nuxtjs.org/)

## 相关文档
- [产品文档](https://github.com/gujial/school-forum/blob/dev/“可圈可点”校园论坛平台产品文档.md)
- [开发文档](https://github.com/gujial/school-forum/blob/dev/“可圈可点”校园论坛平台开发文档.md)