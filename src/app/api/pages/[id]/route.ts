import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/pages/[id]
 * 获取单个页面详情
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
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching page:', error);
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
    console.error('Error fetching page:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch page',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pages/[id]
 * 更新页面
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
      .from('pages')
      .update({
        page_name: body.pageName,
        page_type: body.pageType,
        page_path: body.pagePath,
        scenario_id: body.scenarioId || null,
        scenario_code: body.scenarioCode || null,
        scenario_name: body.scenarioName || null,
        module_code: body.moduleCode || null,
        module_name: body.moduleName || null,
        is_tree_page: body.isTreePage,
        tree_config_id: body.treeConfigId,
        sort_order: body.sortOrder,
        status: body.status,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating page:', error);
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
    console.error('Error updating page:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update page',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pages/[id]
 * 删除页面（软删除，修改状态为inactive）
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const client = getSupabaseClient();

    // 软删除
    const { error } = await client
      .from('pages')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting page:', error);
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
      message: 'Page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete page',
      },
      { status: 500 }
    );
  }
}
