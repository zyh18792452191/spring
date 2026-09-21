import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 初始化默认页面区域数据
 * POST /api/init-page-sections-data
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 找到"中高端客户运营"页面
    const { data: page, error: pageError } = await client
      .from('pages')
      .select('*')
      .eq('page_code', 'PAGE_MID_HIGH_CUSTOMER')
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page PAGE_MID_HIGH_CUSTOMER not found',
        },
        { status: 404 }
      );
    }

    // 检查是否已经有区域数据
    const { count: existingCount } = await client
      .from('page_sections')
      .select('*', { count: 'exact', head: true })
      .eq('page_id', page.id);

    if (existingCount && existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Page already has sections data. Delete existing sections first.',
      });
    }

    // 默认区域数据
    const defaultSections = [
      {
        page_id: page.id,
        section_code: 'SECTION_OVERALL',
        section_name: '整体指标',
        section_type: 'METRIC',
        section_config: null,
        sort_order: 1,
        status: 'active',
      },
      {
        page_id: page.id,
        section_code: 'SECTION_VALUE',
        section_name: '价值提升',
        section_type: 'METRIC',
        section_config: null,
        sort_order: 2,
        status: 'active',
      },
      {
        page_id: page.id,
        section_code: 'SECTION_SCALE',
        section_name: '规模发展',
        section_type: 'METRIC',
        section_config: null,
        sort_order: 3,
        status: 'active',
      },
      {
        page_id: page.id,
        section_code: 'SECTION_FUSION',
        section_name: '融合加固',
        section_type: 'METRIC',
        section_config: null,
        sort_order: 4,
        status: 'active',
      },
      {
        page_id: page.id,
        section_code: 'SECTION_CUST',
        section_name: '客群看管',
        section_type: 'METRIC',
        section_config: null,
        sort_order: 5,
        status: 'active',
      },
    ];

    // 批量插入区域数据
    const { data, error } = await client
      .from('page_sections')
      .insert(defaultSections)
      .select();

    if (error) {
      console.error('Error inserting page sections:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully initialized ${data?.length || 0} page sections`,
      data,
    });
  } catch (error) {
    console.error('Error initializing page sections data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize page sections data',
      },
      { status: 500 }
    );
  }
}
