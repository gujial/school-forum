import { useDatabase } from '../../util/database'
import { unlink, rm } from 'fs/promises'
import { join } from 'path'
import authMiddleware from '../../util/auth';
import adminAuthMiddleware from '../../util/adminAuth'

const removeFile = async (mediaUrl: string): Promise<void> => {
    try {
        const parts = mediaUrl.split('/')
        if (parts.length === 5) {
            const filename = decodeURIComponent(parts.slice(4).join('/'))
            if (!filename) return
            const filePath = join(process.cwd(), 'dynamic', 'media', filename)
            await unlink(filePath)
        } else {
            const tweetId = parts[4]
            const filename = decodeURIComponent(parts.slice(5).join('/'))
            if (!tweetId || !filename) return
            const filePath = join(process.cwd(), 'dynamic', 'media', tweetId, filename)
            await unlink(filePath)
        }
    } catch (e) {
        // 文件不存在等错误可忽略
    }
    return
}

export default defineEventHandler(async (event) => {
    authMiddleware(event); 
    const tweetId = getRouterParam(event, 'id')
    const db = useDatabase()
    const userInfo = event.context.auth;

    if (!tweetId) {
        return { success: false, message: '推文ID不能为空' }
    }

    try {
        const { rows: userRows } = await db.sql`
            SELECT user_id FROM Tweets WHERE tweet_id = ${tweetId}
        `
        if (userRows.length === 0) {
            return { success: false, message: '推文不存在' }
        }

        if (userRows[0].user_id != userInfo.userId) {
            return adminAuthMiddleware(event);
        }

        // 删除相关媒体文件
        const { rows: mediaRows } = await db.sql`
            SELECT media_url FROM Media WHERE tweet_id = ${tweetId}
        `
        for (const media of mediaRows) {
            await removeFile(media.media_url)
        }

        if (mediaRows.length > 0) {
            await rm(join(process.cwd(), 'dynamic', 'media', tweetId), { recursive: true, force: true })
        }

        // 找到所有 tweet 相关的 tag_id
        const { rows: tagRows } = await db.sql`
            SELECT tag_id FROM TweetTags WHERE tweet_id = ${tweetId}
        `
        // 删除 tweet
        await db.sql`DELETE FROM Tweets WHERE tweet_id = ${tweetId}`

        // 遍历刚刚删除的 tag_id，检查是否还被其他 tweet 使用
        for (const { tag_id } of tagRows) {
            const { rows: countRows } = await db.sql`
                SELECT COUNT(*) AS cnt FROM TweetTags WHERE tag_id = ${tag_id}
            `
            if (countRows[0].cnt === 0) {
                await db.sql`DELETE FROM TAGS WHERE tag_id = ${tag_id}`
            }
        }

        return { success: true, message: '推文及相关信息已删除' }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return { success: false, message }
    }
})
