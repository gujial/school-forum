import 'dotenv/config'
import { executeQuery, testConnection } from '../server/config/database.js';

// 表结构定义
const tables = [
  {
    name: 'Users',
    sql: `
      CREATE TABLE IF NOT EXISTS Users (
        user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'Avatar',
    sql: `
      CREATE TABLE IF NOT EXISTS Avatar (
        user_id BIGINT PRIMARY KEY,
        avatar_url TEXT,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      )
    `
  },
  {
    name: 'Tweets',
    sql: `
      CREATE TABLE IF NOT EXISTS Tweets (
        tweet_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      )
    `
  },
  {
    name: 'Comments',
    sql: `
      CREATE TABLE IF NOT EXISTS Comments (
        comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        tweet_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      )
    `
  },
  {
    name: 'Media',
    sql: `
      CREATE TABLE IF NOT EXISTS Media (
        media_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        tweet_id BIGINT,
        media_url TEXT NOT NULL,
        media_type VARCHAR(10) NOT NULL,
        FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id)
      )
    `
  },
  {
    name: 'Likes',
    sql: `
      CREATE TABLE IF NOT EXISTS Likes (
        like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        tweet_id BIGINT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id),
        FOREIGN KEY (tweet_id) REFERENCES Tweets(tweet_id),
        UNIQUE KEY unique_user_tweet (user_id, tweet_id)
      )
    `
  }
];

// 检查表是否存在
async function tableExists(tableName) {
  try {
    const result = await executeQuery(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = ? AND table_name = ?`,
      [process.env.DB_NAME || 'school_forum', tableName]
    );
    
    if (result.success && result.rows.length > 0) {
      return result.rows[0].count > 0;
    }
    return false;
  } catch (error) {
    console.error(`检查表 ${tableName} 是否存在时出错:`, error);
    return false;
  }
}

// 创建单个表
async function createTable(table) {
  try {
    const exists = await tableExists(table.name);
    
    if (exists) {
      console.log(`⏭️  表 ${table.name} 已存在，跳过创建`);
      return { success: true, skipped: true };
    }
    
    console.log(`📝 创建表 ${table.name}...`);
    const result = await executeQuery(table.sql);
    
    if (result.success) {
      console.log(`✅ 表 ${table.name} 创建成功`);
      return { success: true, skipped: false };
    } else {
      console.error(`❌ 表 ${table.name} 创建失败:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ 创建表 ${table.name} 时出错:`, error);
    return { success: false, error };
  }
}

// 主函数
async function initDatabaseAdvanced() {
  console.log('🚀 开始高级数据库初始化...');
  
  // 测试数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ 无法连接到MySQL数据库，请检查配置');
    process.exit(1);
  }
  
  console.log(`📊 准备创建 ${tables.length} 个表...`);
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  // 按顺序创建表（考虑外键依赖）
  for (const table of tables) {
    const result = await createTable(table);
    
    if (result.success) {
      if (result.skipped) {
        skippedCount++;
      } else {
        successCount++;
      }
    } else {
      errorCount++;
      console.error(`❌ 表 ${table.name} 创建失败，停止初始化`);
      break;
    }
  }
  
  // 输出统计信息
  console.log('\n📊 初始化统计:');
  console.log(`✅ 成功创建: ${successCount} 个表`);
  console.log(`⏭️  跳过已存在: ${skippedCount} 个表`);
  console.log(`❌ 创建失败: ${errorCount} 个表`);
  
  if (errorCount === 0) {
    console.log('\n🎉 数据库初始化完成！');
  } else {
    console.log('\n⚠️  部分表创建失败，请检查错误信息');
    process.exit(1);
  }
}

// 运行初始化
initDatabaseAdvanced().catch(error => {
  console.error('❌ 初始化过程中发生未预期的错误:', error);
  process.exit(1);
}); 