/*
  测试数据种子脚本
  适合在基础建表完成后执行，支持重复执行。
*/

INSERT IGNORE INTO Users (user_id, username, email, password, bg_url, created_at) VALUES
(2, 'test_alice', 'test_alice@example.com', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS', NULL, '2026-05-17 09:00:00'),
(3, 'test_bob', 'test_bob@example.com', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS', NULL, '2026-05-17 09:01:00'),
(4, 'test_cathy', 'test_cathy@example.com', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS', NULL, '2026-05-17 09:02:00'),
(5, 'test_david', 'test_david@example.com', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS', NULL, '2026-05-17 09:03:00'),
(6, 'test_eva', 'test_eva@example.com', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS', NULL, '2026-05-17 09:04:00');

INSERT IGNORE INTO Avatar (user_id, avatar_url) VALUES
(2, '/icon.png'),
(3, '/icon.png'),
(4, '/icon.png'),
(5, '/icon.png'),
(6, '/icon.png');

INSERT IGNORE INTO Tweets (tweet_id, user_id, parent_id, content, created_at) VALUES
(1001, 2, NULL, '测试帖子 1：这是一个用于验证首页列表展示的样例内容。', '2026-05-17 09:10:00'),
(1002, 3, NULL, '测试帖子 2：可以用来检查分页、排序和详情页跳转。', '2026-05-17 09:12:00'),
(1003, 4, NULL, '测试帖子 3：这条内容比较长一点，方便测试卡片换行、摘要和富文本渲染。', '2026-05-17 09:14:00'),
(1004, 5, NULL, '测试帖子 4：用于验证标签筛选、搜索和作者信息展示。', '2026-05-17 09:16:00'),
(1005, 6, NULL, '测试帖子 5：用于检查图片、附件或媒体占位区域的表现。', '2026-05-17 09:18:00'),
(1006, 2, NULL, '测试帖子 6：第二轮数据，方便看滚动加载和时间线顺序。', '2026-05-17 09:20:00'),
(1007, 3, NULL, '测试帖子 7：如果需要评论测试，可以继续在这条下面补评论。', '2026-05-17 09:22:00'),
(1008, 4, NULL, '测试帖子 8：用于验证删除、编辑和置顶等后台操作。', '2026-05-17 09:24:00');