import 'dotenv/config'
import mysql from 'mysql2/promise'

async function testMySQLConnection() {
    console.log('🔍 测试MySQL数据库连接...')
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_forum'
    }
    
    console.log('📝 数据库配置:', {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database
    })
    
    try {
        const connection = await mysql.createConnection(config)
        console.log('✅ MySQL数据库连接成功！')
        
        // 测试查询
        const [rows] = await connection.execute('SELECT 1 as test')
        console.log('✅ 数据库查询测试成功:', rows)
        
        await connection.end()
        return true
    } catch (error) {
        console.error('❌ MySQL数据库连接失败:', error.message)
        console.log('📝 请检查以下配置：')
        console.log('   1. MySQL服务是否正在运行')
        console.log('   2. 数据库连接信息是否正确')
        console.log('   3. 环境变量是否已设置')
        console.log('📝 参考 env.example 文件设置环境变量')
        return false
    }
}

testMySQLConnection() 