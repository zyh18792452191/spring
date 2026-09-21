import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取日历视图数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const monthParam = searchParams.get('month');
    const province = searchParams.get('province');

    const client = getSupabaseClient();

    let query;
    let statsQuery;
    let totalCount, inProgressCount, finishedCount;

    if (monthParam && monthParam !== 'all') {
      // 获取单月数据
      const month = parseInt(monthParam);

      // 获取当月的第一天和最后一天
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      // 构建查询：获取与当月有交集的所有任务
      query = client
        .from('operational_tasks')
        .select('*')
        .lte('start_time', lastDay.toISOString())
        .gte('end_time', firstDay.toISOString())
        .order('start_time', { ascending: true });

      // 获取当月的统计数据
      statsQuery = client
        .from('operational_tasks')
        .select('*')
        .lte('start_time', lastDay.toISOString())
        .gte('end_time', firstDay.toISOString());

      // 计算统计数据
      const { data: allTasks, error: statsError } = await statsQuery;
      if (statsError) throw statsError;
      totalCount = allTasks?.length || 0;
      inProgressCount = allTasks?.filter((t: any) => t.status === 'in_progress').length || 0;
      finishedCount = allTasks?.filter((t: any) => t.status === 'finished').length || 0;
    } else {
      // 获取全年数据
      const firstDay = new Date(year, 0, 1);
      const lastDay = new Date(year, 11, 31);

      query = client
        .from('operational_tasks')
        .select('*')
        .gte('start_time', firstDay.toISOString())
        .lte('end_time', lastDay.toISOString())
        .order('start_time', { ascending: true });

      statsQuery = client
        .from('operational_tasks')
        .select('*')
        .gte('start_time', firstDay.toISOString())
        .lte('end_time', lastDay.toISOString());

      const { data: allTasks, error: statsError } = await statsQuery;
      if (statsError) throw statsError;
      totalCount = allTasks?.length || 0;
      inProgressCount = allTasks?.filter((t: any) => t.status === 'in_progress').length || 0;
      finishedCount = allTasks?.filter((t: any) => t.status === 'finished').length || 0;
    }

    // 如果有省份筛选，添加省份条件
    if (province && province !== 'all' && province !== '全国') {
      query = query.eq('province', province);
      statsQuery = statsQuery?.eq('province', province);
    }

    // 查询任务数据
    const { data: tasks, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasks || [],
        statistics: {
          totalCount,
          inProgressCount,
          finishedCount,
        },
      },
    });
  } catch (error: any) {
    console.error('获取日历视图数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取日历视图数据失败' },
      { status: 500 }
    );
  }
}
