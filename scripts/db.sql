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

DELIMITER $$

CREATE TRIGGER before_tweet_delete
BEFORE DELETE ON Tweets
FOR EACH ROW
BEGIN
    DELETE FROM Comments WHERE tweet_id = OLD.tweet_id;
    DELETE FROM Media WHERE tweet_id = OLD.tweet_id;
    DELETE FROM Likes WHERE tweet_id = OLD.tweet_id;
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