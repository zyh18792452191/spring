import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 更新部门名称 - 将旧部门名称映射到新的10个部门
 * POST /api/staff-management/migrate-departments
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 旧部门到新部门的映射
    const departmentMapping: Record<string, string> = {
      // 将各种旧的部门名称映射到新的10个部门
      '运营部': '存量运营中心',
      '运营二部': '客户运营中心',
      '运营三部': '融合运营中心',
      '市场部': '公众市场运营中心',
      '技术部': '产品客户运营中心',
      '政企客户部': '客户（品牌）运营中心',
      '网络部': '省存量运营团队',
      '客户服务部': '集中客户关系运营专班',
      '集团客户部': '存量运营中心',
      '渠道管理部': '客户运营中心',
      '终端管理部': '产品客户运营中心',
      '数据中心': '产品客户运营中心',
      '业务支撑中心': '融合及存量运营中心',
      '网络运维中心': '省存量运营团队',
      '客户服务中心': '集中客户关系运营专班',
    };

    // 分批获取所有人员数据（每批1000条）
    let allStaff: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: fetchError } = await client
        .from('staff_management')
        .select('id, employee_no, name, department')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (fetchError) {
        throw new Error(`获取人员数据失败: ${fetchError.message}`);
      }

      if (!batch || batch.length === 0) {
        hasMore = false;
      } else {
        allStaff = allStaff.concat(batch);
        page++;
        // 如果返回的数据少于页面大小，说明没有更多数据了
        if (batch.length < pageSize) {
          hasMore = false;
        }
      }
    }

    let updatedCount = 0;
    let skippedCount = 0;
    const updateDetails: Array<{ id: string; name: string; oldDept: string; newDept: string }> = [];

    // 更新每个人员的部门名称
    for (const staff of allStaff) {
      const oldDepartment = staff.department || '';
      let newDepartment: string | null = departmentMapping[oldDepartment];

      // 如果没有映射，则根据部门名称智能匹配
      if (!newDepartment) {
        newDepartment = matchDepartmentIntelligently(oldDepartment);
      }

      // 如果部门已经在正确的列表中或无法映射，则跳过
      if (!newDepartment || oldDepartment === newDepartment) {
        skippedCount++;
        continue;
      }

      // 更新部门名称
      const { error: updateError } = await client
        .from('staff_management')
        .update({
          department: newDepartment!,
          updated_at: new Date().toISOString(),
          updated_by: 'system',
        })
        .eq('id', staff.id);

      if (updateError) {
        console.error(`更新 ${staff.name} 的部门失败:`, updateError);
        skippedCount++;
      } else {
        updatedCount++;
        updateDetails.push({
          id: staff.id,
          name: staff.name,
          oldDept: oldDepartment,
          newDept: newDepartment,
        });
      }
    }

    // 重新生成变更日志
    await regenerateChangeLogs(client);

    return NextResponse.json({
      success: true,
      message: `成功更新 ${updatedCount} 条记录，跳过 ${skippedCount} 条记录`,
      data: {
        updated: updatedCount,
        skipped: skippedCount,
        total: allStaff.length,
        updateDetails: updateDetails.slice(0, 20), // 只返回前20条详情
      },
    });
  } catch (error: any) {
    console.error('更新部门名称失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新部门名称失败' },
      { status: 500 }
    );
  }
}

/**
 * 智能匹配部门名称
 */
function matchDepartmentIntelligently(departmentName: string): string | null {
  const newDepartments = [
    '存量运营中心',
    '客户运营中心',
    '融合运营中心',
    '客户（品牌）运营中心',
    '集中客户关系运营专班',
    '客户价值运营指挥调度中心',
    '公众市场运营中心',
    '省存量运营团队',
    '产品客户运营中心',
    '融合及存量运营中心',
  ];

  const name = departmentName.toLowerCase();

  // 根据关键词匹配
  if (name.includes('存量')) return '存量运营中心';
  if (name.includes('客户运营') && !name.includes('品牌')) return '客户运营中心';
  if (name.includes('融合')) return '融合运营中心';
  if (name.includes('品牌')) return '客户（品牌）运营中心';
  if (name.includes('专班')) return '集中客户关系运营专班';
  if (name.includes('指挥') || name.includes('调度')) return '客户价值运营指挥调度中心';
  if (name.includes('公众') || name.includes('市场')) return '公众市场运营中心';
  if (name.includes('省')) return '省存量运营团队';
  if (name.includes('产品')) return '产品客户运营中心';
  if (name.includes('及存量')) return '融合及存量运营中心';

  // 默认分配到存量运营中心
  return '存量运营中心';
}

/**
 * 重新生成变更日志
 */
async function regenerateChangeLogs(client: any) {
  try {
    // 清空现有变更日志
    await client.from('staff_change_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 获取所有人员数据
    const { data: allStaff } = await client
      .from('staff_management')
      .select('*');

    if (!allStaff) return;

    // 为每个人员创建一条变更日志（create类型）
    const changeLogs = allStaff.map((staff: any) => ({
      staff_id: staff.id,
      employee_no: staff.employee_no,
      change_type: 'create',
      change_details: JSON.stringify({
        message: '部门名称更新',
        oldValues: {},
        newValues: {
          name: staff.name,
          region: staff.region,
          department: staff.department,
          position: staff.position,
        },
      }),
      changed_by: 'system',
    }));

    // 批量插入变更日志（分批处理，避免超过限制）
    const batchSize = 100;
    for (let i = 0; i < changeLogs.length; i += batchSize) {
      const batch = changeLogs.slice(i, i + batchSize);
      await client.from('staff_change_logs').insert(batch);
    }
  } catch (error) {
    console.error('重新生成变更日志失败:', error);
  }
}
