import fs from 'fs';
import path from 'path';
import { executeTransaction, testConnection } from '../server/config/database.ts';

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
        
        const result = await executeTransaction(queries);
        
        if (result.success) {
            console.log('✅ MySQL数据库初始化成功');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

initDatabase();