import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * POST /api/pages/initialize
 * 初始化页面管理数据
 *
 * 从页面层级API获取数据并保存到pages表中
 */
export async function POST(request: NextRequest) {
  try {
    // 先获取页面层级数据
    const hierarchyResponse = await fetch('http://localhost:5000/api/pages/hierarchy');
    const hierarchyResult = await hierarchyResponse.json();

    if (!hierarchyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch page hierarchy',
        },
        { status: 500 }
      );
    }

    const client = getSupabaseClient();

    // 检查是否已有数据
    const { data: existingPages, error: checkError } = await client
      .from('pages')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing pages:', checkError);
      return NextResponse.json(
        {
          success: false,
          error: checkError.message,
        },
        { status: 500 }
      );
    }

    if (existingPages && existingPages.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Pages already initialized',
        data: {
          count: existingPages.length,
        },
      });
    }

    // 递归提取页面数据
    const extractPages = (
      nodes: any[],
      parentModuleCode?: string,
      parentModuleName?: string,
      parentScenarioId?: number,
      parentScenarioCode?: string,
      parentScenarioName?: string
    ): any[] => {
      const pages: any[] = [];

      nodes.forEach((node) => {
        if (node.type === 'page' && node.pageId) {
          // 这是一个页面节点，提取页面信息
          pages.push({
            page_code: node.pageCode || node.pageId,
            page_name: node.pageName || node.name,
            page_type: node.pageType || 'LIST',
            page_path: node.pagePath || '/',
            scenario_id: parentScenarioId || 1,
            scenario_code: parentScenarioCode || 'MARKET',
            scenario_name: parentScenarioName || '市场运营',
            module_code: parentModuleCode || 'MARKET',
            module_name: parentModuleName || '营销管理',
            is_tree_page: node.pageType === 'TREE',
            sort_order: 0,
            status: 'active',
          });
        }

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          // 如果当前节点是一个分类或场景，将其作为父场景信息
          const nextScenarioId = parentScenarioId;
          const nextScenarioCode = parentScenarioCode;
          const nextScenarioName = parentScenarioName;

          // 如果当前节点的level是3，它是一个场景
          if (node.level === 3) {
            // 这里我们需要将场景名称映射到业务场景
            // 由于没有直接的业务场景ID，我们暂时使用默认值
          }

          pages.push(...extractPages(
            node.children,
            parentModuleCode,
            parentModuleName,
            nextScenarioId,
            nextScenarioCode,
            nextScenarioName
          ));
        }
      });

      return pages;
    };

    // 从层级数据中提取页面
    const pagesToInsert = extractPages(hierarchyResult.data);

    if (pagesToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pages to insert',
        data: {
          count: 0,
        },
      });
    }

    // 插入数据
    const { data: insertedPages, error: insertError } = await client
      .from('pages')
      .insert(pagesToInsert)
      .select();

    if (insertError) {
      console.error('Error initializing pages:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pages initialized successfully',
      data: {
        count: insertedPages?.length || 0,
        pages: insertedPages,
      },
    });
  } catch (error) {
    console.error('Error initializing pages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize pages',
      },
      { status: 500 }
    );
  }
}
