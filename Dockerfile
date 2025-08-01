# 使用官方 Node 镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm pm2

# 配置 pnpm 的全局 bin 目录到 PATH
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 复制依赖文件
COPY pnpm-lock.yaml* package.json* ./

# 安装依赖
RUN pnpm install

# 设置时区为东八区
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai

# 复制项目文件
COPY . .

# 创建必要的目录
RUN mkdir -p dynamic/avatars dynamic/media

# 构建项目
RUN pnpm run build

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
