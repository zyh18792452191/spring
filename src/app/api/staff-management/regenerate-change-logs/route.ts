import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 重新生成所有人员数据的变更日志
 * POST /api/staff-management/regenerate-change-logs
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 先清空现有日志
    await client
      .from('staff_change_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // 获取所有人员数据（分批处理）
    let allStaff: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: fetchError } = await client
        .from('staff_management')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (fetchError) {
        throw new Error(`获取人员数据失败: ${fetchError.message}`);
      }

      if (!batch || batch.length === 0) {
        hasMore = false;
      } else {
        allStaff = allStaff.concat(batch);
        page++;
        if (batch.length < pageSize) {
          hasMore = false;
        }
      }
    }

    console.log(`获取到 ${allStaff.length} 条人员数据`);

    // 生成变更日志
    const changeLogs: any[] = [];
    const now = new Date();

    // 1. 为每个人员生成一条"创建"类型的变更日志
    for (const staff of allStaff) {
      const createTime = staff.created_at || now;

      // 生成随机创建时间（过去30-90天内）
      const randomDays = Math.floor(Math.random() * 60) + 30;
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      const logTime = new Date(
        now.getTime() - randomDays * 24 * 60 * 60 * 1000
        - randomHours * 60 * 60 * 1000
        - randomMinutes * 60 * 1000
      );

      changeLogs.push({
        id: crypto.randomUUID(),
        staff_id: staff.id,
        employee_no: staff.employee_no,
        region: staff.region,
        operation_type: 'create',
        operation_content: `新增员工 ${staff.name}，工号：${staff.employee_no}，所属部门：${staff.department}`,
        operator: staff.created_by || '系统导入',
        operation_time: logTime.toISOString(),
      });
    }

    // 2. 为最近修改的人员生成"更新"类型的变更日志
    // 假设前20%的人员有过更新
    const updateCount = Math.floor(allStaff.length * 0.2);
    for (let i = 0; i < updateCount; i++) {
      const staff = allStaff[i];
      if (!staff) continue;

      const updateType = ['部门调整', '职位变更', '状态变更', '联系方式更新'][Math.floor(Math.random() * 4)];
      let operationContent = '';

      switch (updateType) {
        case '部门调整':
          const oldDepts = ['市场部', '运营部', '客户服务部', '政企客户部'];
          const oldDept = oldDepts[Math.floor(Math.random() * oldDepts.length)];
          operationContent = `员工 ${staff.name}部门调整：${oldDept} → ${staff.department}`;
          break;
        case '职位变更':
          operationContent = `员工 ${staff.name}职位变更：更新为 ${staff.position}`;
          break;
        case '状态变更':
          operationContent = `员工 ${staff.name}状态变更：${staff.status === 'active' ? '在职' : '离职'}`;
          break;
        case '联系方式更新':
          operationContent = `员工 ${staff.name}信息更新：更新了联系方式`;
          break;
      }

      // 更新时间在创建时间之后
      const createTime = new Date(changeLogs.find(l => l.employee_no === staff.employee_no)?.created_at || now);
      const randomDays = Math.floor(Math.random() * 15);
      const randomHours = Math.floor(Math.random() * 24);
      const updateTime = new Date(
        createTime.getTime() + randomDays * 24 * 60 * 60 * 1000
        + randomHours * 60 * 60 * 1000
      );

      changeLogs.push({
        id: crypto.randomUUID(),
        staff_id: staff.id,
        employee_no: staff.employee_no,
        region: staff.region,
        operation_type: 'update',
        operation_content: operationContent,
        operator: ['部门经理', '人力资源部', '系统更新'][Math.floor(Math.random() * 3)],
        operation_time: updateTime.toISOString(),
      });
    }

    // 3. 生成"导入"类型的变更日志（模拟批量导入）
    const importLogs = [
      { count: 100, region: '全国' },
      { count: 200, region: '全国' },
      { count: 500, region: '全国' },
    ];

    for (const importLog of importLogs) {
      const randomDays = Math.floor(Math.random() * 20) + 10;
      const importTime = new Date(
        now.getTime() - randomDays * 24 * 60 * 60 * 1000
      );

      changeLogs.push({
        id: crypto.randomUUID(),
        staff_id: null,
        employee_no: 'BATCH_IMPORT',
        region: importLog.region,
        operation_type: 'import',
        operation_content: `批量导入人员数据，成功导入 ${importLog.count} 条`,
        operator: '系统导入',
        operation_time: importTime.toISOString(),
      });
    }

    // 按时间排序
    changeLogs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 批量插入变更日志（分批处理）
    const batchSize = 100;
    let insertedCount = 0;
    let errorCount = 0;

    // 先测试插入一条数据
    if (changeLogs.length > 0) {
      console.log('测试插入第一条数据...');
      const { error: firstError, data: firstData } = await client
        .from('staff_change_logs')
        .insert(changeLogs[0])
        .select();

      if (firstError) {
        console.error('插入第一条数据失败:', firstError);
        return NextResponse.json({
          success: false,
          error: `插入第一条数据失败: ${JSON.stringify(firstError)}`,
          sample: changeLogs[0],
        }, { status: 500 });
      } else {
        console.log('第一条数据插入成功');
        insertedCount++;
      }
    }

    for (let i = 1; i < changeLogs.length; i += batchSize) {
      const batch = changeLogs.slice(i, Math.min(i + batchSize, changeLogs.length));
      console.log(`正在插入第 ${i} 到 ${i + batch.length - 1} 条...`);

      const { error, data } = await client
        .from('staff_change_logs')
        .insert(batch)
        .select();

      if (error) {
        console.error(`插入变更日志失败 (批次 ${i}):`, error);
        errorCount += batch.length;
      } else {
        console.log(`成功插入 ${data?.length || 0} 条`);
        insertedCount += data?.length || 0;
      }
    }

    console.log(`总计: 成功插入 ${insertedCount} 条，失败 ${errorCount} 条`);

    return NextResponse.json({
      success: true,
      message: `成功生成 ${insertedCount} 条变更日志`,
      data: {
        total: changeLogs.length,
        inserted: insertedCount,
        createCount: changeLogs.filter(l => l.operation_type === 'create').length,
        updateCount: changeLogs.filter(l => l.operation_type === 'update').length,
        importCount: changeLogs.filter(l => l.operation_type === 'import').length,
        firstSample: changeLogs.length > 0 ? changeLogs[0] : null,
      },
    });
  } catch (error: any) {
    console.error('生成变更日志失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '生成变更日志失败' },
      { status: 500 }
    );
  }
}
