import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 设置部分人员为离职状态（用于演示）
 * POST /api/staff-management/set-inactive-sample
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取前50名人员，设置为离职状态
    const { data: staffList, error } = await client
      .from('staff_management')
      .select('id, employee_no, name, region, department, status')
      .eq('status', 'active')
      .limit(50);

    if (error) {
      throw error;
    }

    if (!staffList || staffList.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有在职人员需要设置为离职',
        data: { updated: 0 },
      });
    }

    // 更新这些人员为离职状态
    let updatedCount = 0;
    const updatedStaff: any[] = [];

    for (const staff of staffList) {
      const { error: updateError } = await client
        .from('staff_management')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
          updated_by: 'system',
        })
        .eq('id', staff.id);

      if (updateError) {
        console.error(`更新 ${staff.name} 失败:`, updateError);
      } else {
        updatedCount++;
        updatedStaff.push({
          name: staff.name,
          employee_no: staff.employee_no,
          region: staff.region,
          department: staff.department,
        });

        // 记录变更日志
        await client.from('staff_change_logs').insert({
          staff_id: staff.id,
          employee_no: staff.employee_no,
          region: staff.region,
          operation_type: 'update',
          operation_content: `员工 ${staff.name}（工号：${staff.employee_no}）状态变更：在职 → 离职`,
          operator: '系统演示',
          operation_time: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功设置 ${updatedCount} 名人员为离职状态`,
      data: {
        updated: updatedCount,
        total: staffList.length,
        updatedStaff,
      },
    });
  } catch (error: any) {
    console.error('设置离职状态失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '设置离职状态失败' },
      { status: 500 }
    );
  }
}
