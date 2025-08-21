// server/api/auth/register.ts

import { defineEventHandler, readBody, createError } from 'h3';
import bcrypt from 'bcryptjs';
import { useDatabase } from '../../util/database';
import type { User } from '~/types/models';

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface UserRows {
    user_id: any;
    rows: User[];
}

/**
 * 用户注册，创建用户记录并初始化头像。
 *
 * 路由: POST /api/auth/register
 * 权限: 公开
 *
 * 请求体:
 * - username: string 必填
 * - email: string 必填
 * - password: string 必填
 *
 * 返回:
 * - { success: true, message: string }
 *
 * @param {import('h3').H3Event} event H3 请求事件对象
 * @returns {Promise<{success: boolean, message: string}>}
 */
export default defineEventHandler(async (event) => {
    const body = await readBody<RegisterBody>(event);
    const { username, email, password } = body;

    if (!username || !email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'All fields are required',
        });
    }

    const db = useDatabase();

    const existingUser =
        await db.sql<UserRows>`SELECT * FROM Users WHERE email = ${email} OR username = ${username}`;

    if (existingUser.rows.length !== 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username or email already exists',
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.sql`INSERT INTO Users (username, email, password) VALUES (${username}, ${email}, ${hashedPassword})`;

    const lastUser =
        await db.sql<UserRows>`SELECT * FROM Users WHERE email = ${email} OR username = ${username}`;
    await db.sql`INSERT INTO Avatar (avatar_url, user_id) VALUES (${'/icon.png'}, ${lastUser.rows[0].user_id})`;

    return {
        success: true,
        message: 'User registered successfully',
    };
});
