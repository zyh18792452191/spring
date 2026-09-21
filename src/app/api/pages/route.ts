import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取页面列表
 * GET /api/pages
 * Query参数：
 * - page: 页码（默认1）
 * - pageSize: 每页条数（默认10）
 * - status: 状态（可选）
 * - moduleCode: 模块编码（可选）
 * - scenarioCode: 场景编码（可选）
 * - search: 搜索关键词（可选）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const status = searchParams.get('status');
    const moduleCode = searchParams.get('moduleCode');
    const scenarioCode = searchParams.get('scenarioCode');
    const search = searchParams.get('search');

    const client = getSupabaseClient();

    // 计算范围
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 获取总数
    let countQuery = client
      .from('pages')
      .select('*', { count: 'exact', head: true });

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (moduleCode) {
      countQuery = countQuery.eq('module_code', moduleCode);
    }

    if (scenarioCode) {
      countQuery = countQuery.eq('scenario_code', scenarioCode);
    }

    if (search) {
      countQuery = countQuery.or(`page_name.ilike.%${search}%,page_code.ilike.%${search}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting pages:', countError);
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
      .from('pages')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    if (moduleCode) {
      query = query.eq('module_code', moduleCode);
    }

    if (scenarioCode) {
      query = query.eq('scenario_code', scenarioCode);
    }

    if (search) {
      query = query.or(`page_name.ilike.%${search}%,page_code.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pages:', error);
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
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pages',
      },
      { status: 500 }
    );
  }
}

/**
 * 添加页面
 * POST /api/pages
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const {
      page_code,
      page_name,
      page_type,
      page_path,
      scenario_code,
      module_code,
      is_tree_page,
      sort_order,
    } = body;

    // 验证必填字段
    if (!page_code || !page_name || !page_type || !page_path || !scenario_code || !module_code) {
      return NextResponse.json({
        success: false,
        message: '缺少必填字段',
      }, { status: 400 });
    }

    // 获取场景ID
    const { data: scenario, error: scenarioError } = await supabase
      .from('business_scenarios')
      .select('id')
      .eq('scenario_code', scenario_code)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({
        success: false,
        message: '业务场景不存在',
      }, { status: 404 });
    }

    // 获取模块名称
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('module_name')
      .eq('module_code', module_code)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({
        success: false,
        message: '模块不存在',
      }, { status: 404 });
    }

    // 获取场景名称
    const { data: scenarioData, error: scenarioDataError } = await supabase
      .from('business_scenarios')
      .select('scenario_name')
      .eq('scenario_code', scenario_code)
      .single();

    if (scenarioDataError || !scenarioData) {
      return NextResponse.json({
        success: false,
        message: '业务场景不存在',
      }, { status: 404 });
    }

    // 插入页面
    const { data, error } = await supabase
      .from('pages')
      .insert({
        page_code,
        page_name,
        page_type,
        page_path,
        scenario_id: scenario.id,
        scenario_code,
        scenario_name: scenarioData.scenario_name,
        module_code,
        module_name: module.module_name,
        is_tree_page: is_tree_page || false,
        sort_order: sort_order || 1,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: '添加页面失败',
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '添加页面成功',
      data,
    });
  } catch (error) {
    console.error('添加页面失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `添加失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
