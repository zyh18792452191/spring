import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * 初始化数据库表结构
 * POST /api/init-db
 */
export async function POST(request: NextRequest) {
  try {
    // 读取SQL脚本
    const sqlPath = join(process.cwd(), 'migrations', 'create-tables.sql');
    const sqlContent = await readFile(sqlPath, 'utf-8');

    // 由于Supabase JS客户端的限制，我们无法直接执行原始SQL
    // 返回SQL内容，提示用户手动执行
    return NextResponse.json({
      success: false,
      message: '请手动执行以下SQL脚本来初始化数据库表结构',
      sql: sqlContent,
      instructions: [
        '1. 打开 Supabase 的 SQL Editor',
        '2. 复制下方显示的 SQL 脚本',
        '3. 粘贴到 SQL Editor 中并执行',
        '4. 执行完成后，调用 POST /api/init-pages-data 初始化页面数据',
      ],
    });
  } catch (error) {
    console.error('初始化数据库失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取SQL脚本
 * GET /api/init-db
 */
export async function GET(request: NextRequest) {
  try {
    // 读取SQL脚本
    const sqlPath = join(process.cwd(), 'migrations', 'create-tables.sql');
    const sqlContent = await readFile(sqlPath, 'utf-8');

    return NextResponse.json({
      success: true,
      sql: sqlContent,
    });
  } catch (error) {
    console.error('获取SQL脚本失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `获取失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
