import 'dotenv/config'
import { executeQuery, testConnection } from '../server/config/database.runtime.js'

const START_TWEET_ID = Number.parseInt(process.env.SEED_START_TWEET_ID || '1000001', 10)
const CLEAN_ORPHAN_TAGS = String(process.env.CLEAN_ORPHAN_TAGS || 'false').toLowerCase() === 'true'

const defaultUserPatterns = ['seed_user_%', 'test_%']

function parseUserPatterns() {
  const raw = (process.env.SEED_CLEAN_USER_PATTERNS || '').trim()
  if (!raw) {
    return defaultUserPatterns
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

async function runDelete(sql, params = []) {
  const result = await executeQuery(sql, params)
  if (!result.success) {
    throw new Error(String(result.error))
  }

  const affectedRows = Number(result.rows?.affectedRows || 0)
  return affectedRows
}

async function cleanupSeedData() {
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('无法连接到数据库，请检查配置')
    process.exit(1)
  }

  const userPatterns = parseUserPatterns()
  console.log('🧹 开始清理历史测试数据...')
  console.log(`📝 规则: tweet_id >= ${START_TWEET_ID}, 用户名匹配 ${userPatterns.join(', ')}`)

  try {
    const deletedTweetsById = await runDelete('DELETE FROM Tweets WHERE tweet_id >= ?', [START_TWEET_ID])

    let deletedUsers = 0
    for (const pattern of userPatterns) {
      const deleted = await runDelete('DELETE FROM Users WHERE username LIKE ?', [pattern])
      deletedUsers += deleted
    }

    let deletedOrphanTags = 0
    if (CLEAN_ORPHAN_TAGS) {
      deletedOrphanTags = await runDelete(
        `DELETE tg
         FROM TAGS tg
         LEFT JOIN TweetTags tt ON tt.tag_id = tg.tag_id
         WHERE tt.tag_id IS NULL`
      )
    }

    console.log('✅ 测试数据清理完成')
    console.log(`🗑️ 删除帖子数: ${deletedTweetsById}`)
    console.log(`🗑️ 删除用户数: ${deletedUsers}`)
    if (CLEAN_ORPHAN_TAGS) {
      console.log(`🗑️ 删除孤立标签数: ${deletedOrphanTags}`)
    }
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error)
    process.exit(1)
  }
}

cleanupSeedData()