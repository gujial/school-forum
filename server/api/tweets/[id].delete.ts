import { useDatabase } from '../../util/database'
import { unlink, rm } from 'fs/promises'
import { join } from 'path'

const removeFile = async (mediaUrl: string): Promise<void> => {
    try {
        // mediaUrl 格式为 /api/files/media/{tweetId}/{filename}
        const parts = mediaUrl.split('/')
        console.log('Removing file:', parts)
        if (parts.length = 5) {
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
    const tweetId = getRouterParam(event, 'id')
    const db = useDatabase()

    if (!tweetId) {
        return { success: false, message: '推文ID不能为空' }
    }

    try {
        const { rows: mediaRows } = await db.sql`
      SELECT media_url FROM Media WHERE tweet_id = ${tweetId}
    `
        for (const media of mediaRows) {
            await removeFile(media.media_url)
        }

        if (mediaRows.length > 0) {
            await rm(join(process.cwd(), 'dynamic', 'media', tweetId), { recursive: true, force: true })
        }

        await db.sql`DELETE FROM Tweets WHERE tweet_id = ${tweetId}`

        return { success: true, message: '推文及相关信息已删除' }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return { success: false, message }
    }
})