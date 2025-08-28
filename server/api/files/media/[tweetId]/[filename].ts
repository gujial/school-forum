import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { defineEventHandler, getRouterParam, createError } from 'h3';

/**
 * 读取某条推文目录下的媒体文件。
 *
 * 路由: GET /api/files/media/:tweetId/:filename
 * 权限: 公开
 *
 * 路径参数:
 * - tweetId: string 推文 ID
 * - filename: string 文件名（需 URL 编码安全）
 *
 * 返回: 二进制文件流，按扩展名设置 Content-Type
 *
 * @param {import('h3').H3Event} event
 * @returns {Promise<Buffer>}
 */
export default defineEventHandler(async (event) => {
    const tweetId = getRouterParam(event, 'tweetId');
    const filename = getRouterParam(event, 'filename');

    if (!tweetId || !filename) {
        throw createError({
            statusCode: 400,
            message: '推文ID或文件名不能为空',
        });
    }

    // URL解码文件名
    const decodedFilename = decodeURIComponent(filename);

    // console.log('原始文件名:', filename)
    // console.log('解码后文件名:', decodedFilename)
    // console.log('推文ID:', tweetId)

    try {
        const filePath = join(process.cwd(), 'dynamic', 'media', tweetId, decodedFilename);
        // console.log('完整文件路径:', filePath)

        if (!existsSync(filePath)) {
            throw createError({
                statusCode: 404,
                message: '文件不存在',
            });
        }

        // 读取文件
        const fileBuffer = readFileSync(filePath);

        // 根据文件扩展名设置Content-Type
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === 'jpg' || ext === 'jpeg') {
            contentType = 'image/jpeg';
        } else if (ext === 'png') {
            contentType = 'image/png';
        } else if (ext === 'gif') {
            contentType = 'image/gif';
        } else if (ext === 'webp') {
            contentType = 'image/webp';
        } else if (ext === 'mp4') {
            contentType = 'video/mp4';
        } else if (ext === 'avi') {
            contentType = 'video/x-msvideo';
        } else if (ext === 'mov') {
            contentType = 'video/quicktime';
        } else if (ext === 'webm') {
            contentType = 'video/webm';
        } else if (ext === 'svg') {
            contentType = 'image/svg+xml';
        }

        // 设置响应头
        event.node.res.setHeader('Content-Type', contentType);
        event.node.res.setHeader('Content-Length', fileBuffer.length.toString());
        event.node.res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存1年

        return fileBuffer;
    } catch (error) {
        console.error('媒体文件读取错误:', error);
        throw createError({
            statusCode: 500,
            message: '服务器内部错误',
        });
    }
});
