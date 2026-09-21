import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/scenarios
 * 获取业务场景列表
 *
 * Query参数：
 * - moduleCode: 模块编码（可选）
 * - status: 状态（可选）
 * - search: 搜索关键词（可选）
 * - includeInactive: 是否包含非活跃场景（默认false）
 * - page: 页码（默认1）
 * - pageSize: 每页条数（默认10）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleCode = searchParams.get('moduleCode');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const client = getSupabaseClient();

    // 计算范围
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 获取总数
    let countQuery = client
      .from('business_scenarios')
      .select('*', { count: 'exact', head: true });

    if (moduleCode) {
      countQuery = countQuery.eq('module_code', moduleCode);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    } else if (!includeInactive) {
      countQuery = countQuery.eq('status', 'active');
    }

    if (search) {
      countQuery = countQuery.or(`scenario_name.ilike.%${search}%,scenario_code.ilike.%${search}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting scenarios:', countError);
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
      .from('business_scenarios')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (moduleCode) {
      query = query.eq('module_code', moduleCode);
    }

    if (status) {
      query = query.eq('status', status);
    } else if (!includeInactive) {
      query = query.eq('status', 'active');
    }

    if (search) {
      query = query.or(`scenario_name.ilike.%${search}%,scenario_code.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scenarios:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((totalCount || 0) / pageSize);

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scenarios',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenarios
 * 创建业务场景
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.scenarioCode || !body.scenarioName || !body.moduleCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: scenarioCode, scenarioName, moduleCode',
        },
        { status: 400 }
      );
    }

    // 检查场景编码是否已存在
    const client = getSupabaseClient();
    const { data: existing, error: checkError } = await client
      .from('business_scenarios')
      .select('id')
      .eq('scenario_code', body.scenarioCode)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing scenario:', checkError);
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
          error: 'Scenario code already exists',
        },
        { status: 400 }
      );
    }

    // 插入数据
    const { data: newScenario, error: insertError } = await client
      .from('business_scenarios')
      .insert({
        scenario_code: body.scenarioCode,
        scenario_name: body.scenarioName,
        module_code: body.moduleCode,
        module_name: body.moduleName || '',
        parent_scenario_id: body.parentScenarioId || null,
        level: body.level || 1,
        sort_order: body.sortOrder || 0,
        status: body.status || 'active',
        description: body.description || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating scenario:', insertError);
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
        data: newScenario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create scenario',
      },
      { status: 500 }
    );
  }
}
