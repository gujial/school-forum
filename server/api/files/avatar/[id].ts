import { readFileSync, existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { defineEventHandler, getRouterParam, createError } from 'h3';

/**
 * 读取某用户目录下最新头像文件。
 *
 * 路由: GET /api/files/avatar/:id
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 *
 * 返回: 二进制图片数据，默认 Content-Type 为 image/jpeg
 *
 * @param {import('h3').H3Event} event
 * @returns {Promise<Buffer>}
 */
export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');

    if (!userId) {
        throw createError({
            statusCode: 400,
            message: '用户ID不能为空',
        });
    }

    try {
        // 查找用户头像文件
        const avatarDir = join(process.cwd(), 'dynamic', 'avatars', userId);
        const files = await readdir(avatarDir);

        if (files.length === 0) {
            throw createError({
                statusCode: 404,
                message: '头像文件不存在',
            });
        }

        // 获取第一个文件（通常只有一个头像文件）
        const avatarFile = files[0];
        const filePath = join(avatarDir, avatarFile);

        if (!existsSync(filePath)) {
            throw createError({
                statusCode: 404,
                message: '头像文件不存在',
            });
        }

        // 读取文件
        const fileBuffer = readFileSync(filePath);

        // 设置响应头
        event.node.res.setHeader('Content-Type', 'image/jpeg');
        event.node.res.setHeader('Content-Length', fileBuffer.length.toString());
        event.node.res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存1年

        return fileBuffer;
    } catch (error) {
        console.error('头像文件读取错误:', error);
        throw createError({
            statusCode: 500,
            message: '服务器内部错误',
        });
    }
});
