import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/scenarios/[id]
 * 获取单个业务场景详情
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
      .from('business_scenarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching scenario:', error);
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
    console.error('Error fetching scenario:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scenario',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scenarios/[id]
 * 更新业务场景
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
      .from('business_scenarios')
      .update({
        scenario_name: body.scenarioName,
        module_code: body.moduleCode,
        module_name: body.moduleName,
        parent_scenario_id: body.parentScenarioId || null,
        level: body.level,
        sort_order: body.sortOrder,
        status: body.status,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scenario:', error);
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
    console.error('Error updating scenario:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update scenario',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scenarios/[id]
 * 删除业务场景（软删除，修改状态为inactive）
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
      .from('business_scenarios')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting scenario:', error);
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
      message: 'Scenario deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete scenario',
      },
      { status: 500 }
    );
  }
}
