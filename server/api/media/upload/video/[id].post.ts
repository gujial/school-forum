import { IncomingForm } from 'formidable';
import { mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { useDatabase } from '../../../../util/database';

/**
 * 上传单个视频到指定推文目录，并记录到 `Media` 表。
 *
 * 路由: POST /api/media/upload/video/:id
 * 权限: 公开（建议结合业务策略限制）
 *
 * 路径参数:
 * - id: string 推文 ID
 *
 * 请求: multipart/form-data，字段名 `file`
 *
 * 返回:
 * - { statusCode: 200, body: { tweetId, filePath } }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{statusCode: number, body: string}>}
 */
export default defineEventHandler(async (event) => {
    const tweetId = getRouterParam(event, 'id');
    const form = new IncomingForm({ multiples: false });

    if (tweetId == undefined) {
        throw createError({
            statusCode: 401,
            message: 'Need tweet id',
        });
    }

    const uploadDir = join(process.cwd(), 'dynamic', 'media', tweetId);
    mkdirSync(uploadDir, { recursive: true });

    return new Promise((resolve, reject) => {
        form.parse(event.node.req, async (err, fields, files) => {
            if (err) {
                return reject(err);
            }

            if (files.file == undefined) {
                throw createError({
                    statusCode: 401,
                    statusMessage: 'Invalid file',
                });
            }

            const db = useDatabase();
            const file = files.file[0];

            if (file.originalFilename == null) {
                throw createError({
                    statusCode: 401,
                    statusMessage: 'Invalid filename',
                });
            }

            const filePath = join(uploadDir, file.originalFilename);
            try {
                copyFileSync(file.filepath, filePath);
                unlinkSync(file.filepath); // Delete the temporary file after copying
            } catch (copyError) {
                return reject(copyError);
            }

            await db.sql`INSERT INTO Media (tweet_id, media_url, media_type) VALUES (${tweetId}, ${`/api/files/media/${tweetId}/${file.originalFilename}`}, ${'video'})`;

            resolve({
                statusCode: 200,
                body: JSON.stringify({
                    tweetId,
                    filePath: `/api/files/media/${tweetId}/${file.originalFilename}`,
                }),
            });
        });
    });
});
