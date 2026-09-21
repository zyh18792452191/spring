import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取页面区域列表
 * GET /api/page-sections
 * Query参数：
 * - pageId: 页面ID（必需）
 * - page: 页码（默认1）
 * - pageSize: 每页条数（默认10）
 * - status: 状态（可选）
 * - search: 搜索关键词（可选）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!pageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'pageId is required',
        },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 计算范围
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 获取总数
    let countQuery = client
      .from('page_sections')
      .select('*', { count: 'exact', head: true })
      .eq('page_id', pageId);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`section_name.ilike.%${search}%,section_code.ilike.%${search}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting page sections:', countError);
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
      .from('page_sections')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`section_name.ilike.%${search}%,section_code.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching page sections:', error);
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
      pagination: {
        page,
        pageSize,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/page-sections:', error);
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
 * 创建页面区域
 * POST /api/page-sections
 * Body参数：
 * - pageId: 页面ID（必需）
 * - sectionCode: 区域代码（必需）
 * - sectionName: 区域名称（必需）
 * - sectionType: 区域类型（可选，默认CONTENT）
 * - sectionConfig: 区域配置（可选，JSON字符串）
 * - sortOrder: 排序（可选，默认0）
 * - status: 状态（可选，默认active）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pageId,
      sectionCode,
      sectionName,
      sectionType = 'CONTENT',
      sectionConfig,
      sortOrder = 0,
      status = 'active',
    } = body;

    // 验证必需字段
    if (!pageId || !sectionCode || !sectionName) {
      return NextResponse.json(
        {
          success: false,
          error: 'pageId, sectionCode, and sectionName are required',
        },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查pageId是否存在
    const { data: page, error: pageError } = await client
      .from('pages')
      .select('id')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
        },
        { status: 404 }
      );
    }

    // 创建区域
    const { data, error } = await client
      .from('page_sections')
      .insert({
        page_id: pageId,
        section_code: sectionCode,
        section_name: sectionName,
        section_type: sectionType,
        section_config: sectionConfig,
        sort_order: sortOrder,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating page section:', error);
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
    console.error('Error in POST /api/page-sections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
