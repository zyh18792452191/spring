import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/reports
 * 获取报告列表
 * 
 * Query参数：
 * - status: 状态（可选）
 * - reportType: 报告类型（可选）
 * - reportPeriod: 报告周期（可选）
 * - templateId: 模板ID（可选）
 * - search: 搜索关键词（可选）
 * - limit: 每页数量（默认10）
 * - offset: 偏移量（默认0）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const reportPeriod = searchParams.get('reportPeriod');
    const templateId = searchParams.get('templateId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const client = getSupabaseClient();

    // 获取总数
    let countQuery = client.from('reports').select('*', { count: 'exact', head: true });

    if (status) countQuery = countQuery.eq('status', status);
    if (reportType) countQuery = countQuery.eq('report_type', reportType);
    if (reportPeriod) countQuery = countQuery.eq('report_period', reportPeriod);
    if (templateId) countQuery = countQuery.eq('template_id', templateId);
    if (search) countQuery = countQuery.or(`report_name.ilike.%${search}%,report_code.ilike.%${search}%`);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting reports:', countError);
      return NextResponse.json(
        {
          success: false,
          error: countError.message,
        },
        { status: 500 }
      );
    }

    // 获取数据
    let query = client
      .from('reports')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (reportType) query = query.eq('report_type', reportType);
    if (reportPeriod) query = query.eq('report_period', reportPeriod);
    if (templateId) query = query.eq('template_id', templateId);
    if (search) query = query.or(`report_name.ilike.%${search}%,report_code.ilike.%${search}%`);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reports',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * 创建报告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.reportCode || !body.reportName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: reportCode, reportName',
        },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查报告编码是否已存在
    const { data: existing, error: checkError } = await client
      .from('reports')
      .select('id')
      .eq('report_code', body.reportCode)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing report:', checkError);
      return NextResponse.json(
        {
          success: false,
          error: checkError.message,
        },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report code already exists',
        },
        { status: 400 }
      );
    }

    // 插入数据
    const { data: newReport, error: insertError } = await client
      .from('reports')
      .insert({
        report_code: body.reportCode,
        report_name: body.reportName,
        template_id: body.templateId || null,
        report_type: body.reportType || null,
        report_period: body.reportPeriod || null,
        status: body.status || 'draft',
        content: body.content || null,
        content_config: body.contentConfig || null,
        schedule_config: body.scheduleConfig || null,
        metadata: body.metadata || null,
        sort_order: body.sortOrder || 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating report:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create report',
      },
      { status: 500 }
    );
  }
}
