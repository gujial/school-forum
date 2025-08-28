import { readFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import type { H3Event } from 'h3';
import { defineEventHandler, getRouterParam, createError } from 'h3';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

function getCacheDir(tweetId: string) {
    return join(process.cwd(), 'dynamic', 'media_cache', tweetId);
}

function getCachePath(tweetId: string, filename: string) {
    const ext = extname(filename).toLowerCase();
    const name = basename(filename, ext);
    return join(getCacheDir(tweetId), `${name}.jpg`);
}

function setResponseHeaders(event: H3Event, buffer: Buffer) {
    event.node.res.setHeader('Content-Type', 'image/jpeg');
    event.node.res.setHeader('Content-Length', buffer.length.toString());
    event.node.res.setHeader('Cache-Control', 'public, max-age=31536000');
}

export default defineEventHandler(async (event) => {
    const tweetId = getRouterParam(event, 'tweetId');
    const filename = getRouterParam(event, 'filename');

    if (!tweetId || !filename) {
        throw createError({ statusCode: 400, message: '推文ID或文件名不能为空' });
    }

    const decodedFilename = decodeURIComponent(filename);
    const filePath = join(process.cwd(), 'dynamic', 'media', tweetId, decodedFilename);

    if (!existsSync(filePath)) {
        throw createError({ statusCode: 404, message: '文件不存在' });
    }

    try {
        const ext = extname(decodedFilename).toLowerCase().replace('.', '');
        const cachePath = getCachePath(tweetId, decodedFilename);

        if (ext === 'svg') {
            const buffer = readFileSync(filePath);
            event.node.res.setHeader('Content-Type', 'image/svg+xml');
            event.node.res.setHeader('Content-Length', buffer.length.toString());
            event.node.res.setHeader('Cache-Control', 'public, max-age=31536000');
            return buffer;
        }

        // 直接返回缓存
        if (existsSync(cachePath)) {
            const buffer = readFileSync(cachePath);
            setResponseHeaders(event, buffer);
            return buffer;
        }

        let buffer: Buffer | null = null;

        // 图片处理
        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            buffer = await sharp(filePath).resize({ width: 1080 }).jpeg({ quality: 80 }).toBuffer();
        }

        // 视频处理
        if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) {
            const tmpFile = join(tmpdir(), `${randomUUID()}.jpg`);
            await new Promise<void>((resolve, reject) => {
                ffmpeg(filePath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .outputOptions(['-frames:v 1', '-vf scale=640:-1'])
                    .save(tmpFile);
            });
            buffer = await sharp(tmpFile).jpeg({ quality: 70 }).toBuffer();
            await unlink(tmpFile);
        }

        if (buffer) {
            // 缓存文件
            const dir = getCacheDir(tweetId);
            await mkdir(dir, { recursive: true });
            await writeFile(cachePath, buffer);
            setResponseHeaders(event, buffer);
            return buffer;
        }

        // 非图片/视频类型原样返回
        const fileBuffer = readFileSync(filePath);
        event.node.res.setHeader('Content-Type', 'application/octet-stream');
        event.node.res.setHeader('Content-Length', fileBuffer.length.toString());
        return fileBuffer;
    } catch (error) {
        console.error('媒体文件处理错误:', error);
        throw createError({ statusCode: 500, message: '服务器内部错误' });
    }
});
