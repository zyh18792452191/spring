import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 导出人员数据为CSV
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    let query = client.from('staff_management').select('*');

    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('region', { ascending: true });

    if (error) throw error;

    // CSV 头部
    const headers = [
      '工号',
      '姓名',
      '归属区域',
      '部门',
      '岗位',
      '手机号码',
      '邮箱',
      '状态',
      '4A账号',
      'OA账号',
      '省级平台账号',
      '创建时间',
    ];

    // 转换数据为CSV行
    const csvRows = [headers.join(',')];

    data?.forEach((item: any) => {
      const row = [
        item.employee_no || '',
        item.name || '',
        item.region || '',
        item.department || '',
        item.position || '',
        item.phone || '',
        item.email || '',
        item.status === 'active' ? '在职' : '离职',
        item.account_4a || '',
        item.account_oa || '',
        item.account_provincial || '',
        item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });

    // 添加BOM以支持Excel中文显示
    const BOM = '\uFEFF';
    const csvContent = BOM + csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="存量运营人员数据_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('导出失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '导出失败' },
      { status: 500 }
    );
  }
}
