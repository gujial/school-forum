import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import { executeTransaction, testConnection } from '../server/config/database.js';

async function initDatabase() {
    // 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('无法连接到MySQL数据库，请检查配置');
        process.exit(1);
    }

    const sqlFilePath = path.join('scripts', 'db.sql'); 
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
    try {
        // 分割SQL语句并执行
        const statements = sql.split(';').filter(stmt => stmt.trim());
        const queries = statements.map(stmt => ({ sql: stmt.trim() }));
        
        console.log(`📝 准备执行 ${queries.length} 条SQL语句...`);
        
        const result = await executeTransaction(queries);
        
        if (result.success) {
            console.log('✅ MySQL数据库初始化成功');
            console.log('📊 执行的语句数量:', queries.length);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        console.log('💡 提示: 如果表已存在，这是正常现象，可以忽略此错误');
        process.exit(1);
    }
}

initDatabase();