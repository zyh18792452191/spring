import { NextRequest, NextResponse } from 'next/server';

/**
 * 调度任务接口
 */
interface DispatchTask {
  id: string;
  title: string;
  status: string; // pending, in_progress, completed
  priority: string; // high, medium, low
  assignee: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * 获取最近调度任务列表
 * GET /api/dispatch/overview/tasks
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const region = searchParams.get('region') || 'all';

    // 模拟调度任务数据
    // 实际应用中应该从数据库查询
    const allTasks: DispatchTask[] = [
      { id: 't001', title: '中高端客户关怀任务', status: 'in_progress', priority: 'high', assignee: '张三', createdAt: '2024-01-15 09:30' },
      { id: 't002', title: '离网预警处理', status: 'in_progress', priority: 'high', assignee: '李四', createdAt: '2024-01-15 10:15' },
      { id: 't003', title: '用量异常分析', status: 'pending', priority: 'medium', assignee: '王五', createdAt: '2024-01-15 11:00' },
      { id: 't004', title: '融合套餐推广', status: 'completed', priority: 'medium', assignee: '赵六', createdAt: '2024-01-14 14:20', completedAt: '2024-01-15 09:00' },
      { id: 't005', title: '5G用户回访', status: 'pending', priority: 'low', assignee: '孙七', createdAt: '2024-01-15 11:30' },
      { id: 't006', title: '存量客户维系', status: 'in_progress', priority: 'high', assignee: '周八', createdAt: '2024-01-15 12:00' },
      { id: 't007', title: '套餐升级推广', status: 'pending', priority: 'medium', assignee: '吴九', createdAt: '2024-01-15 13:00' },
      { id: 't008', title: '宽带用户关怀', status: 'completed', priority: 'low', assignee: '郑十', createdAt: '2024-01-14 10:00', completedAt: '2024-01-14 16:00' },
      { id: 't009', title: '国际漫游提醒', status: 'pending', priority: 'medium', assignee: '钱十一', createdAt: '2024-01-15 14:00' },
      { id: 't010', title: '企业客户维系', status: 'in_progress', priority: 'high', assignee: '陈十二', createdAt: '2024-01-15 15:00' },
    ];

    // 根据状态筛选
    let filteredTasks = allTasks;
    if (status) {
      filteredTasks = allTasks.filter(task => task.status === status);
    }

    // 限制返回数量
    const tasks = filteredTasks.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: tasks,
      total: filteredTasks.length,
    });
  } catch (error) {
    console.error('获取调度任务列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取调度任务列表失败',
      },
      { status: 500 }
    );
  }
}
