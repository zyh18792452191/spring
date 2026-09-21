import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/pages/hierarchy
 * 获取场景-页面层级结构
 *
 * 新的层级结构：
 * - 顶层：独立页面（门户首页、工作台首页等，不关联场景）
 * - 一级：业务场景
 * - 二级：场景下的页面
 * - 三级：页面下的区域
 *
 * 返回格式：
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "PORTAL_HOME",
 *       name: "门户首页",
 *       level: 1,
 *       type: "page",
 *       pageId: 1,
 *       pageCode: "PAGE_PORTAL_HOME",
 *       pageName: "门户首页",
 *       pagePath: "/",
 *       children: [区域节点...]
 *     },
 *     {
 *       id: "SCENARIO_1",
 *       name: "市场运营",
 *       level: 1,
 *       type: "scenario",
 *       children: [
 *         {
 *           id: "SCENARIO_1_PAGE_1",
 *           name: "运营总览",
 *           level: 2,
 *           type: "page",
 *           pageId: 2,
 *           ...
 *           children: [区域节点...]
 *         }
 *       ]
 *     }
 *   ]
 *
 * 节点类型说明：
 * - scenario: 场景节点（可展开，包含页面）
 * - page: 页面节点（可关联报告，可以包含区域节点）
 * - section: 区域节点（页面下的子区域，可关联报告）
 */

// Fallback 页面树形结构数据（当数据库没有数据时使用）
const FALLBACK_PAGE_TREE = [
  // 门户首页（独立页面）
  {
    id: 'PORTAL_HOME',
    name: '门户首页',
    level: 1,
    type: 'page' as const,
    pageId: 'PAGE_PORTAL_HOME',
    pageCode: 'PAGE_PORTAL_HOME',
    pageName: '门户首页',
    pagePath: '/',
    pageType: 'PORTAL',
  },
  // 业务场景
  {
    id: 'SCENARIO_MARKET',
    name: '市场运营',
    level: 1,
    type: 'scenario' as const,
    children: [
      {
        id: 'SCENARIO_MARKET_PAGE_OVERVIEW',
        name: '运营总览',
        level: 2,
        type: 'page' as const,
        pageId: 'PAGE_PORTAL_OVERVIEW',
        pageCode: 'PAGE_PORTAL_OVERVIEW',
        pageName: '运营总览',
        pagePath: '/portal',
        pageType: 'OVERVIEW',
      },
      {
        id: 'SCENARIO_MARKET_PAGE_CUSTOMER',
        name: '中高端客户运营',
        level: 2,
        type: 'page' as const,
        pageId: 'PAGE_MID_HIGH_CUSTOMER',
        pageCode: 'PAGE_MID_HIGH_CUSTOMER',
        pageName: '中高端客户运营',
        pagePath: '/portal/mid-high-customer-operations',
        pageType: 'OVERVIEW',
        children: [
          {
            id: 'SECTION_OVERALL',
            name: '整体指标',
            level: 3,
            type: 'section' as const,
            pageId: 'PAGE_MID_HIGH_CUSTOMER',
            sectionId: 'SECTION_OVERALL',
            pageName: '中高端客户运营',
            sectionName: '整体指标',
          },
          {
            id: 'SECTION_VALUE',
            name: '价值提升',
            level: 3,
            type: 'section' as const,
            pageId: 'PAGE_MID_HIGH_CUSTOMER',
            sectionId: 'SECTION_VALUE',
            pageName: '中高端客户运营',
            sectionName: '价值提升',
          },
        ],
      },
    ],
  },
  // 工作台首页（独立页面）
  {
    id: 'WORKSPACE_HOME',
    name: '工作台首页',
    level: 1,
    type: 'page' as const,
    pageId: 'PAGE_WORKSPACE_HOME',
    pageCode: 'PAGE_WORKSPACE_HOME',
    pageName: '工作台首页',
    pagePath: '/workspace',
    pageType: 'DASHBOARD',
  },
];

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 读取所有活跃的页面
    const { data: pages, error: pagesError } = await client
      .from('pages')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      throw pagesError;
    }

    // 读取所有活跃的区域
    const { data: sections, error: sectionsError } = await client
      .from('page_sections')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching page sections:', sectionsError);
      throw sectionsError;
    }

    // 如果数据库没有页面数据，返回Fallback数据
    if (!pages || pages.length === 0) {
      console.log('No pages in database, returning fallback data');
      return NextResponse.json({
        success: true,
        data: FALLBACK_PAGE_TREE,
      });
    }

    // 构建页面到区域的映射
    const sectionsByPage = new Map<number, any[]>();
    sections?.forEach((section) => {
      const pageId = section.page_id;
      if (!sectionsByPage.has(pageId)) {
        sectionsByPage.set(pageId, []);
      }
      sectionsByPage.get(pageId)?.push({
        id: `SECTION_${section.id}`,
        name: section.section_name,
        level: 3,
        type: 'section' as const,
        pageId: section.page_id,
        sectionId: section.id,
        pageName: section.page_id,
        sectionName: section.section_name,
      });
    });

    // 构建树形结构
    const tree: any[] = [];

    // 分离有场景的页面和无场景的独立页面
    const pagesWithScenario: any[] = [];
    const pagesWithoutScenario: any[] = [];

    pages.forEach((page) => {
      if (page.scenario_id) {
        pagesWithScenario.push(page);
      } else {
        pagesWithoutScenario.push(page);
      }
    });

    // 按场景分组有场景的页面
    const scenariosMap = new Map<number | null, any>();
    pagesWithScenario.forEach((page) => {
      const scenarioId = page.scenario_id;
      if (!scenariosMap.has(scenarioId)) {
        scenariosMap.set(scenarioId, {
          id: `SCENARIO_${scenarioId}`,
          name: page.scenario_name || '未知场景',
          level: 1,
          type: 'scenario' as const,
          children: [],
        });
      }
      const scenarioNode = scenariosMap.get(scenarioId);

      // 构建页面节点
      const pageNode: any = {
        id: `SCENARIO_${scenarioId}_PAGE_${page.id}`,
        name: page.page_name,
        level: 2,
        type: 'page' as const,
        pageId: page.id,
        pageCode: page.page_code,
        pageName: page.page_name,
        pagePath: page.page_path,
        pageType: page.page_type,
      };

      // 如果该页面有区域，添加区域节点
      const pageSections = sectionsByPage.get(page.id);
      if (pageSections && pageSections.length > 0) {
        pageNode.children = pageSections;
      }

      scenarioNode.children.push(pageNode);
    });

    // 将场景节点添加到树
    tree.push(...Array.from(scenariosMap.values()));

    // 添加独立页面到树
    pagesWithoutScenario.forEach((page) => {
      const pageNode: any = {
        id: `PAGE_${page.id}`,
        name: page.page_name,
        level: 1,
        type: 'page' as const,
        pageId: page.id,
        pageCode: page.page_code,
        pageName: page.page_name,
        pagePath: page.page_path,
        pageType: page.page_type,
      };

      // 如果该页面有区域，添加区域节点
      const pageSections = sectionsByPage.get(page.id);
      if (pageSections && pageSections.length > 0) {
        pageNode.children = pageSections;
      }

      tree.push(pageNode);
    });

    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('Error fetching page hierarchy:', error);
    // 如果出错，返回Fallback数据
    return NextResponse.json({
      success: true,
      data: FALLBACK_PAGE_TREE,
    });
  }
}
