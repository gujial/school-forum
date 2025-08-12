import { useDatabase } from '../util/database';

export default defineEventHandler(async (event) => {
    const db = useDatabase();
    // 手动执行字符集设置
    // await db.sql`SET NAMES utf8mb4;`

    // 简单查询测试中文参数
    const test = await db.sql`SELECT ${"哈基米"} AS test_col`;
    console.log(test.rows[0].test_col)
});
