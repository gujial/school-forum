# 校园论坛平台 SQL 编程报告

## 1. 概述

### 1.1 报告目的

本报告详细描述了“可圈可点”校园论坛平台的 SQL 编程实现，包括数据库环境搭建、数据库对象创建、数据操作、业务逻辑实现及触发器和存储过程的设计。

### 1.2 技术环境

* **数据库**: OceanBase (MySQL 兼容)
* **编程语言**: SQL + TypeScript
* **开发工具**: MySQL Workbench, VS Code
* **版本控制**: Git

---

## 2. 数据库环境搭建

### 2.1 数据库创建

```sql
CREATE DATABASE IF NOT EXISTS school_forum;
USE school_forum;
```

### 2.2 表空间创建（可选，OceanBase 支持）

```sql
-- 创建系统表空间
CREATE TABLESPACE system_tbs
DATAFILE 'system_tbs.dbf'
SIZE 100M
AUTOEXTEND ON NEXT 10M MAXSIZE 1G;

-- 创建用户表空间
CREATE TABLESPACE user_tbs
DATAFILE 'user_tbs.dbf'
SIZE 200M
AUTOEXTEND ON NEXT 20M MAXSIZE 2G;
```

### 2.3 用户创建与授权

```sql
CREATE USER 'forum_user' IDENTIFIED BY 'forum_pass';
GRANT ALL PRIVILEGES ON *.* TO 'forum_user';
FLUSH PRIVILEGES;
```

---

## 3. 数据库对象创建

### 3.1 用户与管理员表

```sql
CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bg_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Admins (
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

### 3.2 用户头像表

```sql
CREATE TABLE IF NOT EXISTS Avatar (
    user_id BIGINT PRIMARY KEY,
    avatar_url TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

### 3.3 帖子、评论、媒体

```sql
CREATE TABLE IF NOT EXISTS Tweets (
    tweet_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Comments (
    comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tweet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Media (
    media_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tweet_id BIGINT,
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id)
);
```

### 3.4 点赞与关注

```sql
CREATE TABLE IF NOT EXISTS Likes (
    like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    tweet_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
    UNIQUE KEY unique_user_tweet (user_id, tweet_id)
);

CREATE TABLE IF NOT EXISTS Follows (
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES Users(user_id),
    FOREIGN KEY (following_id) REFERENCES Users(user_id)
);
```

### 3.5 消息、举报、标签

```sql
CREATE TABLE IF NOT EXISTS Messages (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    tweet_id BIGINT,
    comment_id BIGINT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id),
    FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id)
);

CREATE TABLE IF NOT EXISTS Reports (
    report_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tweet_id BIGINT,
    comment_id BIGINT,
    user_id BIGINT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS TAGS (
    tag_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS TweetTags (
    tweet_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (tweet_id, tag_id),
    FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
    FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id)
);
```

---

## 4. 样本数据插入

```sql
-- 添加初始用户
INSERT INTO Users (user_id, username, email, password) VALUES
(1, 'admin', 'admin', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS');

INSERT INTO Admins (user_id) VALUES (1);

-- 插入示例帖子
INSERT INTO Tweets (user_id, content) VALUES
(1, '欢迎来到校园论坛平台！');
```

---

## 5. 触发器设计

### 5.1 防止关注自己

```sql
DELIMITER $$
CREATE TRIGGER before_follow_insert
BEFORE INSERT ON Follows
FOR EACH ROW
BEGIN
    IF NEW.follower_id = NEW.following_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '不能关注自己';
    END IF;
END$$
DELIMITER ;
```

### 5.2 删除帖子及相关数据

```sql
DELIMITER $$
CREATE TRIGGER before_tweet_delete
BEFORE DELETE ON Tweets
FOR EACH ROW
BEGIN
    DELETE FROM Comments WHERE tweet_id = OLD.tweet_id;
    DELETE FROM Media WHERE tweet_id = OLD.tweet_id;
    DELETE FROM Likes WHERE tweet_id = OLD.tweet_id;
    DELETE FROM Messages WHERE tweet_id = OLD.tweet_id;
    DELETE FROM TweetTags WHERE tweet_id = OLD.tweet_id;
    DELETE FROM Reports WHERE tweet_id = OLD.tweet_id;
END$$
DELIMITER ;
```

### 5.3 删除评论及相关消息

```sql
DELIMITER $$
CREATE TRIGGER before_comment_delete
BEFORE DELETE ON Comments
FOR EACH ROW
BEGIN
    DELETE FROM Messages WHERE comment_id = OLD.comment_id;
    DELETE FROM Reports WHERE comment_id = OLD.comment_id;
END$$
DELIMITER ;
```

### 5.4 删除用户及相关数据

```sql
DELIMITER $$
CREATE TRIGGER before_user_delete
BEFORE DELETE ON Users
FOR EACH ROW
BEGIN
    DELETE FROM Avatar WHERE user_id = OLD.user_id;
    DELETE FROM Tweets WHERE user_id = OLD.user_id;
    DELETE FROM Comments WHERE user_id = OLD.user_id;
    DELETE FROM Likes WHERE user_id = OLD.user_id;
    DELETE FROM Messages WHERE sender_id = OLD.user_id OR receiver_id = OLD.user_id;
    DELETE FROM Follows WHERE follower_id = OLD.user_id OR following_id = OLD.user_id;
    DELETE FROM Admins WHERE user_id = OLD.user_id;
    DELETE FROM Reports WHERE user_id = OLD.user_id;
END$$
DELIMITER ;
```

---

## 6. 存储过程设计

### 6.1 添加帖子标签

```sql
DELIMITER $$
CREATE PROCEDURE add_tweet_tags(
    IN p_tweet_id BIGINT,
    IN p_tags_text VARCHAR(255) CHARACTER SET utf8mb4
)
BEGIN
    DECLARE v_tags_text VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT p_tags_text;
    DECLARE v_tag_name VARCHAR(50) CHARACTER SET utf8mb4;
    DECLARE v_tag_id BIGINT;

    WHILE LENGTH(v_tags_text) > 0 DO
        SET v_tag_name = TRIM(SUBSTRING_INDEX(v_tags_text, ',', 1));
        SET v_tag_id = NULL;

        IF v_tag_name <> '' THEN
            SELECT tag_id INTO v_tag_id FROM TAGS WHERE name = v_tag_name LIMIT 1;
            IF v_tag_id IS NULL THEN
                INSERT INTO TAGS (name) VALUES (v_tag_name);
                SET v_tag_id = LAST_INSERT_ID();
            END IF;
            INSERT IGNORE INTO TweetTags (tweet_id, tag_id) VALUES (p_tweet_id, v_tag_id);
        END IF;

        IF v_tags_text LIKE '%,%' THEN
            SET v_tags_text = SUBSTRING(v_tags_text, LENGTH(SUBSTRING_INDEX(v_tags_text, ',', 1)) + 2);
        ELSE
            SET v_tags_text = '';
        END IF;
    END WHILE;
END$$
DELIMITER ;
```

### 6.2 根据标签查询帖子（升序/降序）

```sql
DELIMITER $$

CREATE PROCEDURE get_tweets_by_tags_desc(
    IN p_tags_text VARCHAR(255) CHARACTER SET utf8mb4,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    DECLARE v_tag_count INT DEFAULT 0;
    SET v_tag_count = LENGTH(p_tags_text) - LENGTH(REPLACE(p_tags_text, ',', '')) + 1;

    SELECT t.*, GROUP_CONCAT(tag_all.name ORDER BY tag_all.name SEPARATOR ',') AS tags
    FROM Tweets t
    JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
    JOIN TAGS tag_all ON tt.tag_id = tag_all.tag_id
    WHERE t.tweet_id IN (
        SELECT t2.tweet_id
        FROM Tweets t2
        JOIN TweetTags tt2 ON t2.tweet_id = tt2.tweet_id
        JOIN TAGS tag2 ON tt2.tag_id = tag2.tag_id
        WHERE FIND_IN_SET(tag2.name, p_tags_text)
        GROUP BY t2.tweet_id
        HAVING COUNT(DISTINCT tag2.name) = v_tag_count
        ORDER BY t2.created_at
        LIMIT p_limit OFFSET p_offset
    )
    GROUP BY t.tweet_id
    ORDER BY t.created_at DESC;
END$$

CREATE PROCEDURE get_tweets_by_tags_asc(
    IN p_tags_text VARCHAR(255) CHARACTER SET utf8mb4,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    DECLARE v_tag_count INT DEFAULT 0;
    SET v_tag_count = LENGTH(p_tags_text) - LENGTH(REPLACE(p_tags_text, ',', '')) + 1;

    SELECT t.*, GROUP_CONCAT(tag_all.name ORDER BY tag_all.name SEPARATOR ',') AS tags
    FROM Tweets t
    JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
    JOIN TAGS tag_all ON tt.tag_id = tag_all.tag_id
    WHERE t.tweet_id IN (
        SELECT t2.tweet_id
        FROM Tweets t2
        JOIN TweetTags tt2 ON t2.tweet_id = tt2.tweet_id
        JOIN TAGS tag2 ON tt2.tag_id = tag2.tag_id
        WHERE FIND_IN_SET(tag2.name, p_tags_text)
        GROUP BY t2.tweet_id
        HAVING COUNT(DISTINCT tag2.name) = v_tag_count
        ORDER BY t2.created_at
        LIMIT p_limit OFFSET p_offset
    )
    GROUP BY t.tweet_id
    ORDER BY t.created_at;
END$$

DELIMITER ;
```

---

## 7. 查询统计语句

### 7.1 分页查询统计

#### 7.1.1 推文分页统计

```sql
-- 获取推文总数用于分页计算
SELECT COUNT(*) AS total FROM Tweets;

-- 分页获取推文列表（按时间倒序）
SELECT 
    t.*,
    GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
FROM Tweets t
LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
GROUP BY t.tweet_id
ORDER BY t.created_at DESC
LIMIT ? OFFSET ?;
```

#### 7.1.2 评论分页统计

```sql
-- 获取某推文下的顶级评论总数
SELECT COUNT(*) AS total 
FROM Comments 
WHERE tweet_id = ? AND parent_id IS NULL;

-- 分页获取顶级评论列表
SELECT * 
FROM Comments 
WHERE tweet_id = ? AND parent_id IS NULL 
ORDER BY created_at 
LIMIT ? OFFSET ?;
```

#### 7.1.3 关注关系分页统计

```sql
-- 获取粉丝总数
SELECT COUNT(follower_id) AS total 
FROM Follows 
WHERE following_id = ?;

-- 分页获取粉丝列表
SELECT follower_id 
FROM Follows 
WHERE following_id = ? 
LIMIT ? OFFSET ?;

-- 获取关注总数
SELECT COUNT(following_id) AS total 
FROM Follows 
WHERE follower_id = ?;

-- 分页获取关注列表
SELECT following_id 
FROM Follows 
WHERE follower_id = ? 
LIMIT ? OFFSET ?;
```

### 7.2 搜索与过滤统计

#### 7.2.1 关键词搜索统计

```sql
-- 按关键词统计推文总数
SELECT COUNT(*) AS total 
FROM Tweets 
WHERE content LIKE ?;

-- 关键词搜索推文（支持时间排序）
SELECT 
    t.tweet_id, 
    t.user_id, 
    t.content, 
    t.created_at, 
    GROUP_CONCAT(tag.name ORDER BY tag.name SEPARATOR ',') AS tags
FROM Tweets t
LEFT JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
LEFT JOIN TAGS tag ON tt.tag_id = tag.tag_id
WHERE content LIKE ?
GROUP BY t.tweet_id
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
```

#### 7.2.2 标签过滤统计

```sql
-- 统计包含指定标签组合的推文总数
SELECT COUNT(*) AS total FROM (
    SELECT t.tweet_id
    FROM Tweets t
    JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
    JOIN TAGS tag ON tt.tag_id = tag.tag_id
    WHERE FIND_IN_SET(tag.name, ?)
    GROUP BY t.tweet_id
    HAVING COUNT(DISTINCT tag.name) = ?
) sub;

-- 调用存储过程获取标签过滤结果
CALL get_tweets_by_tags_desc(?, ?, ?);
CALL get_tweets_by_tags_asc(?, ?, ?);
```

### 7.3 计数统计查询

#### 7.3.1 点赞统计

```sql
-- 获取推文点赞数
SELECT COUNT(*) AS count 
FROM Likes 
WHERE tweet_id = ?;

-- 获取用户点赞的推文数
SELECT COUNT(*) AS count 
FROM Likes 
WHERE user_id = ?;
```

#### 7.3.2 评论统计

```sql
-- 获取推文评论数
SELECT COUNT(*) AS count 
FROM Comments 
WHERE tweet_id = ?;

-- 获取推文回复数（子评论）
SELECT COUNT(*) AS count 
FROM Comments 
WHERE tweet_id = ? AND parent_id IS NOT NULL;
```

#### 7.3.3 分享统计

```sql
-- 获取推文分享数
SELECT COUNT(*) AS count 
FROM Shares 
WHERE tweet_id = ?;
```

### 7.4 管理统计查询

#### 7.4.1 举报统计

```sql
-- 获取举报总数
SELECT COUNT(*) AS total FROM Reports;

-- 分页获取举报列表
SELECT * 
FROM Reports
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- 按类型统计举报
SELECT 
    CASE 
        WHEN tweet_id IS NOT NULL THEN 'tweet'
        WHEN comment_id IS NOT NULL THEN 'comment'
        ELSE 'other'
    END AS report_type,
    COUNT(*) AS count
FROM Reports
GROUP BY report_type;
```

#### 7.4.2 用户统计

```sql
-- 获取用户总数
SELECT COUNT(*) AS total FROM Users;

-- 获取管理员数量
SELECT COUNT(*) AS total FROM Admins;

-- 统计用户活跃度（发帖数）
SELECT 
    u.user_id,
    u.username,
    COUNT(t.tweet_id) AS tweet_count
FROM Users u
LEFT JOIN Tweets t ON u.user_id = t.user_id
GROUP BY u.user_id, u.username
ORDER BY tweet_count DESC;
```

### 7.5 高级统计查询

#### 7.5.1 热门标签统计

```sql
-- 统计标签使用频率
SELECT 
    tag.name,
    COUNT(tt.tweet_id) AS usage_count
FROM TAGS tag
JOIN TweetTags tt ON tag.tag_id = tt.tag_id
GROUP BY tag.tag_id, tag.name
ORDER BY usage_count DESC
LIMIT 10;
```

#### 7.5.2 用户互动统计

```sql
-- 统计用户互动情况
SELECT 
    u.user_id,
    u.username,
    COUNT(DISTINCT t.tweet_id) AS tweets,
    COUNT(DISTINCT c.comment_id) AS comments,
    COUNT(DISTINCT l.tweet_id) AS likes_given,
    COUNT(DISTINCT f.following_id) AS following,
    (SELECT COUNT(*) FROM Follows WHERE following_id = u.user_id) AS followers
FROM Users u
LEFT JOIN Tweets t ON u.user_id = t.user_id
LEFT JOIN Comments c ON u.user_id = c.user_id
LEFT JOIN Likes l ON u.user_id = l.user_id
LEFT JOIN Follows f ON u.user_id = f.follower_id
GROUP BY u.user_id, u.username;
```

#### 7.5.3 时间趋势统计

```sql
-- 按日期统计发帖数量
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS tweet_count
FROM Tweets
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date;

-- 按小时统计活跃度
SELECT 
    HOUR(created_at) AS hour,
    COUNT(*) AS activity_count
FROM (
    SELECT created_at FROM Tweets
    UNION ALL
    SELECT created_at FROM Comments
    UNION ALL
    SELECT created_at FROM Likes
) activity
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(created_at)
ORDER BY hour;
```

---

## 8. 总结

### 8.1 实现成果

* 完整的数据库环境搭建
* 规范化表结构设计，涵盖用户、帖子、评论、媒体、标签、消息、点赞、关注、管理员和举报
* 支持数据完整性和级联删除
* 存储过程和触发器实现复杂业务逻辑（如标签管理、帖子查询、用户删除级联）

### 8.2 技术特点

* 遵循数据库设计规范，表结构清晰
* 支持高并发访问和数据完整性
* 触发器和存储过程实现业务逻辑自动化
* 与 OceanBase/MySQL 完全兼容
