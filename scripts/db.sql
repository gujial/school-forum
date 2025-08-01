CREATE TABLE Users (
                       user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Avatar (
                              user_id BIGINT PRIMARY KEY,
                              avatar_url TEXT,
                              FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Tweets (
                       tweet_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       user_id BIGINT NOT NULL,
                       content TEXT,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Comments (
                      comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      tweet_id BIGINT NOT NULL,
                      user_id BIGINT NOT NULL,
                      content TEXT NOT NULL,
                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
                      FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Media (
                          media_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          tweet_id BIGINT,
                          media_url TEXT NOT NULL,
                          media_type VARCHAR(10) NOT NULL,
                          FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id)
);

CREATE TABLE Likes (
                       like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       user_id BIGINT NOT NULL,
                       tweet_id BIGINT NOT NULL,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES Users(user_id),
                       FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
                       UNIQUE KEY unique_user_tweet (user_id, tweet_id)
);

 