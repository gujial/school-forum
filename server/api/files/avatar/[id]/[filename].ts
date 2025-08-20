import { sendStream } from 'h3';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

/**
 * 读取某用户目录下的指定头像文件。
 *
 * 路由: GET /api/files/avatar/:id/:filename
 * 权限: 公开
 *
 * 路径参数:
 * - id: string 用户 ID
 * - filename: string 文件名
 *
 * 返回: 文件流
 *
 * @param {import('h3').H3Event} event
 * @returns {Promise<any>} sendStream 响应
 */
export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');
    const filename = getRouterParam(event, 'filename');

    if (userId === undefined || filename === undefined) {
        return { statusCode: 400, message: 'Missing user id or filename' };
    }

    const filePath = join(process.cwd(), 'dynamic', 'avatars', userId, filename);

    if (!existsSync(filePath)) {
        return { statusCode: 404, message: 'File not found' };
    }

    return sendStream(event, createReadStream(filePath));
});
