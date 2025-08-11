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

drop trigger if exists before_tweet_tags_delete;
drop trigger if exists before_tweet_delete;
drop trigger if exists before_comment_delete;
drop procedure if exists add_tweet_tags;
drop procedure if exists get_tweets_by_tags_desc;
drop procedure if exists get_tweets_by_tags_asc;

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

DELIMITER $$

CREATE PROCEDURE get_tweets_by_tags_desc(
    IN p_tags_text VARCHAR(255) CHARACTER SET utf8mb4,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    DECLARE v_tag_count INT DEFAULT 0;

    SET v_tag_count = LENGTH(p_tags_text) - LENGTH(REPLACE(p_tags_text, ',', '')) + 1;

    SELECT 
        t.*,
        GROUP_CONCAT(tag_all.name ORDER BY tag_all.name SEPARATOR ',') AS tags
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

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_tweets_by_tags_asc(
    IN p_tags_text VARCHAR(255) CHARACTER SET utf8mb4,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    DECLARE v_tag_count INT DEFAULT 0;

    SET v_tag_count = LENGTH(p_tags_text) - LENGTH(REPLACE(p_tags_text, ',', '')) + 1;

    SELECT 
        t.*,
        GROUP_CONCAT(tag_all.name ORDER BY tag_all.name SEPARATOR ',') AS tags
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

/*Oceanbase创建用户*/
CREATE USER 'forum_user' IDENTIFIED BY 'forum_pass';
GRANT ALL PRIVILEGES ON *.* TO 'forum_user';
FLUSH PRIVILEGES;
/**/

/*添加初始用户*/
INSERT INTO Users (username, email, password) VALUES
('admin', 'admin', '$2b$10$Hrl6HxggObHjW2y4aeYJf.AbkqZAfoY34dGjpndRfj8QL5.FKJWhS');