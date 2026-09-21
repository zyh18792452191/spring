import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 通过手机号搜索员工列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: '缺少手机号参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 搜索员工列表（支持模糊搜索手机号）
    const { data, error } = await client
      .from('staff_management')
      .select('*')
      .ilike('phone', `%${phone}%`)
      .order('employee_no', { ascending: true })
      .limit(50);

    if (error) throw error;

    // 返回员工列表
    return NextResponse.json({
      success: true,
      data: data || [],
      message: data?.length ? `找到 ${data.length} 条员工信息` : '未找到员工信息'
    });
  } catch (error: any) {
    console.error('搜索员工失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '搜索员工失败' },
      { status: 500 }
    );
  }
}
