import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST - 执行SQL语句（仅用于初始化）
export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json();

    if (!sql) {
      return NextResponse.json(
        { success: false, error: '缺少SQL语句' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 使用rpc执行SQL（需要先创建一个SQL执行函数）
    // 这里我们直接读取SQL文件内容并通过执行
    const { data, error } = await client.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // 如果exec_sql函数不存在，尝试直接执行
      console.error('RPC执行失败，尝试直接执行:', error);

      // 返回SQL内容，建议用户手动执行
      return NextResponse.json({
        success: false,
        error: '需要手动执行SQL',
        sql: sql
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'SQL执行成功'
    });
  } catch (error: any) {
    console.error('执行SQL失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '执行SQL失败' },
      { status: 500 }
    );
  }
}
