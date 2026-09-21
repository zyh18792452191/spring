import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取近期活动列表（支持查询不同时间范围）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskName = searchParams.get('taskName');
    const status = searchParams.get('status');
    const province = searchParams.get('province');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const days = parseInt(searchParams.get('days') || '7'); // 默认7天，传30则为近一月

    const client = getSupabaseClient();

    // 计算近期的时间范围
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    let query = client
      .from('operational_tasks')
      .select('*', { count: 'exact' })
      .gte('start_time', startDate.toISOString());

    // 筛选条件
    if (taskName) {
      query = query.ilike('task_name', `%${taskName}%`);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (province && province !== 'all' && province !== '全国') {
      query = query.eq('province', province);
    }

    // 排序
    query = query.order('start_time', { ascending: false });

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error: any) {
    console.error('获取近期活动列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取近期活动列表失败' },
      { status: 500 }
    );
  }
}
