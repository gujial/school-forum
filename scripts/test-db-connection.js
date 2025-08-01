import { testConnection } from '../server/config/database.ts'

async function testDBConnection() {
    console.log('🔍 测试MySQL数据库连接...')
    
    try {
        const isConnected = await testConnection()
        
        if (isConnected) {
            console.log('✅ 数据库连接测试成功！')
            console.log('📝 请确保已创建数据库并配置了正确的环境变量')
            console.log('📝 可以运行 "pnpm run db:init" 来初始化数据库表')
        } else {
            console.log('❌ 数据库连接测试失败！')
            console.log('📝 请检查以下配置：')
            console.log('   1. MySQL服务是否正在运行')
            console.log('   2. 数据库连接信息是否正确')
            console.log('   3. 环境变量是否已设置')
            console.log('📝 参考 env.example 文件设置环境变量')
        }
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error)
    }
}

testDBConnection() 