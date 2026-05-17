import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { executeQuery, executeTransaction, testConnection } from '../server/config/database.runtime.js'

const USER_COUNT = Number.parseInt(process.env.SEED_USER_COUNT || '100', 10)
const TWEET_COUNT = Number.parseInt(process.env.SEED_TWEET_COUNT || '1000', 10)
const START_USER_ID = Number.parseInt(process.env.SEED_START_USER_ID || '2', 10)
const START_TWEET_ID = Number.parseInt(process.env.SEED_START_TWEET_ID || '1000001', 10)
const START_TIME = new Date(process.env.SEED_START_TIME || '2026-05-17T09:00:00+08:00')
const TIMELINE_DAYS = Number.parseInt(process.env.SEED_TIMELINE_DAYS || '120', 10)

const topics = ['学习', '作业', '考试', '社团', '活动', '图书馆', '食堂', '寝室', '课程', '实习']
const actions = ['讨论', '分享', '吐槽', '求助', '总结', '记录', '整理', '推荐', '提醒', '复盘']
const tagNames = [
  '学习',
  '作业',
  '考试',
  '经验分享',
  '课程讨论',
  '校园生活',
  '活动报名',
  '实习就业',
  '图书馆',
  '食堂',
  '寝室',
  '社团',
  '求助',
  '吐槽',
  '干货',
  '摄影',
  '运动',
  '音乐',
  '技术',
  '考研',
]
const details = [
  '这条内容适合验证列表展示、分页和详情页。',
  '可以用来检查搜索、筛选和排序是否正常。',
  '内容长度故意稍长，方便测试换行和摘要。',
  '适合观察头像、作者名和发布时间的布局。',
  '这是一条用于压测的随机帖子样例。',
  '可以继续在下面补评论、点赞和转发数据。',
  '测试富文本、纯文本和特殊字符的兼容性。',
  '用于验证首页刷新后数据是否稳定显示。',
]

const hourWeights = [
  0.1, 0.06, 0.04, 0.03, 0.03, 0.04, 0.08, 0.25, 0.45, 0.62, 0.7, 0.74,
  0.78, 0.82, 0.84, 0.88, 0.92, 1.0, 0.95, 0.9, 0.84, 0.66, 0.42, 0.22,
]

const tagWeights = [
  1.0, 0.95, 0.9, 0.86, 0.82, 0.78, 0.72, 0.68, 0.64, 0.6,
  0.56, 0.52, 0.48, 0.45, 0.4, 0.3, 0.28, 0.26, 0.24, 0.22,
]

const tagCountWeights = [0.55, 0.3, 0.12, 0.03]

function makeSeededRandom(seedValue) {
  let seed = seedValue >>> 0
  return function random() {
    seed += 0x6D2B79F5
    let value = seed
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function getSeedNumber() {
  const rawSeed = process.env.SEED_RANDOM_SEED || '20260517'
  const parsed = Number.parseInt(rawSeed, 10)
  if (Number.isFinite(parsed)) {
    return parsed
  }

  let hash = 0
  for (const char of rawSeed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

function pad(number, length = 3) {
  return String(number).padStart(length, '0')
}

function pick(random, list) {
  return list[Math.floor(random() * list.length)]
}

function chunkArray(items, size) {
  const chunks = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

function randomInt(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min
}

function weightedPickIndex(random, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + Math.max(weight, 0), 0)
  if (totalWeight <= 0) {
    return randomInt(random, 0, weights.length - 1)
  }

  let threshold = random() * totalWeight
  for (let index = 0; index < weights.length; index += 1) {
    threshold -= Math.max(weights[index], 0)
    if (threshold <= 0) {
      return index
    }
  }

  return weights.length - 1
}

function sampleWeightedCount(random, weights, minValue = 1) {
  return weightedPickIndex(random, weights) + minValue
}

function pickWeightedUniqueItems(random, items, weights, count) {
  const result = []
  const poolItems = [...items]
  const poolWeights = [...weights]

  while (result.length < count && poolItems.length > 0) {
    const selectedIndex = weightedPickIndex(random, poolWeights)
    result.push(poolItems[selectedIndex])
    poolItems.splice(selectedIndex, 1)
    poolWeights.splice(selectedIndex, 1)
  }

  return result
}

function buildPostTime(random, index) {
  const dayPosition = 1 - Math.pow(random(), 2.2)
  const dayOffset = Math.floor(dayPosition * TIMELINE_DAYS)
  const hour = weightedPickIndex(random, hourWeights)
  const minute = randomInt(random, 0, 59)
  const second = randomInt(random, 0, 59)

  const baseTime = new Date(START_TIME.getTime())
  baseTime.setDate(baseTime.getDate() + dayOffset)
  baseTime.setHours(hour, minute, second, 0)

  // 用索引微扰避免完全相同的时间戳
  return new Date(baseTime.getTime() + index * 1000)
}

function buildUsers(random) {
  const passwordHash = bcrypt.hashSync('123456', 10)
  const users = []

  for (let index = 0; index < USER_COUNT; index += 1) {
    const userId = START_USER_ID + index
    users.push({
      userId,
      username: `seed_user_${pad(index + 1, 3)}`,
      email: `seed_user_${pad(index + 1, 3)}@example.com`,
      password: passwordHash,
      bgUrl: null,
      createdAt: new Date(START_TIME.getTime() + index * 60 * 1000),
      // 少数用户高活跃，多数用户低活跃
      activityScore: 1 / Math.pow(random() + 0.03, 1.15),
    })
  }

  return users
}

function buildTweets(random, users) {
  const tweets = []
  const userIds = users.map((user) => user.userId)
  const userWeights = users.map((user) => user.activityScore)

  for (let index = 0; index < TWEET_COUNT; index += 1) {
    const tweetId = START_TWEET_ID + index
    const userId = userIds[weightedPickIndex(random, userWeights)]
    const topic = pick(random, topics)
    const action = pick(random, actions)
    const detail = pick(random, details)
    const suffix = pad(index + 1, 4)

    tweets.push({
      tweetId,
      userId,
      content: `【${suffix}】关于${topic}的${action}：${detail}`,
      createdAt: buildPostTime(random, index),
    })
  }

  return tweets
}

function buildTweetTags(random, tweets, tagsByName) {
  const tweetTags = []

  for (const tweet of tweets) {
    const tagCount = sampleWeightedCount(random, tagCountWeights, 1)
    const selectedTagNames = pickWeightedUniqueItems(random, tagNames, tagWeights, tagCount)

    for (const tagName of selectedTagNames) {
      const tagId = tagsByName.get(tagName)
      if (tagId) {
        tweetTags.push({ tweetId: tweet.tweetId, tagId })
      }
    }
  }

  return tweetTags
}

function buildLikes(random, tweets, users) {
  const likes = []
  const userIds = users.map((user) => user.userId)
  const maxActivityScore = users.reduce((max, user) => Math.max(max, user.activityScore), 1)
  const activityMap = new Map(users.map((user) => [user.userId, user.activityScore]))

  for (const tweet of tweets) {
    const maxLikes = Math.min(20, userIds.length - 1)
    const authorScore = activityMap.get(tweet.userId) || 1
    const authorInfluence = Math.min(1, authorScore / maxActivityScore)

    let likeCount = 0
    const tierRoll = random()
    if (tierRoll < 0.5) {
      likeCount = 0
    } else if (tierRoll < 0.82) {
      likeCount = randomInt(random, 1, 3)
    } else if (tierRoll < 0.96) {
      likeCount = randomInt(random, 4, 10)
    } else {
      likeCount = randomInt(random, 11, maxLikes)
    }

    // 头部作者更容易出现高互动
    const boostFactor = 0.65 + authorInfluence * 0.9
    likeCount = Math.min(maxLikes, Math.floor(likeCount * boostFactor))

    const eligibleUserIds = userIds.filter((userId) => userId !== tweet.userId)

    if (eligibleUserIds.length === 0 || likeCount === 0) {
      continue
    }

    const eligibleWeights = eligibleUserIds.map((userId) => Math.pow((activityMap.get(userId) || 1), 0.75))
    const selectedUserIds = pickWeightedUniqueItems(
      random,
      eligibleUserIds,
      eligibleWeights,
      likeCount
    )

    const baseTime = new Date(tweet.createdAt).getTime() + 5 * 60 * 1000
    let offset = 0
    for (const userId of selectedUserIds) {
      likes.push({
        userId,
        tweetId: tweet.tweetId,
        createdAt: new Date(baseTime + offset * 60 * 1000),
      })
      offset += 1
    }
  }

  return likes
}

async function insertUsers(users) {
  const statements = chunkArray(users, 20).map((group) => {
    const placeholders = group.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')
    const params = group.flatMap((user) => [
      user.userId,
      user.username,
      user.email,
      user.password,
      user.bgUrl,
      user.createdAt,
    ])

    return {
      sql: `INSERT IGNORE INTO Users (user_id, username, email, password, bg_url, created_at) VALUES ${placeholders}`,
      params,
    }
  })

  const avatarStatements = chunkArray(users, 20).map((group) => {
    const placeholders = group.map(() => '(?, ?)').join(', ')
    const params = group.flatMap((user) => [user.userId, '/icon.png'])

    return {
      sql: `INSERT IGNORE INTO Avatar (user_id, avatar_url) VALUES ${placeholders}`,
      params,
    }
  })

  const result = await executeTransaction([...statements, ...avatarStatements])
  if (!result.success) {
    throw new Error(String(result.error))
  }
}

async function insertTweets(tweets) {
  const statements = chunkArray(tweets, 50).map((group) => {
    const placeholders = group.map(() => '(?, ?, ?, ?, ?)').join(', ')
    const params = group.flatMap((tweet) => [
      tweet.tweetId,
      tweet.userId,
      null,
      tweet.content,
      tweet.createdAt,
    ])

    return {
      sql: `INSERT IGNORE INTO Tweets (tweet_id, user_id, parent_id, content, created_at) VALUES ${placeholders}`,
      params,
    }
  })

  const result = await executeTransaction(statements)
  if (!result.success) {
    throw new Error(String(result.error))
  }
}

async function insertTags() {
  const placeholders = tagNames.map(() => '(?)').join(', ')
  const result = await executeTransaction([
    {
      sql: `INSERT IGNORE INTO TAGS (name) VALUES ${placeholders}`,
      params: tagNames,
    },
  ])

  if (!result.success) {
    throw new Error(String(result.error))
  }

  const tagResult = await executeQuery('SELECT tag_id, name FROM TAGS')
  if (!tagResult.success) {
    throw new Error(String(tagResult.error))
  }

  const tagsByName = new Map()
  for (const row of tagResult.rows) {
    tagsByName.set(row.name, row.tag_id)
  }

  return tagsByName
}

async function insertTweetTags(tweetTags) {
  const statements = chunkArray(tweetTags, 100).map((group) => {
    const placeholders = group.map(() => '(?, ?)').join(', ')
    const params = group.flatMap((item) => [item.tweetId, item.tagId])

    return {
      sql: `INSERT IGNORE INTO TweetTags (tweet_id, tag_id) VALUES ${placeholders}`,
      params,
    }
  })

  if (statements.length === 0) {
    return
  }

  const result = await executeTransaction(statements)
  if (!result.success) {
    throw new Error(String(result.error))
  }
}

async function insertLikes(likes) {
  const statements = chunkArray(likes, 100).map((group) => {
    const placeholders = group.map(() => '(?, ?, ?)').join(', ')
    const params = group.flatMap((like) => [like.userId, like.tweetId, like.createdAt])

    return {
      sql: `INSERT IGNORE INTO Likes (user_id, tweet_id, created_at) VALUES ${placeholders}`,
      params,
    }
  })

  if (statements.length === 0) {
    return
  }

  const result = await executeTransaction(statements)
  if (!result.success) {
    throw new Error(String(result.error))
  }
}

async function seedRandomData() {
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('无法连接到数据库，请检查配置')
    process.exit(1)
  }

  const random = makeSeededRandom(getSeedNumber())
  const users = buildUsers(random)
  const tweets = buildTweets(random, users)
  const tagsByName = await insertTags()
  const tweetTags = buildTweetTags(random, tweets, tagsByName)
  const likes = buildLikes(random, tweets, users)

  console.log(`📝 即将插入 ${users.length} 个用户和 ${tweets.length} 条帖子...`)

  try {
    await insertUsers(users)
    await insertTweets(tweets)
    await insertTweetTags(tweetTags)
    await insertLikes(likes)
    console.log('✅ 随机测试数据插入成功')
    console.log(`👥 用户数: ${users.length}`)
    console.log(`📝 帖子数: ${tweets.length}`)
    console.log(`🏷️ 标签关联数: ${tweetTags.length}`)
    console.log(`❤️ 点赞数: ${likes.length}`)
    console.log('🔑 测试用户默认密码: 123456')
  } catch (error) {
    console.error('❌ 随机测试数据插入失败:', error)
    process.exit(1)
  }
}

seedRandomData()