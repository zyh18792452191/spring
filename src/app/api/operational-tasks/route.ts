import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取运营任务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskName = searchParams.get('taskName');
    const createdBy = searchParams.get('createdBy');
    const status = searchParams.get('status');
    const province = searchParams.get('province');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const client = getSupabaseClient();

    let query = client
      .from('operational_tasks')
      .select('*', { count: 'exact' });

    // 筛选条件
    if (taskName) {
      query = query.ilike('task_name', `%${taskName}%`);
    }
    if (createdBy) {
      query = query.ilike('created_by', `%${createdBy}%`);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (province && province !== 'all' && province !== '全国') {
      query = query.eq('province', province);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

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
    console.error('获取运营任务列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取运营任务列表失败' },
      { status: 500 }
    );
  }
}

// POST - 新增运营任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      taskName,
      startTime,
      endTime,
      actualEndTime,
      durationDays,
      province,
      formTemplateId,
      formTemplateName,
      formData,
      createdBy,
    } = body;

    // 验证必填字段
    if (!taskName || !startTime || !endTime || !formData || !createdBy) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 计算活动时长（天）
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const client = getSupabaseClient();

    // 生成任务编码
    const taskCode = `TASK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await client
      .from('operational_tasks')
      .insert({
        task_code: taskCode,
        task_name: taskName,
        status: 'not_started',
        start_time: startTime,
        end_time: endTime,
        actual_end_time: actualEndTime || null,
        duration_days: durationDays || duration,
        province: province || '全国',
        form_template_id: formTemplateId,
        form_template_name: formTemplateName,
        form_data: JSON.stringify(formData),
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('新增运营任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '新增运营任务失败' },
      { status: 500 }
    );
  }
}
