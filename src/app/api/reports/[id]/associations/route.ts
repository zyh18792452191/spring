import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/reports/[id]/associations
 * 获取报告的页面关联配置
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
      .from('report_associations')
      .select('*')
      .eq('report_id', id)
      .order('display_priority', { ascending: true });

    if (error) {
      console.error('Error fetching report associations:', error);
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
    });
  } catch (error) {
    console.error('Error fetching report associations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report associations',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reports/[id]/associations
 * 保存报告的页面关联配置
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    if (!Array.isArray(body.associations)) {
      return NextResponse.json(
        {
          success: false,
          error: 'associations must be an array',
        },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 先删除现有的关联配置
    const { error: deleteError } = await client
      .from('report_associations')
      .delete()
      .eq('report_id', id);

    if (deleteError) {
      console.error('Error deleting existing associations:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: deleteError.message,
        },
        { status: 500 }
      );
    }

    // 插入新的关联配置
    if (body.associations.length > 0) {
      const associationsToInsert = body.associations.map((assoc: any, index: number) => ({
        report_id: id,
        association_type: assoc.associationType || 'page',
        page_id: assoc.pageId || null,
        target_id: assoc.targetId || null,
        is_default: assoc.isDefault || false,
        display_priority: assoc.displayPriority || (index + 1),
        metadata: assoc.metadata || null,
      }));

      const { error: insertError } = await client
        .from('report_associations')
        .insert(associationsToInsert);

      if (insertError) {
        console.error('Error inserting associations:', insertError);
        return NextResponse.json(
          {
            success: false,
            error: insertError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Associations saved successfully',
    });
  } catch (error) {
    console.error('Error saving report associations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save report associations',
      },
      { status: 500 }
    );
  }
}
