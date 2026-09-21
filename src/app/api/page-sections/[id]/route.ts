import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 获取单个页面区域
 * GET /api/page-sections/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('page_sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Page section not found',
          },
          { status: 404 }
        );
      }
      console.error('Error fetching page section:', error);
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
    console.error('Error in GET /api/page-sections/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 更新页面区域
 * PUT /api/page-sections/[id]
 * Body参数：
 * - sectionName: 区域名称
 * - sectionType: 区域类型
 * - sectionConfig: 区域配置（JSON字符串）
 * - sortOrder: 排序
 * - status: 状态
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      sectionName,
      sectionType,
      sectionConfig,
      sortOrder,
      status,
    } = body;

    // 构建更新对象
    const updateData: any = {};
    if (sectionName !== undefined) updateData.section_name = sectionName;
    if (sectionType !== undefined) updateData.section_type = sectionType;
    if (sectionConfig !== undefined) updateData.section_config = sectionConfig;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (status !== undefined) updateData.status = status;

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('page_sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Page section not found',
          },
          { status: 404 }
        );
      }
      console.error('Error updating page section:', error);
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
    console.error('Error in PUT /api/page-sections/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 删除页面区域
 * DELETE /api/page-sections/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('page_sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting page section:', error);
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
      message: 'Page section deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/page-sections/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
