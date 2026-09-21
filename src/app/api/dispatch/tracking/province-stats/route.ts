import { NextRequest, NextResponse } from 'next/server';

// 省份调度统计接口
interface ProvinceDispatchStats {
  province: string;
  totalOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  timeoutOrders: number;
  averageDuration: string;
  completionRate: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessType = searchParams.get('businessType') || 'all';
    const workOrderType = searchParams.get('workOrderType') || 'all';
    const createTimeType = searchParams.get('createTimeType') || 'all';
    const createTimeValue = searchParams.get('createTimeValue') || '';

    // 模拟新疆16地市分公司数据
    const mockData: ProvinceDispatchStats[] = [
      { province: '乌鲁木齐', totalOrders: 45, inProgressOrders: 8, completedOrders: 22, timeoutOrders: 3, averageDuration: '2.5小时', completionRate: '88.9%' },
      { province: '克拉玛依', totalOrders: 52, inProgressOrders: 10, completedOrders: 24, timeoutOrders: 3, averageDuration: '2.8小时', completionRate: '86.5%' },
      { province: '吐鲁番', totalOrders: 38, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.6小时', completionRate: '89.5%' },
      { province: '哈密', totalOrders: 35, inProgressOrders: 5, completedOrders: 19, timeoutOrders: 2, averageDuration: '2.3小时', completionRate: '91.4%' },
      { province: '昌吉', totalOrders: 42, inProgressOrders: 7, completedOrders: 22, timeoutOrders: 2, averageDuration: '2.4小时', completionRate: '90.5%' },
      { province: '博州', totalOrders: 26, inProgressOrders: 4, completedOrders: 14, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '89.5%' },
      { province: '巴州', totalOrders: 32, inProgressOrders: 5, completedOrders: 18, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '90.6%' },
      { province: '阿克苏', totalOrders: 56, inProgressOrders: 11, completedOrders: 27, timeoutOrders: 2, averageDuration: '2.9小时', completionRate: '85.7%' },
      { province: '克州', totalOrders: 22, inProgressOrders: 4, completedOrders: 11, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '87.2%' },
      { province: '喀什', totalOrders: 30, inProgressOrders: 5, completedOrders: 16, timeoutOrders: 1, averageDuration: '2.3小时', completionRate: '90.0%' },
      { province: '和田', totalOrders: 28, inProgressOrders: 5, completedOrders: 14, timeoutOrders: 1, averageDuration: '2.4小时', completionRate: '87.5%' },
      { province: '伊犁', totalOrders: 24, inProgressOrders: 4, completedOrders: 13, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '89.4%' },
      { province: '塔城', totalOrders: 20, inProgressOrders: 3, completedOrders: 11, timeoutOrders: 1, averageDuration: '2.0小时', completionRate: '89.0%' },
      { province: '阿勒泰', totalOrders: 18, inProgressOrders: 3, completedOrders: 10, timeoutOrders: 1, averageDuration: '2.0小时', completionRate: '89.4%' },
      { province: '奎屯', totalOrders: 33, inProgressOrders: 5, completedOrders: 18, timeoutOrders: 2, averageDuration: '2.3小时', completionRate: '88.6%' },
      { province: '石河子', totalOrders: 24, inProgressOrders: 4, completedOrders: 13, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '88.9%' },
    ];

    return NextResponse.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('获取省份调度统计数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取省份调度统计数据失败',
      },
      { status: 500 }
    );
  }
}
