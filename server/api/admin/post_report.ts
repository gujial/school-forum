import { defineEventHandler } from 'h3';
import { useDatabase } from '../../util/database';
import adminAuthMiddleware from '../../util/adminAuth';

interface ChartRow {
    name?: string;
    value?: number | string;
    [key: string]: any;
}

function formatNumber(value: number | string | undefined) {
    return Number(value || 0).toLocaleString('zh-CN');
}

function formatDateTime(value: string | undefined) {
    if (!value) return '-';
    return new Date(value).toLocaleString('zh-CN');
}

function stripContent(value: string | undefined, length = 48) {
    if (!value) return '-';
    const text = String(value).replace(/\s+/g, ' ').trim();
    return text.length > length ? `${text.slice(0, length)}...` : text;
}

function buildEchartsBlock(option: Record<string, any>) {
    return ['```echarts', JSON.stringify(option, null, 2), '```'].join('\n');
}

function buildBarChart(title: string, categories: string[], values: number[], color = '#5470c6') {
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
    });
}

function buildLineChart(title: string, categories: string[], values: number[], color = '#91cc75') {
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
    });
}

function buildPieChart(title: string, rows: ChartRow[]) {
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
    });
}

export default defineEventHandler(async (event) => {
    await adminAuthMiddleware(event);
    const db = useDatabase();

    try {
        const [
            totalTweets,
            activeAuthors,
            totalLikes,
            totalTags,
            totalTweetTags,
            totalComments,
            tweetsLast30Days,
            tweetDateRange,
            monthlyTweets,
            topUsers,
            topTags,
            topPosts,
            likeBuckets,
        ] = await Promise.all([
            db.sql`SELECT COUNT(*) AS count FROM Tweets`,
            db.sql`SELECT COUNT(DISTINCT user_id) AS count FROM Tweets`,
            db.sql`SELECT COUNT(*) AS count FROM Likes`,
            db.sql`SELECT COUNT(*) AS count FROM TAGS`,
            db.sql`SELECT COUNT(*) AS count FROM TweetTags`,
            db.sql`SELECT COUNT(*) AS count FROM Comments`,
            db.sql`SELECT COUNT(*) AS count FROM Tweets WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            db.sql`SELECT MIN(created_at) AS minCreatedAt, MAX(created_at) AS maxCreatedAt FROM Tweets`,
            db.sql`SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count FROM Tweets GROUP BY month ORDER BY month`,
            db.sql`SELECT u.user_id, u.username, COUNT(t.tweet_id) AS count FROM Users u JOIN Tweets t ON t.user_id = u.user_id GROUP BY u.user_id, u.username ORDER BY count DESC, u.user_id ASC LIMIT 10`,
            db.sql`SELECT tg.name AS name, COUNT(*) AS value FROM TweetTags tt JOIN TAGS tg ON tg.tag_id = tt.tag_id GROUP BY tg.tag_id, tg.name ORDER BY value DESC, tg.name ASC LIMIT 10`,
            db.sql`SELECT t.tweet_id, t.user_id, u.username, t.content, t.created_at, COALESCE(likes.like_count, 0) AS like_count, COALESCE(tags.tag_count, 0) AS tag_count FROM Tweets t JOIN Users u ON u.user_id = t.user_id LEFT JOIN (SELECT tweet_id, COUNT(*) AS like_count FROM Likes GROUP BY tweet_id) likes ON likes.tweet_id = t.tweet_id LEFT JOIN (SELECT tweet_id, COUNT(*) AS tag_count FROM TweetTags GROUP BY tweet_id) tags ON tags.tweet_id = t.tweet_id ORDER BY like_count DESC, t.created_at DESC LIMIT 10`,
            db.sql`SELECT bucket, COUNT(*) AS count FROM (SELECT CASE WHEN like_count = 0 THEN '0' WHEN like_count BETWEEN 1 AND 3 THEN '1-3' WHEN like_count BETWEEN 4 AND 10 THEN '4-10' ELSE '11+' END AS bucket FROM (SELECT t.tweet_id, COUNT(l.like_id) AS like_count FROM Tweets t LEFT JOIN Likes l ON l.tweet_id = t.tweet_id GROUP BY t.tweet_id) x) buckets GROUP BY bucket ORDER BY FIELD(bucket, '0', '1-3', '4-10', '11+')`,
        ]);

        const totalTweetsValue = Number(totalTweets.rows[0]?.count || 0);
        const totalLikesValue = Number(totalLikes.rows[0]?.count || 0);
        const totalTweetTagsValue = Number(totalTweetTags.rows[0]?.count || 0);
        const createdFrom = formatDateTime(tweetDateRange.rows[0]?.minCreatedAt);
        const createdTo = formatDateTime(tweetDateRange.rows[0]?.maxCreatedAt);

        const monthlyLabels = monthlyTweets.rows.map((row: any) => row.month);
        const monthlyCounts = monthlyTweets.rows.map((row: any) => Number(row.count));
        const userLabels = topUsers.rows.map((row: any) => row.username);
        const userCounts = topUsers.rows.map((row: any) => Number(row.count));

        const summaryTable = [
            '| 指标 | 数值 |',
            '| --- | ---: |',
            `| 帖子总数 | ${formatNumber(totalTweets.rows[0]?.count)} |`,
            `| 活跃作者数 | ${formatNumber(activeAuthors.rows[0]?.count)} |`,
            `| 点赞总数 | ${formatNumber(totalLikes.rows[0]?.count)} |`,
            `| 标签总数 | ${formatNumber(totalTags.rows[0]?.count)} |`,
            `| 帖子-标签关联数 | ${formatNumber(totalTweetTags.rows[0]?.count)} |`,
            `| 评论总数 | ${formatNumber(totalComments.rows[0]?.count)} |`,
            `| 近 30 天发帖数 | ${formatNumber(tweetsLast30Days.rows[0]?.count)} |`,
            `| 数据时间范围 | ${createdFrom} ~ ${createdTo} |`,
            `| 平均每帖点赞数 | ${(totalTweetsValue > 0 ? totalLikesValue / totalTweetsValue : 0).toFixed(2)} |`,
            `| 平均每帖标签数 | ${(totalTweetsValue > 0 ? totalTweetTagsValue / totalTweetsValue : 0).toFixed(2)} |`,
        ].join('\n');

        const topPostsTable = [
            '| 帖子ID | 作者 | 内容摘要 | 点赞数 | 标签数 | 创建时间 |',
            '| --- | --- | --- | ---: | ---: | --- |',
            ...topPosts.rows.map(
                (row: any) =>
                    `| ${row.tweet_id} | ${row.username} | ${stripContent(row.content, 60)} | ${formatNumber(row.like_count)} | ${formatNumber(row.tag_count)} | ${formatDateTime(row.created_at)} |`,
            ),
        ].join('\n');

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
            buildPieChart('标签使用 Top 10', topTags.rows as ChartRow[]),
            '',
            '## 6. 点赞分布',
            '',
            buildPieChart(
                '帖子点赞分布',
                likeBuckets.rows.map((row: any) => ({ name: row.bucket, value: row.count })),
            ),
            '',
            '## 7. 热门帖子',
            '',
            topPostsTable,
            '',
        ].join('\n');

        return {
            success: true,
            data: {
                markdown,
                generatedAt: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Generate post report error:', error);
        return {
            success: false,
            message: '生成报告失败',
        };
    }
});
