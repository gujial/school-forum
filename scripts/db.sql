CREATE DATABASE IF NOT EXISTS school_forum;
USE school_forum;

CREATE TABLE IF NOT EXISTS Users (
                       user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       bg_url TEXT,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Avatar (
                              user_id BIGINT PRIMARY KEY,
                              avatar_url TEXT,
                              FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

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

CREATE TABLE IF NOT EXISTS Likes (
                       like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       user_id BIGINT NOT NULL,
                       tweet_id BIGINT NOT NULL,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES Users(user_id),
                       FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
                       UNIQUE KEY unique_user_tweet (user_id, tweet_id)
);

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

DELIMITER $$

CREATE TRIGGER before_tweet_tags_delete
AFTER DELETE ON TweetTags
FOR EACH ROW
BEGIN
    DECLARE tag_count INT;
    SELECT COUNT(*) INTO tag_count 
    FROM TweetTags 
    WHERE tag_id = OLD.tag_id;

    IF tag_count = 0 THEN
        DELETE FROM TAGS WHERE tag_id = OLD.tag_id;
    END IF;
END$$

DELIMITER ;

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
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_comment_delete
BEFORE DELETE ON Comments
FOR EACH ROW
BEGIN
    DELETE FROM Messages WHERE comment_id = OLD.comment_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE add_tweet_tag(
    IN p_tweet_id BIGINT,
    IN p_tag_name VARCHAR(50)
)
BEGIN
    DECLARE v_tag_id BIGINT;

    -- 检查标签是否存在
    SELECT tag_id INTO v_tag_id
    FROM TAGS
    WHERE name = p_tag_name
    LIMIT 1;

    -- 如果不存在，则创建
    IF v_tag_id IS NULL THEN
        INSERT INTO TAGS (name) VALUES (p_tag_name);
        SET v_tag_id = LAST_INSERT_ID();
    END IF;

    -- 插入 TweetTags 关联
    INSERT IGNORE INTO TweetTags (tweet_id, tag_id)
    VALUES (p_tweet_id, v_tag_id);
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_tweets_by_tags_desc(
    IN p_tags_text TEXT
)
BEGIN
    DECLARE v_tag_name VARCHAR(50);
    DECLARE v_tag_count INT DEFAULT 0;

    -- 临时表保存匹配到的 tag_id
    CREATE TEMPORARY TABLE tmp_tag_ids (tag_id BIGINT PRIMARY KEY);

    -- 解析标签字符串
    WHILE LENGTH(p_tags_text) > 0 DO
        SET v_tag_name = TRIM(SUBSTRING_INDEX(p_tags_text, ',', 1));

        IF v_tag_name <> '' THEN
            INSERT IGNORE INTO tmp_tag_ids (tag_id)
            SELECT tag_id FROM TAGS WHERE name = v_tag_name;
            SET v_tag_count = v_tag_count + 1;
        END IF;

        IF p_tags_text LIKE '%,%' THEN
            SET p_tags_text = SUBSTRING(p_tags_text, LENGTH(SUBSTRING_INDEX(p_tags_text, ',', 1)) + 2);
        ELSE
            SET p_tags_text = '';
        END IF;
    END WHILE;

    -- 查询必须包含所有标签的推文
    SELECT t.*
    FROM Tweets t
    JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
    JOIN tmp_tag_ids ti ON tt.tag_id = ti.tag_id
    GROUP BY t.tweet_id
    HAVING COUNT(DISTINCT tt.tag_id) = v_tag_count
    ORDER BY t.created_at DESC;

    DROP TEMPORARY TABLE tmp_tag_ids;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_tweets_by_tags_asc(
    IN p_tags_text TEXT
)
BEGIN
    DECLARE v_tag_name VARCHAR(50);
    DECLARE v_tag_count INT DEFAULT 0;

    -- 临时表保存匹配到的 tag_id
    CREATE TEMPORARY TABLE tmp_tag_ids (tag_id BIGINT PRIMARY KEY);

    -- 解析标签字符串
    WHILE LENGTH(p_tags_text) > 0 DO
        SET v_tag_name = TRIM(SUBSTRING_INDEX(p_tags_text, ',', 1));

        IF v_tag_name <> '' THEN
            INSERT IGNORE INTO tmp_tag_ids (tag_id)
            SELECT tag_id FROM TAGS WHERE name = v_tag_name;
            SET v_tag_count = v_tag_count + 1;
        END IF;

        IF p_tags_text LIKE '%,%' THEN
            SET p_tags_text = SUBSTRING(p_tags_text, LENGTH(SUBSTRING_INDEX(p_tags_text, ',', 1)) + 2);
        ELSE
            SET p_tags_text = '';
        END IF;
    END WHILE;

    -- 查询必须包含所有标签的推文
    SELECT t.*
    FROM Tweets t
    JOIN TweetTags tt ON t.tweet_id = tt.tweet_id
    JOIN tmp_tag_ids ti ON tt.tag_id = ti.tag_id
    GROUP BY t.tweet_id
    HAVING COUNT(DISTINCT tt.tag_id) = v_tag_count
    ORDER BY t.created_at;

    DROP TEMPORARY TABLE tmp_tag_ids;
END$$

DELIMITER ;

/*Oceanbase创建用户*/
CREATE USER 'forum_user' IDENTIFIED BY 'forum_pass';
GRANT ALL PRIVILEGES ON *.* TO 'forum_user';
FLUSH PRIVILEGES;
/**/

/*添加初始用户*/
INSERT INTO Users (username, email, password) VALUES
('admin', 'admin', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS');