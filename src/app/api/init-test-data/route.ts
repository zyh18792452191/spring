import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * POST /api/init-test-data
 * 初始化测试数据（仅用于开发环境）
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 插入报告模板
    const templates = [
      { template_code: 'TPL_001', template_name: '中高端客户运营分析模板', template_type: 'monthly', description: '中高端客户运营分析报告模板', business_scenario: 'mid_high_customer', status: 'active', sort_order: 1 },
      { template_code: 'TPL_002', template_name: '离网维系分析模板', template_type: 'monthly', description: '离网维系分析报告模板', business_scenario: 'churn_retention', status: 'active', sort_order: 2 },
      { template_code: 'TPL_003', template_name: '客户保有率分析模板', template_type: 'monthly', description: '客户保有率分析报告模板', business_scenario: 'customer_retention', status: 'active', sort_order: 3 },
    ];

    for (const template of templates) {
      const { data, error } = await client
        .from('report_templates')
        .upsert(template, { onConflict: 'template_code' });

      if (error) {
        console.error('Error inserting template:', template.template_code, error);
      } else {
        console.log('Inserted template:', template.template_code);
      }
    }

    // 获取模板ID
    const { data: templateData } = await client
      .from('report_templates')
      .select('id, template_code');

    const templateMap: any = {};
    if (templateData) {
      templateData.forEach((t: any) => {
        templateMap[t.template_code] = t.id;
      });
    }

    // 插入报告
    const reports = [
      { report_code: 'RPT_001', report_name: '中高端客户运营分析报告 - 2025年1月', template_id: templateMap['TPL_001'], report_type: '月报', report_period: '2025-01', status: 'generated', metadata: { tags: ['中高端', '客户运营'] }, sort_order: 1 },
      { report_code: 'RPT_002', report_name: '离网维系分析报告 - 2025年1月', template_id: templateMap['TPL_002'], report_type: '月报', report_period: '2025-01', status: 'generated', metadata: { tags: ['离网', '维系'] }, sort_order: 2 },
      { report_code: 'RPT_003', report_name: '客户保有率分析报告 - 2025年1月', template_id: templateMap['TPL_003'], report_type: '月报', report_period: '2025-01', status: 'generated', metadata: { tags: ['保有率'] }, sort_order: 3 },
    ];

    for (const report of reports) {
      const { data, error } = await client
        .from('reports')
        .upsert(report, { onConflict: 'report_code' });

      if (error) {
        console.error('Error inserting report:', report.report_code, error);
      } else {
        console.log('Inserted report:', report.report_code);
      }
    }

    // 获取报告ID
    const { data: reportData } = await client
      .from('reports')
      .select('id, report_code');

    const reportMap: any = {};
    if (reportData) {
      reportData.forEach((r: any) => {
        reportMap[r.report_code] = r.id;
      });
    }

    // 插入报告关联配置
    const associations = [
      { report_id: reportMap['RPT_002'], association_type: 'page', page_id: 'portal.churn.all-churn', is_default: true, display_priority: 1 },
      { report_id: reportMap['RPT_001'], association_type: 'page', page_id: 'portal.churn.mid-high-churn', is_default: true, display_priority: 1 },
      { report_id: reportMap['RPT_002'], association_type: 'page', page_id: 'insight.churn.tree', is_default: true, display_priority: 1 },
    ];

    for (const assoc of associations) {
      const { data, error } = await client
        .from('report_associations')
        .upsert(assoc, { onConflict: 'report_id,page_id' });

      if (error) {
        console.error('Error inserting association:', assoc.page_id, error);
      } else {
        console.log('Inserted association:', assoc.page_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test data initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing test data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize test data',
      },
      { status: 500 }
    );
  }
}
