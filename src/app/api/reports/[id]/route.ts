import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/reports/[id]
 * 获取单个报告详情
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reports/[id]
 * 更新报告
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    const client = getSupabaseClient();

    // 更新数据
    const { data, error } = await client
      .from('reports')
      .update({
        report_name: body.reportName,
        template_id: body.templateId,
        report_type: body.reportType,
        report_period: body.reportPeriod,
        status: body.status,
        content: body.content,
        content_config: body.contentConfig,
        schedule_config: body.scheduleConfig,
        metadata: body.metadata,
        sort_order: body.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error);
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
      data,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update report',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]
 * 删除报告
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const client = getSupabaseClient();

    const { error } = await client
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report:', error);
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
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete report',
      },
      { status: 500 }
    );
  }
}
