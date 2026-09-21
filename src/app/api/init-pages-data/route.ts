import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 初始化页面数据
 * POST /api/init-pages-data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 1. 插入模块
    const modules = [
      { module_code: 'PORTAL', module_name: '门户首页', icon: 'home', sort_order: 1, status: 'active' },
      { module_code: 'CHURN_RETENTION', module_name: '离网维系', icon: 'users', sort_order: 2, status: 'active' },
      { module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', icon: 'trending-up', sort_order: 3, status: 'active' },
      { module_code: 'STRATEGY', module_name: '策略管理', icon: 'target', sort_order: 4, status: 'active' },
      { module_code: 'DISPATCH', module_name: '调度管理', icon: 'send', sort_order: 5, status: 'active' },
      { module_code: 'WORKSPACE', module_name: '工作台', icon: 'layout', sort_order: 6, status: 'active' },
    ];

    for (const module of modules) {
      const { error } = await supabase
        .from('modules')
        .upsert(module, { onConflict: 'module_code' });

      if (error) {
        errorCount++;
        errors.push(`模块 ${module.module_name}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    // 2. 插入业务场景
    const scenarios = [
      // 门户首页场景
      { scenario_code: 'SCENARIO_PORTAL_HOME', scenario_name: '门户首页', module_code: 'PORTAL', module_name: '门户首页', level: 1, sort_order: 1, status: 'active' },
      { scenario_code: 'SCENARIO_PORTAL_OVERVIEW', scenario_name: '运营总览', module_code: 'PORTAL', module_name: '门户首页', level: 1, sort_order: 2, status: 'active' },

      // 离网维系场景
      { scenario_code: 'SCENARIO_CHURN_OVERVIEW', scenario_name: '离网维系概览', module_code: 'CHURN_RETENTION', module_name: '离网维系', level: 1, sort_order: 1, status: 'active' },
      { scenario_code: 'SCENARIO_CHURN_ALL', scenario_name: '当月全量客户离网客户数', module_code: 'CHURN_RETENTION', module_name: '离网维系', level: 1, sort_order: 2, status: 'active' },
      { scenario_code: 'SCENARIO_CHURN_MID_HIGH', scenario_name: '当月拍照中高端客户离网客户数', module_code: 'CHURN_RETENTION', module_name: '离网维系', level: 1, sort_order: 3, status: 'active' },
      { scenario_code: 'SCENARIO_CHURN_GLOBAL', scenario_name: '当月拍照全球通客户离网客户数', module_code: 'CHURN_RETENTION', module_name: '离网维系', level: 1, sort_order: 4, status: 'active' },

      // 中高端客户运营场景
      { scenario_code: 'SCENARIO_MID_HIGH_OVERVIEW', scenario_name: '中高端客户运营概览', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 1, status: 'active' },
      { scenario_code: 'SCENARIO_MID_HIGH_VALUE', scenario_name: '拍照中高端价值保有率', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 2, status: 'active' },
      { scenario_code: 'SCENARIO_OVER_PLAN', scenario_name: '超套客户规模', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 3, status: 'active' },
      { scenario_code: 'SCENARIO_BROADBAND_MOBILE', scenario_name: '宽移融合率', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 4, status: 'active' },
      { scenario_code: 'SCENARIO_INTERNET_ROAMING', scenario_name: '国际漫游客户', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 5, status: 'active' },
      { scenario_code: 'SCENARIO_SEGMENT_MARKET', scenario_name: '细分市场客群', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 6, status: 'active' },
      { scenario_code: 'SCENARIO_FAMILY_BROADBAND', scenario_name: '家庭宽带业务', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 7, status: 'active' },
      { scenario_code: 'SCENARIO_5G_CUSTOMER', scenario_name: '5G用户发展', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 8, status: 'active' },
      { scenario_code: 'SCENARIO_ENTERPRISE', scenario_name: '政企客户', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 9, status: 'active' },
      { scenario_code: 'SCENARIO_CHANNEL', scenario_name: '渠道运营', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 10, status: 'active' },
      { scenario_code: 'SCENARIO_SATISFACTION', scenario_name: '客户满意度', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 11, status: 'active' },
      { scenario_code: 'SCENARIO_VALUE_ADDED', scenario_name: '增值业务', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 12, status: 'active' },
      { scenario_code: 'SCENARIO_INTERNET_BUSINESS', scenario_name: '国际业务收入', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 13, status: 'active' },
      { scenario_code: 'SCENARIO_STOCK_CUSTOMER', scenario_name: '存量客户运营', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 14, status: 'active' },
      { scenario_code: 'SCENARIO_NEW_BUSINESS', scenario_name: '新业务拓展', module_code: 'MID_HIGH_CUSTOMER', module_name: '中高端客户运营', level: 1, sort_order: 15, status: 'active' },

      // 策略管理场景
      { scenario_code: 'SCENARIO_STRATEGY_METRICS', scenario_name: '指标策略', module_code: 'STRATEGY', module_name: '策略管理', level: 1, sort_order: 1, status: 'active' },
      { scenario_code: 'SCENARIO_STRATEGY_LIST', scenario_name: '策略列表', module_code: 'STRATEGY', module_name: '策略管理', level: 1, sort_order: 2, status: 'active' },

      // 调度管理场景
      { scenario_code: 'SCENARIO_DISPATCH_SUBMIT', scenario_name: '工单提交', module_code: 'DISPATCH', module_name: '调度管理', level: 1, sort_order: 1, status: 'active' },
      { scenario_code: 'SCENARIO_DISPATCH_PROCESS', scenario_name: '工单处理', module_code: 'DISPATCH', module_name: '调度管理', level: 1, sort_order: 2, status: 'active' },
      { scenario_code: 'SCENARIO_DISPATCH_QUERY', scenario_name: '工单查询', module_code: 'DISPATCH', module_name: '调度管理', level: 1, sort_order: 3, status: 'active' },
      { scenario_code: 'SCENARIO_DISPATCH_CONFIG', scenario_name: '工单配置', module_code: 'DISPATCH', module_name: '调度管理', level: 1, sort_order: 4, status: 'active' },

      // 工作台场景
      { scenario_code: 'SCENARIO_WORKSPACE_HOME', scenario_name: '工作台首页', module_code: 'WORKSPACE', module_name: '工作台', level: 1, sort_order: 1, status: 'active' },
      { scenario_code: 'SCENARIO_CHURN_TREE', scenario_name: '离网维系指标树', module_code: 'WORKSPACE', module_name: '工作台', level: 1, sort_order: 2, status: 'active' },
      { scenario_code: 'SCENARIO_MARKET_OVERVIEW', scenario_name: '市场总览', module_code: 'WORKSPACE', module_name: '工作台', level: 1, sort_order: 3, status: 'active' },
    ];

    for (const scenario of scenarios) {
      const { error } = await supabase
        .from('business_scenarios')
        .upsert(scenario, { onConflict: 'scenario_code' });

      if (error) {
        errorCount++;
        errors.push(`场景 ${scenario.scenario_name}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    // 3. 插入页面
    const pages = [
      // 门户首页
      { page_code: 'PAGE_PORTAL_HOME', page_name: '门户首页', page_type: 'PORTAL', page_path: '/', scenario_code: 'SCENARIO_PORTAL_HOME', module_code: 'PORTAL', is_tree_page: false, sort_order: 1 },
      { page_code: 'PAGE_PORTAL_OVERVIEW', page_name: '运营总览', page_type: 'OVERVIEW', page_path: '/portal', scenario_code: 'SCENARIO_PORTAL_OVERVIEW', module_code: 'PORTAL', is_tree_page: false, sort_order: 2 },

      // 离网维系页面
      { page_code: 'PAGE_CHURN_RETENTION', page_name: '离网维系', page_type: 'OVERVIEW', page_path: '/portal/churn-retention', scenario_code: 'SCENARIO_CHURN_OVERVIEW', module_code: 'CHURN_RETENTION', is_tree_page: false, sort_order: 1 },
      { page_code: 'PAGE_CHURN_ALL', page_name: '当月全量客户离网客户数指标树', page_type: 'TREE', page_path: '/portal/churn-retention#all-churn', scenario_code: 'SCENARIO_CHURN_ALL', module_code: 'CHURN_RETENTION', is_tree_page: true, sort_order: 2 },
      { page_code: 'PAGE_CHURN_MID_HIGH', page_name: '当月拍照中高端客户离网客户数指标树', page_type: 'TREE', page_path: '/portal/churn-retention#mid-high-churn', scenario_code: 'SCENARIO_CHURN_MID_HIGH', module_code: 'CHURN_RETENTION', is_tree_page: true, sort_order: 3 },
      { page_code: 'PAGE_CHURN_GLOBAL', page_name: '当月拍照全球通客户离网客户数指标树', page_type: 'TREE', page_path: '/portal/churn-retention#global-churn', scenario_code: 'SCENARIO_CHURN_GLOBAL', module_code: 'CHURN_RETENTION', is_tree_page: true, sort_order: 4 },

      // 中高端客户运营页面
      { page_code: 'PAGE_MID_HIGH_CUSTOMER', page_name: '中高端客户运营', page_type: 'OVERVIEW', page_path: '/portal/mid-high-customer-operations', scenario_code: 'SCENARIO_MID_HIGH_OVERVIEW', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: false, sort_order: 1 },
      { page_code: 'PAGE_MID_HIGH_VALUE', page_name: '拍照中高端价值保有率指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#tree', scenario_code: 'SCENARIO_MID_HIGH_VALUE', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 2 },
      { page_code: 'PAGE_OVER_PLAN', page_name: '超套客户规模指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#over-plan', scenario_code: 'SCENARIO_OVER_PLAN', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 3 },
      { page_code: 'PAGE_BROADBAND_MOBILE', page_name: '宽移融合率指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#broadband-mobile', scenario_code: 'SCENARIO_BROADBAND_MOBILE', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 4 },
      { page_code: 'PAGE_INTERNET_ROAMING', page_name: '国际漫游客户指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#internet-roaming', scenario_code: 'SCENARIO_INTERNET_ROAMING', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 5 },
      { page_code: 'PAGE_SEGMENT_MARKET', page_name: '细分市场客群指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#segment-market', scenario_code: 'SCENARIO_SEGMENT_MARKET', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 6 },
      { page_code: 'PAGE_FAMILY_BROADBAND', page_name: '家庭宽带业务指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#family-broadband', scenario_code: 'SCENARIO_FAMILY_BROADBAND', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 7 },
      { page_code: 'PAGE_5G_CUSTOMER', page_name: '5G用户发展指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#5g-customer', scenario_code: 'SCENARIO_5G_CUSTOMER', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 8 },
      { page_code: 'PAGE_ENTERPRISE', page_name: '政企客户指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#enterprise', scenario_code: 'SCENARIO_ENTERPRISE', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 9 },
      { page_code: 'PAGE_CHANNEL', page_name: '渠道运营指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#channel', scenario_code: 'SCENARIO_CHANNEL', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 10 },
      { page_code: 'PAGE_SATISFACTION', page_name: '客户满意度指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#satisfaction', scenario_code: 'SCENARIO_SATISFACTION', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 11 },
      { page_code: 'PAGE_VALUE_ADDED', page_name: '增值业务指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#value-added', scenario_code: 'SCENARIO_VALUE_ADDED', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 12 },
      { page_code: 'PAGE_INTERNET_BUSINESS', page_name: '国际业务收入指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#internet-business', scenario_code: 'SCENARIO_INTERNET_BUSINESS', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 13 },
      { page_code: 'PAGE_STOCK_CUSTOMER', page_name: '存量客户运营指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#stock-customer', scenario_code: 'SCENARIO_STOCK_CUSTOMER', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 14 },
      { page_code: 'PAGE_NEW_BUSINESS', page_name: '新业务拓展指标树', page_type: 'TREE', page_path: '/portal/mid-high-customer-operations#new-business', scenario_code: 'SCENARIO_NEW_BUSINESS', module_code: 'MID_HIGH_CUSTOMER', is_tree_page: true, sort_order: 15 },

      // 策略管理页面
      { page_code: 'PAGE_STRATEGY_METRICS', page_name: '指标策略', page_type: 'LIST', page_path: '/workspace/strategy/metrics', scenario_code: 'SCENARIO_STRATEGY_METRICS', module_code: 'STRATEGY', is_tree_page: false, sort_order: 1 },
      { page_code: 'PAGE_STRATEGY_LIST', page_name: '策略列表', page_type: 'LIST', page_path: '/workspace/strategy/list', scenario_code: 'SCENARIO_STRATEGY_LIST', module_code: 'STRATEGY', is_tree_page: false, sort_order: 2 },

      // 调度管理页面
      { page_code: 'PAGE_DISPATCH_SUBMIT', page_name: '工单提交', page_type: 'FORM', page_path: '/workspace/dispatch/submit', scenario_code: 'SCENARIO_DISPATCH_SUBMIT', module_code: 'DISPATCH', is_tree_page: false, sort_order: 1 },
      { page_code: 'PAGE_DISPATCH_PROCESS', page_name: '工单处理', page_type: 'LIST', page_path: '/workspace/dispatch/process', scenario_code: 'SCENARIO_DISPATCH_PROCESS', module_code: 'DISPATCH', is_tree_page: false, sort_order: 2 },
      { page_code: 'PAGE_DISPATCH_QUERY', page_name: '工单查询', page_type: 'LIST', page_path: '/workspace/dispatch/query', scenario_code: 'SCENARIO_DISPATCH_QUERY', module_code: 'DISPATCH', is_tree_page: false, sort_order: 3 },
      { page_code: 'PAGE_DISPATCH_CONFIG_TYPE', page_name: '工单类型管理', page_type: 'FORM', page_path: '/workspace/dispatch/config/type', scenario_code: 'SCENARIO_DISPATCH_CONFIG', module_code: 'DISPATCH', is_tree_page: false, sort_order: 4 },
      { page_code: 'PAGE_DISPATCH_CONFIG_PROCESS', page_name: '流程配置', page_type: 'FORM', page_path: '/workspace/dispatch/config/process', scenario_code: 'SCENARIO_DISPATCH_CONFIG', module_code: 'DISPATCH', is_tree_page: false, sort_order: 5 },

      // 工作台页面
      { page_code: 'PAGE_WORKSPACE_HOME', page_name: '工作台首页', page_type: 'DASHBOARD', page_path: '/workspace', scenario_code: 'SCENARIO_WORKSPACE_HOME', module_code: 'WORKSPACE', is_tree_page: false, sort_order: 1 },
      { page_code: 'PAGE_CHURN_TREE_WORKSPACE', page_name: '离网维系指标树（工作台）', page_type: 'TREE', page_path: '/workspace/insight/churn/tree', scenario_code: 'SCENARIO_CHURN_TREE', module_code: 'WORKSPACE', is_tree_page: true, sort_order: 2 },
      { page_code: 'PAGE_MARKET_OVERVIEW_WORKSPACE', page_name: '市场总览（工作台）', page_type: 'OVERVIEW', page_path: '/workspace/insight/market/overview', scenario_code: 'SCENARIO_MARKET_OVERVIEW', module_code: 'WORKSPACE', is_tree_page: false, sort_order: 3 },
    ];

    for (const page of pages) {
      // 获取场景ID
      const { data: scenario } = await supabase
        .from('business_scenarios')
        .select('id, scenario_name, module_name')
        .eq('scenario_code', page.scenario_code)
        .single();

      if (!scenario) {
        errorCount++;
        errors.push(`页面 ${page.page_name}: 场景 ${page.scenario_code} 不存在`);
        continue;
      }

      // 获取模块名称
      const { data: module } = await supabase
        .from('modules')
        .select('module_name')
        .eq('module_code', page.module_code)
        .single();

      if (!module) {
        errorCount++;
        errors.push(`页面 ${page.page_name}: 模块 ${page.module_code} 不存在`);
        continue;
      }

      const { error } = await supabase
        .from('pages')
        .upsert({
          page_code: page.page_code,
          page_name: page.page_name,
          page_type: page.page_type,
          page_path: page.page_path,
          scenario_id: scenario.id,
          scenario_code: page.scenario_code,
          scenario_name: scenario.scenario_name,
          module_code: page.module_code,
          module_name: module.module_name,
          is_tree_page: page.is_tree_page,
          sort_order: page.sort_order,
          status: 'active',
        }, { onConflict: 'page_code' });

      if (error) {
        errorCount++;
        errors.push(`页面 ${page.page_name}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    // 4. 更新报告关联配置（使用新的page_code）
    const { data: oldAssociations } = await supabase
      .from('report_associations')
      .select('id, page_id');

    if (oldAssociations) {
      for (const association of oldAssociations) {
        let newPageId = association.page_id;

        // 映射旧的page_id到新的page_code
        const pageIdMap: Record<string, string> = {
          'portal.churn.all-churn': 'PAGE_CHURN_ALL',
          'portal.churn.mid-high-churn': 'PAGE_CHURN_MID_HIGH',
          'insight.churn.tree': 'PAGE_CHURN_TREE_WORKSPACE',
        };

        if (pageIdMap[association.page_id]) {
          newPageId = pageIdMap[association.page_id];

          // 获取新页面名称
          const { data: newPage } = await supabase
            .from('pages')
            .select('page_name')
            .eq('page_code', newPageId)
            .single();

          if (newPage) {
            const { error } = await supabase
              .from('report_associations')
              .update({
                page_id: newPageId,
                page_name: newPage.page_name,
              })
              .eq('id', association.id);

            if (error) {
              errorCount++;
              errors.push(`更新关联配置 ${association.id}: ${error.message}`);
            } else {
              successCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `初始化完成：成功 ${successCount} 条，失败 ${errorCount} 条`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('初始化页面数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取页面数据统计
 * GET /api/init-pages-data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // 获取模块数量
    const { count: moduleCount } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true });

    // 获取业务场景数量
    const { count: scenarioCount } = await supabase
      .from('business_scenarios')
      .select('*', { count: 'exact', head: true });

    // 获取页面数量
    const { count: pageCount } = await supabase
      .from('pages')
      .select('*', { count: 'exact', head: true });

    // 获取模块列表
    const { data: modules } = await supabase
      .from('modules')
      .select('module_code, module_name')
      .order('sort_order');

    // 获取每个模块的页面统计
    const moduleStats = await Promise.all(
      (modules || []).map(async (module) => {
        const { count } = await supabase
          .from('pages')
          .select('*', { count: 'exact', head: true })
          .eq('module_code', module.module_code);

        const { data: pages } = await supabase
          .from('pages')
          .select('page_code, page_name, page_type, is_tree_page')
          .eq('module_code', module.module_code)
          .order('sort_order');

        return {
          module: module.module_name,
          code: module.module_code,
          pageCount: count || 0,
          pages: pages || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        moduleCount: moduleCount || 0,
        scenarioCount: scenarioCount || 0,
        pageCount: pageCount || 0,
      },
      moduleStats,
    });
  } catch (error) {
    console.error('获取页面数据统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `获取统计失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
