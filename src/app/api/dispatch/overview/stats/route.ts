import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取调度总览统计数据
 * GET /api/dispatch/overview/stats
 */
export async function GET(request: NextRequest) {
  try {
    // 从URL参数中获取区域筛选
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region') || 'all';

    // 获取存量运营人员统计数据
    const staffStats = await fetchStaffStats();

    // 获取工单统计数据（模拟数据，实际应该从数据库获取）
    const orderStats = await fetchOrderStats(region);

    // 获取调度任务统计数据（模拟数据，实际应该从数据库获取）
    const taskStats = await fetchTaskStats(region);

    const result = {
      success: true,
      data: {
        totalOrders: orderStats.total,
        pendingOrders: orderStats.pending,
        ongoingTasks: taskStats.ongoing,
        totalStaff: staffStats.totalCount,
        activeStaff: staffStats.activeCount,
        inactiveStaff: staffStats.inactiveCount,
        completedToday: taskStats.completedToday,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取调度总览统计数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取统计数据失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取存量运营人员统计数据
 */
async function fetchStaffStats() {
  try {
    // 使用相对路径，避免环境变量问题
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/staff-management/stats`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        totalCount: result.data.total || 0,
        activeCount: result.data.active || 0,
        inactiveCount: result.data.inactive || 0,
      };
    }
    
    return {
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
    };
  } catch (error) {
    console.error('获取人员统计数据失败:', error);
    return {
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
    };
  }
}

/**
 * 获取工单统计数据（模拟数据）
 */
async function fetchOrderStats(region: string) {
  // 实际应用中应该从数据库查询工单数据
  // 这里返回模拟数据用于演示，数据与工单列表、工单综合查询保持一致
  const basePending = region === 'all' ? 322 : 30;  // 待办：322（与工单列表一致）
  const baseTotal = region === 'all' ? 630 : 100;    // 总工单量：630（与工单综合查询一致）
  const variance = Math.floor(Math.random() * 20);

  return {
    total: baseTotal,
    pending: basePending,
    processing: Math.floor(Math.random() * 30) + 20,  // 在途：约242
    completed: Math.floor(Math.random() * 50) + 30,
  };
}

/**
 * 获取调度任务统计数据（模拟数据）
 */
async function fetchTaskStats(region: string) {
  // 实际应用中应该从数据库查询调度任务数据
  // 这里返回模拟数据用于演示
  const baseOngoing = region === 'all' ? 25 : 15;
  const variance = Math.floor(Math.random() * 15);
  
  return {
    ongoing: baseOngoing + variance,
    completedToday: Math.floor(Math.random() * 40) + 15,
    totalCompleted: Math.floor(Math.random() * 100) + 50,
  };
}
