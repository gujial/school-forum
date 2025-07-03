CREATE TABLE users (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       avatar_url TEXT,
                       nickname VARCHAR(50),
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_follows (
                              follower_id BIGINT,
                              following_id BIGINT,
                              follow_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                              PRIMARY KEY (follower_id, following_id),
                              FOREIGN KEY (follower_id) REFERENCES users(id),
                              FOREIGN KEY (following_id) REFERENCES users(id)
);

CREATE TABLE posts (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       author_id BIGINT NOT NULL,
                       title VARCHAR(200),
                       content TEXT,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       is_deleted BOOLEAN DEFAULT FALSE,
                       FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE tags (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
                           post_id BIGINT,
                           tag_id BIGINT,
                           PRIMARY KEY (post_id, tag_id),
                           FOREIGN KEY (post_id) REFERENCES posts(id),
                           FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE TABLE comments (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          post_id BIGINT NOT NULL,
                          user_id BIGINT NOT NULL,
                          content TEXT NOT NULL,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          parent_comment_id BIGINT DEFAULT NULL,
                          FOREIGN KEY (post_id) REFERENCES posts(id),
                          FOREIGN KEY (user_id) REFERENCES users(id),
                          FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

CREATE TABLE likes (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       user_id BIGINT NOT NULL,
                       target_type ENUM('post', 'comment') NOT NULL,
                       target_id BIGINT NOT NULL,
                       liked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         reporter_id BIGINT NOT NULL,
                         target_type ENUM('post', 'comment', 'user') NOT NULL,
                         target_id BIGINT NOT NULL,
                         reason TEXT,
                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (reporter_id) REFERENCES users(id)
);

CREATE TABLE messages (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          sender_id BIGINT NOT NULL,
                          receiver_id BIGINT NOT NULL,
                          content TEXT NOT NULL,
                          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          is_read BOOLEAN DEFAULT FALSE,
                          FOREIGN KEY (sender_id) REFERENCES users(id),
                          FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE media (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       post_id BIGINT,
                       url TEXT NOT NULL,
                       media_type ENUM('image', 'video') NOT NULL,
                       uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (post_id) REFERENCES posts(id)
); 