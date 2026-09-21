import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 为缺少数据的部门补充测试数据
 * POST /api/staff-management/supplement-departments
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 定义需要补充数据的部门和目标人数
    const targetDepartments = [
      { name: '融合运营中心', targetCount: 100 },
      { name: '客户价值运营指挥调度中心', targetCount: 50 },
    ];

    const newStaffData = [];

    // 生成测试数据
    for (const dept of targetDepartments) {
      const regions = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '克州'];

      for (let i = 0; i < dept.targetCount; i++) {
        const region = regions[i % regions.length];
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const regionCode = {
          '乌鲁木齐': 'BJ', '克拉玛依': 'SH', '吐鲁番': 'GD', '哈密': 'JS', '昌吉': 'ZJ',
          '博州': 'SD', '巴州': 'HN', '克州': 'SC'
        }[region] || 'XX';

        const employeeNo = `${regionCode}${randomNum.toString().padStart(4, '0')}`;
        const names = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨强', '赵敏', '黄磊', '周杰', '吴婷'];
        const name = names[i % names.length] + (Math.floor(Math.random() * 100));

        newStaffData.push({
          employee_no: employeeNo,
          name: name,
          region: region,
          department: dept.name,
          position: '运营专员',
          phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          email: `test${i}@example.com`,
          status: 'active',
          account_4a: null,
          account_oa: `${name}_oa`,
          account_provincial: `${name}_pro`,
          created_by: 'system',
          updated_by: 'system',
        });
      }
    }

    // 批量插入数据
    let successCount = 0;
    let failCount = 0;

    for (const staff of newStaffData) {
      const { data, error } = await client
        .from('staff_management')
        .insert(staff)
        .select()
        .single();

      if (error) {
        console.error(`插入 ${staff.name} 失败:`, error);
        failCount++;
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功补充 ${successCount} 条数据，失败 ${failCount} 条`,
      data: {
        successCount,
        failCount,
        total: newStaffData.length,
        departments: targetDepartments.map(d => ({
          name: d.name,
          targetCount: d.targetCount,
        })),
      },
    });
  } catch (error: any) {
    console.error('补充部门数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '补充部门数据失败' },
      { status: 500 }
    );
  }
}
