import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取页面树形结构数据
 * GET /api/pages/tree
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // 获取所有模块
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order');

    if (modulesError) {
      return NextResponse.json({
        success: false,
        message: '获取模块数据失败',
        error: modulesError.message,
      }, { status: 500 });
    }

    // 获取所有业务场景
    const { data: scenarios, error: scenariosError } = await supabase
      .from('business_scenarios')
      .select('*')
      .order('module_code', { ascending: true })
      .order('sort_order');

    if (scenariosError) {
      return NextResponse.json({
        success: false,
        message: '获取业务场景数据失败',
        error: scenariosError.message,
      }, { status: 500 });
    }

    // 获取所有页面
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('module_code', { ascending: true })
      .order('sort_order');

    if (pagesError) {
      return NextResponse.json({
        success: false,
        message: '获取页面数据失败',
        error: pagesError.message,
      }, { status: 500 });
    }

    // 按模块组织页面数据
    const moduleStats = modules?.map((module) => ({
      module: module.module_name,
      code: module.module_code,
      pageCount: pages?.filter((p) => p.module_code === module.module_code).length || 0,
      pages: pages
        ?.filter((p) => p.module_code === module.module_code)
        .map((page) => ({
          ...page,
          scenario_name: scenarios?.find((s) => s.scenario_code === page.scenario_code)?.scenario_name || '',
        })) || [],
    })) || [];

    return NextResponse.json({
      success: true,
      stats: {
        moduleCount: modules?.length || 0,
        scenarioCount: scenarios?.length || 0,
        pageCount: pages?.length || 0,
      },
      modules: modules || [],
      scenarios: scenarios || [],
      moduleStats,
    });
  } catch (error) {
    console.error('获取页面树形结构失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `获取失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
