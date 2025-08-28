import OpenAI from 'openai';
import { useDatabase } from './database';

const client = new OpenAI({
    baseURL: process.env.LLM_API_URL || 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || 'ollama',
});

export interface AuditResult {
    needs_report: boolean;
    reason: string;
}

export async function moderateContent(content: string): Promise<AuditResult> {
    const prompt = `
            你是一名内容审核系统，负责判断用户发布的评论或推文是否包含侮辱性词汇、攻击性内容或不当言论。  
            请严格按照以下要求输出 JSON 格式结果：  

            输入内容: "${content}"

            输出 JSON 格式如下：
            {
            "needs_report": true | false,
            "reason": "简要说明原因"
            }
            `;

    const response = await client.chat.completions.create({
        model: process.env.LLM_MODEL || 'deepseek-chat',
        messages: [
            { role: 'system', content: '你是一个内容审核助手' },
            { role: 'user', content: prompt },
        ],
        temperature: 0,
    });

    try {
        const raw = response.choices[0].message?.content?.trim() || '{}';

        // 用正则匹配第一个花括号到最后一个花括号之间的内容
        const match = raw.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : '{}';

        return JSON.parse(jsonStr) as AuditResult;
    } catch (e) {
        console.error('解析审核结果失败:', e);
        return { needs_report: false, reason: '审核失败，默认通过' };
    }
}

export async function auditAndReport(
    content: string,
    tweetId?: number,
    commentId?: number,
): Promise<AuditResult> {
    const db = useDatabase();
    const result = await moderateContent(content);

    if (result.needs_report) {
        try {
            await db.sql`
        INSERT INTO Reports (tweet_id, comment_id, content)
        VALUES (${tweetId || null}, ${commentId || null}, ${result.reason})
      `;
        } catch (err) {
            console.error('写入 Reports 表失败:', err);
        }
    }

    return result;
}
