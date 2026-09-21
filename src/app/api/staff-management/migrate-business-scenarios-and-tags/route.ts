import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 添加业务场景和标签字段的迁移脚本
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    console.log('开始添加业务场景和标签字段...');

    // Supabase 使用 PostgreSQL，我们需要使用 SQL 来添加字段
    // 注意：在实际环境中，应该使用 Supabase Dashboard 的 SQL Editor 来执行 DDL 语句
    // 这里提供一个参考的 SQL 语句

    const sqlStatements = [
      // 添加 business_scenarios 字段（数组类型）
      `ALTER TABLE staff_management ADD COLUMN IF NOT EXISTS business_scenarios text[];`,
      // 添加 tags 字段（数组类型）
      `ALTER TABLE staff_management ADD COLUMN IF NOT EXISTS tags text[];`,
    ];

    // 注意：在实际应用中，这些 SQL 语句需要在 Supabase Dashboard 的 SQL Editor 中手动执行
    // 因为 Supabase 的客户端不允许直接执行 DDL 语句

    return NextResponse.json({
      success: true,
      message: '迁移脚本准备完成',
      sqlStatements,
      instructions: [
        '请在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL 语句：',
        ...sqlStatements,
      ],
    });
  } catch (error: any) {
    console.error('迁移失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '迁移失败' },
      { status: 500 }
    );
  }
}
