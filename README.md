# “可圈可点”校园论坛平台

![icon](./public/icon.png)<br/>
“可圈可点”校园论坛平台
> 以下内容根据开发进程可能会有所变动

## 环境配置

### 1. 复制环境变量文件
```shell
cp env.example .env
```

### 2. 配置MySQL数据库
编辑 `.env` 文件，设置数据库连接信息：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_forum
```

### 3. 创建MySQL数据库
```sql
CREATE DATABASE school_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 运行

```shell
pnpm install
pnpm run db:test    # 测试数据库连接
pnpm run db:init    # 初始化数据库表
pnpm run dev
```

## 部署

```shell
pnpm install
```

配置环境变量并初始化数据库

```shell
cp env.example .env
# 编辑 .env 文件配置数据库信息
pnpm run db:init
```

构建和部署

```shell
pnpm run build
cp -r .data .output
cd .output
mkdir dynamic
node ./server/index.mjs
```

## 文件服务

文件上传和下载现在由Node.js服务器直接提供，无需额外的图片服务器。

文件存储结构：
- 头像文件：`dynamic/avatars/{userId}/`
- 媒体文件：`dynamic/media/{tweetId}/`

API接口：
- 头像下载：`/api/files/avatar/{userId}`
- 媒体文件下载：`/api/files/media/{tweetId}/{filename}`

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