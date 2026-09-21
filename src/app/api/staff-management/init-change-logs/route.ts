import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const CHANGE_LOG_TEMPLATES = [
  {
    operation_type: 'create',
    operation_content: '新增员工 张三，工号：BJ1001，所属部门：市场部'
  },
  {
    operation_type: 'update',
    operation_content: '修改员工 李四信息：更新了职位信息'
  },
  {
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 50 条'
  },
  {
    operation_type: 'update',
    operation_content: '员工 王五状态变更：在职'
  },
  {
    operation_type: 'update',
    operation_content: '员工 赵六部门调整：网络部 → 市场部'
  },
  {
    operation_type: 'create',
    operation_content: '新增员工 刘七，工号：SH1002，所属部门：政企客户部'
  },
  {
    operation_type: 'update',
    operation_content: '修改员工 陈八信息：更新了联系方式'
  },
  {
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 100 条'
  },
  {
    operation_type: 'update',
    operation_content: '员工 杨九状态变更：离职'
  },
  {
    operation_type: 'create',
    operation_content: '新增员工 周十，工号：GD1003，所属部门：网络部'
  },
  {
    operation_type: 'update',
    operation_content: '员工 吴十一信息：更新了岗位信息'
  },
  {
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 200 条'
  },
];

const ALL_PROVINCES = [
  '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉',
  '博州', '巴州', '阿克苏', '克州', '喀什',
  '和田', '伊犁', '塔城', '阿勒泰',

];

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 先清空现有日志
    await client
      .from('staff_change_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const logs = [];
    const now = new Date();

    // 生成过去30天的变更日志
    for (let i = 0; i < 20; i++) {
      const template = CHANGE_LOG_TEMPLATES[Math.floor(Math.random() * CHANGE_LOG_TEMPLATES.length)];
      const region = ALL_PROVINCES[Math.floor(Math.random() * ALL_PROVINCES.length)];
      const content = template.operation_content;

      // 生成随机时间（过去30天内）
      const randomDays = Math.floor(Math.random() * 30);
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      const logTime = new Date(
        now.getTime() - randomDays * 24 * 60 * 60 * 1000
        - randomHours * 60 * 60 * 1000
        - randomMinutes * 60 * 1000
      );

      const log = {
        id: crypto.randomUUID(),
        employee_no: `EMP${(Math.floor(Math.random() * 90000) + 10000).toString()}`,
        region,
        operation_type: template.operation_type,
        operation_content: content,
        operator: ['管理员', '系统导入', '人力资源部', '部门经理'][Math.floor(Math.random() * 4)],
        operation_time: logTime.toISOString(),
      };

      logs.push(log);
    }

    // 按时间倒序排序
    logs.sort((a, b) => new Date(b.operation_time).getTime() - new Date(a.operation_time).getTime());

    // 逐条插入
    let successCount = 0;
    for (const log of logs) {
      try {
        const { error } = await client.from('staff_change_logs').insert(log);

        if (error) {
          console.error(`插入日志失败:`, error);
        } else {
          successCount++;
        }
      } catch (e) {
        console.error(`插入日志异常:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功初始化 ${successCount} 条变更日志`,
      data: {
        total: successCount,
      },
    });
  } catch (error: any) {
    console.error('初始化变更日志失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '初始化变更日志失败' },
      { status: 500 }
    );
  }
}
