import 'dotenv/config'
import { executeQuery, testConnection } from '../server/config/database.runtime.js';

// 需要检查的表列表
const requiredTables = [
  'Users',
  'Avatar', 
  'Tweets',
  'Comments',
  'Media',
  'Likes',
  'Messages',
  'Tags',
  'Follows',
  'Admins',
  'Reports',
  'TweetTags'
];

// 检查表是否存在
async function checkTableExists(tableName) {
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
    console.error(`检查表 ${tableName} 时出错:`, error);
    return false;
  }
}

// 获取表的行数
async function getTableRowCount(tableName) {
  try {
    const result = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
    
    if (result.success && result.rows.length > 0) {
      return result.rows[0].count;
    }
    return 0;
  } catch {
    return 'N/A';
  }
}

// 主函数
async function checkDatabaseStatus() {
  console.log('🔍 检查数据库状态...\n');
  
  // 测试数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ 无法连接到MySQL数据库');
    process.exit(1);
  }
  
  console.log('📊 数据库表状态:');
  console.log('─'.repeat(60));
  
  let existingTables = 0;
  let missingTables = 0;
  
  for (const tableName of requiredTables) {
    const exists = await checkTableExists(tableName);
    const rowCount = exists ? await getTableRowCount(tableName) : 0;
    
    if (exists) {
      console.log(`✅ ${tableName.padEnd(15)} | 存在 | 行数: ${rowCount}`);
      existingTables++;
    } else {
      console.log(`❌ ${tableName.padEnd(15)} | 不存在 | 行数: N/A`);
      missingTables++;
    }
  }
  
  console.log('─'.repeat(60));
  console.log(`📈 统计: ${existingTables} 个表存在, ${missingTables} 个表缺失`);
  
  if (missingTables === 0) {
    console.log('\n🎉 所有必需的表都已存在！');
  } else {
    console.log('\n⚠️  缺少一些表，请运行初始化脚本:');
    console.log('   npm run db:init:advanced');
  }
  
  // 检查数据库版本
  try {
    const versionResult = await executeQuery('SELECT VERSION() as version');
    if (versionResult.success && versionResult.rows.length > 0) {
      console.log(`\n📋 MySQL版本: ${versionResult.rows[0].version}`);
    }
  } catch (error) {
    console.log('\n📋 无法获取MySQL版本信息');
  }
  
  // 检查数据库大小
  try {
    const sizeResult = await executeQuery(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'school_forum']);
    
    if (sizeResult.success && sizeResult.rows.length > 0) {
      console.log(`📊 数据库大小: ${sizeResult.rows[0]['DB Size in MB']} MB`);
    }
  } catch (error) {
    console.log('📊 无法获取数据库大小信息');
  }
}

// 运行检查
checkDatabaseStatus().catch(error => {
  console.error('❌ 检查过程中发生错误:', error);
  process.exit(1);
}); 