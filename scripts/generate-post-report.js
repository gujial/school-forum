import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { executeQuery, testConnection } from '../server/config/database.runtime.js'

const DEFAULT_OUTPUT = process.env.REPORT_OUTPUT || 'docs/论坛帖子数据报告.md'

function parseArgs(argv) {
  const options = {
    output: DEFAULT_OUTPUT,
    stdout: false,
  }

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--stdout') {
      options.stdout = true
      continue
    }

    if (arg === '--out' || arg === '-o') {
      options.output = argv[index + 1] || options.output
      index += 1
      continue
    }

    if (arg.startsWith('--out=')) {
      options.output = arg.slice('--out='.length)
    }
  }

  return options
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function stripContent(value, length = 48) {
  if (!value) return '-'
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text.length > length ? `${text.slice(0, length)}...` : text
}

function buildEchartsBlock(option) {
  return ['```echarts', JSON.stringify(option, null, 2), '```'].join('\n')
}

function buildBarChart(title, categories, values, color = '#5470c6') {
  return buildEchartsBlock({
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { interval: 0, rotate: categories.length > 6 ? 30 : 0 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: { color },
      },
    ],
  })
}

function buildLineChart(title, categories, values, color = '#91cc75') {
  return buildEchartsBlock({
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: values,
        itemStyle: { color },
        lineStyle: { color },
        areaStyle: { opacity: 0.2 },
      },
    ],
  })
}

function buildPieChart(title, rows) {
  return buildEchartsBlock({
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        type: 'pie',
        radius: '65%',
        data: rows.map((row) => ({ name: row.name, value: Number(row.value) })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
  })
}

async function fetchSingleValue(sql, params = []) {
  const result = await executeQuery(sql, params)
  if (!result.success) {
    throw new Error(String(result.error))
  }

  return result.rows?.[0] ?? {}
}

async function fetchReportData() {
  const [summary, monthlyTweets, topUsers, topTags, topPosts, likeBuckets] = await Promise.all([
    Promise.all([
      fetchSingleValue('SELECT COUNT(*) AS count FROM Tweets'),
      fetchSingleValue('SELECT COUNT(DISTINCT user_id) AS count FROM Tweets'),
      fetchSingleValue('SELECT COUNT(*) AS count FROM Likes'),
      fetchSingleValue('SELECT COUNT(*) AS count FROM TAGS'),
      fetchSingleValue('SELECT COUNT(*) AS count FROM TweetTags'),
      fetchSingleValue('SELECT COUNT(*) AS count FROM Comments'),
      fetchSingleValue('SELECT COUNT(*) AS count FROM Tweets WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'),
      fetchSingleValue('SELECT MIN(created_at) AS minCreatedAt, MAX(created_at) AS maxCreatedAt FROM Tweets'),
    ]),
    executeQuery(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM Tweets
       GROUP BY month
       ORDER BY month`
    ),
    executeQuery(
      `SELECT u.user_id, u.username, COUNT(t.tweet_id) AS count
       FROM Users u
       JOIN Tweets t ON t.user_id = u.user_id
       GROUP BY u.user_id, u.username
       ORDER BY count DESC, u.user_id ASC
       LIMIT 10`
    ),
    executeQuery(
      `SELECT tg.name AS name, COUNT(*) AS value
       FROM TweetTags tt
       JOIN TAGS tg ON tg.tag_id = tt.tag_id
       GROUP BY tg.tag_id, tg.name
       ORDER BY value DESC, tg.name ASC
       LIMIT 10`
    ),
    executeQuery(
      `SELECT t.tweet_id,
              t.user_id,
              u.username,
              t.content,
              t.created_at,
              COALESCE(likes.like_count, 0) AS like_count,
              COALESCE(tags.tag_count, 0) AS tag_count
       FROM Tweets t
       JOIN Users u ON u.user_id = t.user_id
       LEFT JOIN (
         SELECT tweet_id, COUNT(*) AS like_count
         FROM Likes
         GROUP BY tweet_id
       ) likes ON likes.tweet_id = t.tweet_id
       LEFT JOIN (
         SELECT tweet_id, COUNT(*) AS tag_count
         FROM TweetTags
         GROUP BY tweet_id
       ) tags ON tags.tweet_id = t.tweet_id
       ORDER BY like_count DESC, t.created_at DESC
       LIMIT 10`
    ),
    executeQuery(
      `SELECT bucket, COUNT(*) AS count FROM (
         SELECT CASE
           WHEN like_count = 0 THEN '0'
           WHEN like_count BETWEEN 1 AND 3 THEN '1-3'
           WHEN like_count BETWEEN 4 AND 10 THEN '4-10'
           ELSE '11+'
         END AS bucket
         FROM (
           SELECT t.tweet_id, COUNT(l.like_id) AS like_count
           FROM Tweets t
           LEFT JOIN Likes l ON l.tweet_id = t.tweet_id
           GROUP BY t.tweet_id
         ) x
       ) buckets
       GROUP BY bucket
       ORDER BY FIELD(bucket, '0', '1-3', '4-10', '11+')`
    ),
  ])

  const [
    totalTweets,
    activeAuthors,
    totalLikes,
    totalTags,
    totalTweetTags,
    totalComments,
    tweetsLast30Days,
    tweetDateRange,
  ] = summary

  return {
    totalTweets: Number(totalTweets.count || 0),
    activeAuthors: Number(activeAuthors.count || 0),
    totalLikes: Number(totalLikes.count || 0),
    totalTags: Number(totalTags.count || 0),
    totalTweetTags: Number(totalTweetTags.count || 0),
    totalComments: Number(totalComments.count || 0),
    tweetsLast30Days: Number(tweetsLast30Days.count || 0),
    tweetDateRange,
    monthlyTweets: monthlyTweets.rows || [],
    topUsers: topUsers.rows || [],
    topTags: topTags.rows || [],
    topPosts: topPosts.rows || [],
    likeBuckets: likeBuckets.rows || [],
  }
}

function buildMarkdown(data) {
  const monthlyLabels = data.monthlyTweets.map((row) => row.month)
  const monthlyCounts = data.monthlyTweets.map((row) => Number(row.count))
  const userLabels = data.topUsers.map((row) => row.username)
  const userCounts = data.topUsers.map((row) => Number(row.count))

  const createdFrom = formatDateTime(data.tweetDateRange?.minCreatedAt)
  const createdTo = formatDateTime(data.tweetDateRange?.maxCreatedAt)

  const summaryTable = [
    '| 指标 | 数值 |',
    '| --- | ---: |',
    `| 帖子总数 | ${formatNumber(data.totalTweets)} |`,
    `| 活跃作者数 | ${formatNumber(data.activeAuthors)} |`,
    `| 点赞总数 | ${formatNumber(data.totalLikes)} |`,
    `| 标签总数 | ${formatNumber(data.totalTags)} |`,
    `| 帖子-标签关联数 | ${formatNumber(data.totalTweetTags)} |`,
    `| 评论总数 | ${formatNumber(data.totalComments)} |`,
    `| 近 30 天发帖数 | ${formatNumber(data.tweetsLast30Days)} |`,
    `| 数据时间范围 | ${createdFrom} ~ ${createdTo} |`,
    `| 平均每帖点赞数 | ${(data.totalTweets > 0 ? data.totalLikes / data.totalTweets : 0).toFixed(2)} |`,
    `| 平均每帖标签数 | ${(data.totalTweets > 0 ? data.totalTweetTags / data.totalTweets : 0).toFixed(2)} |`,
  ].join('\n')

  const topPostsTable = [
    '| 帖子ID | 作者 | 内容摘要 | 点赞数 | 标签数 | 创建时间 |',
    '| --- | --- | --- | ---: | ---: | --- |',
    ...data.topPosts.map(
      (row) =>
        `| ${row.tweet_id} | ${row.username} | ${stripContent(row.content, 60)} | ${formatNumber(row.like_count)} | ${formatNumber(row.tag_count)} | ${formatDateTime(row.created_at)} |`
    ),
  ].join('\n')

  const markdown = [
    '# 论坛帖子数据报告',
    '',
    `> 生成时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 1. 报告概述',
    '',
    '本报告基于当前论坛数据库中的帖子、点赞、标签与作者数据自动生成，适合直接用 Vditor 预览。',
    '',
    '## 2. 核心指标',
    '',
    summaryTable,
    '',
    '## 3. 发帖趋势',
    '',
    buildLineChart('帖子月度发文趋势', monthlyLabels, monthlyCounts, '#91cc75'),
    '',
    '## 4. 活跃作者',
    '',
    buildBarChart('发帖数 Top 10 作者', userLabels, userCounts, '#5470c6'),
    '',
    '## 5. 热门标签',
    '',
    buildPieChart('标签使用 Top 10', data.topTags),
    '',
    '## 6. 点赞分布',
    '',
    buildPieChart('帖子点赞分布', data.likeBuckets.map((row) => ({ name: row.bucket, value: row.count }))),
    '',
    '## 7. 热门帖子',
    '',
    topPostsTable,
    '',
    '## 8. 数据解读',
    '',
    `- 当前论坛共有 ${formatNumber(data.totalTweets)} 条帖子，活跃作者 ${formatNumber(data.activeAuthors)} 人。`,
    `- 近 30 天新增帖子 ${formatNumber(data.tweetsLast30Days)} 条，说明当前内容更新活跃度较高。`,
    `- 平均每帖点赞数为 ${(data.totalTweets > 0 ? data.totalLikes / data.totalTweets : 0).toFixed(2)}，标签关联数为 ${(data.totalTweets > 0 ? data.totalTweetTags / data.totalTweets : 0).toFixed(2)}。`,
    `- 点赞集中度较高的帖子通常也是标签更聚焦、话题更明确的内容。`,
    '',
  ].join('\n')

  return markdown
}

async function main() {
  const options = parseArgs(process.argv)

  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('无法连接到数据库，请检查配置')
    process.exit(1)
  }

  try {
    const data = await fetchReportData()
    const markdown = buildMarkdown(data)

    if (options.stdout) {
      process.stdout.write(markdown)
      return
    }

    const outputPath = path.resolve(process.cwd(), options.output)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, markdown, 'utf8')

    console.log(`✅ 帖子数据报告已生成: ${outputPath}`)
  } catch (error) {
    console.error('❌ 生成帖子数据报告失败:', error)
    process.exit(1)
  }
}

main()