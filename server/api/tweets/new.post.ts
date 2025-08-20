import { defineEventHandler, readBody, createError } from 'h3'
import authMiddleware from '../../util/auth';
import { useDatabase } from '../../util/database';
import { auditAndReport } from "../../util/contentModeration";

/**
 * 创建推文（可附带标签与媒体）。
 *
 * 路由: POST /api/tweets/new
 * 权限: 登录用户
 *
 * 请求体:
 * - content: string 必填，推文内容
 * - parent_id?: number 可选，引用的父推文 ID（转发/评论）
 * - attachments?: string[] 可选，已上传媒体的 URL 列表
 * - tags?: string[] | string 可选，标签集合
 *
 * 返回:
 * - { success: true, tweet_id: number, message: string }
 * - { success: false, message: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, tweet_id?: number, message: string}>}
 */
export default defineEventHandler(async (event) => {
    const db = useDatabase()
    const body = await readBody(event)
    await authMiddleware(event);
    const userInfo = event.context.auth

    // 验证输入参数
    if (!body['content']) {
        return {
            success: false,
            message: 'Invalid input parameters'
        }
    }

    const newTweet = {
        user_id: userInfo.userId,
        content: body['content'],
        parent_id: body['parent_id'] || null
    }

    try {
        await db.sql`INSERT INTO Tweets (user_id, parent_id, content) VALUES (${newTweet.user_id}, ${newTweet.parent_id}, ${newTweet.content})`;
        const { rows } = await db.sql`SELECT LAST_INSERT_ID() as tweet_id`;
        if (rows == undefined) {
            throw createError({
                statusCode: 401,
                message: 'Create tweet failed'
            })
        }
        const tweetId = rows[0].tweet_id;

        auditAndReport(newTweet.content, tweetId, undefined)

        for (const file of body['attachments'] || []) {
            await db.sql`UPDATE Media SET tweet_id = ${rows[0].tweet_id} WHERE tweet_id IS NULL AND media_type = ${'all'} AND media_url = ${file}`
        }

        if (body['tags'] && body['tags'].length > 0) {
            const tagStr = Array.isArray(body['tags']) ? body['tags'].join(',') : body['tags'];
            await db.sql`CALL add_tweet_tags(${tweetId}, ${tagStr})`;
        }

        return {
            success: true,
            tweet_id: rows[0].tweet_id,
            message: 'Tweet created successfully'
        }
    } catch (error) {
        console.error('Database error:', error)
        return {
            success: false,
            message: 'Failed to create tweet'
        }
    }
})
