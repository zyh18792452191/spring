import { NextRequest, NextResponse } from 'next/server';

/**
 * 工单接口
 */
interface WorkOrder {
  id: string;
  orderNo: string;
  title: string;
  type: string; // 调度类型：指标调度、策略调度、客群调度、客户商机调度、客群商机调度、区域攻坚调度
  status: string; // pending(待办), processing(已办/进行中), completed(已完成)
  tab?: string; // 我发起的、待办、已办
  priority: string; // high, medium, low
  region: string;
  createdAt: string;
  completedAt?: string;
  timeoutStatus?: string; // 超时状态：正常、即将超时、已超时
}

/**
 * 生成模拟工单数据
 */
function generateMockOrders(count: number): WorkOrder[] {
  const regions = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];
  const titles = [
    '高价值潜在离网客户客群调度',
    '一降到底改善指标调度',
    '中高端客户保有率指标调度',
    '拍照中高端升档增收价值指标调度',
    '家庭宽带续费率改善策略调度',
    '5G套包升档指标调度',
    '流量包渗透率改善策略调度',
    '全球通保有率改善指标调度',
    '客户流失预警指标调度',
    '拍照离网客户规模改善策略调度',
    '中高端策略调度',
    '中高端客群调度',
    '离网维系策略调度',
    '离网维系客群调度',
    '中高端指标调度',
    '离网维系指标调度',
    '天山区流量攻坚区域攻坚调度',
    '沙依巴克区5G升级区域攻坚调度',
    '水磨沟区套餐升档区域攻坚调度'
  ];
  // 根据title中的关键词映射调度类型
  const dispatchTypes: Record<string, string> = {};
  titles.forEach(t => {
    if (t.includes('指标调度')) dispatchTypes[t] = '指标调度';
    else if (t.includes('策略调度')) dispatchTypes[t] = '策略调度';
    else if (t.includes('客群调度')) dispatchTypes[t] = '客群调度';
    else if (t.includes('客户商机调度')) dispatchTypes[t] = '客户商机调度';
    else if (t.includes('客群商机调度')) dispatchTypes[t] = '客群商机调度';
    else if (t.includes('区域攻坚调度')) dispatchTypes[t] = '区域攻坚调度';
    else dispatchTypes[t] = '指标调度';
  });
  const tabs = ['我发起的', '待办', '已办'];
  const statuses = ['pending', 'processing', 'completed'];
  const timeoutStatuses = ['正常', '即将超时', '已超时'];

  const orders: WorkOrder[] = [];

  // 为每个Tab生成前3条固定数据，确保显示三种超时状态，并覆盖客群调度/策略调度/区域攻坚调度三类
  const fixedOrders: { tab: string; status: string; timeoutStatus: string; titleIndex: number }[] = [
    // 我发起的 - 客群调度/策略调度/区域攻坚调度各1条
    { tab: '我发起的', status: 'completed', timeoutStatus: '正常', titleIndex: 0 },
    { tab: '我发起的', status: 'pending', timeoutStatus: '即将超时', titleIndex: 4 },
    { tab: '我发起的', status: 'processing', timeoutStatus: '已超时', titleIndex: 16 },
    // 待办 - 客群调度/策略调度/区域攻坚调度各1条
    { tab: '待办', status: 'pending', timeoutStatus: '正常', titleIndex: 11 },
    { tab: '待办', status: 'pending', timeoutStatus: '即将超时', titleIndex: 6 },
    { tab: '待办', status: 'pending', timeoutStatus: '已超时', titleIndex: 17 },
    // 已办 - 客群调度/策略调度/区域攻坚调度各1条
    { tab: '已办', status: 'processing', timeoutStatus: '正常', titleIndex: 13 },
    { tab: '已办', status: 'processing', timeoutStatus: '即将超时', titleIndex: 9 },
    { tab: '已办', status: 'processing', timeoutStatus: '已超时', titleIndex: 18 },
  ];

  // 生成固定数据，使用最新的日期以确保排在前面
  const now = new Date();
  for (let i = 0; i < fixedOrders.length; i++) {
    const fixed = fixedOrders[i];
    // 使用最新的日期，确保这些数据按时间排序后仍然在最前面
    const createdAt = new Date(now.getTime() - i * 1000); // 每条数据间隔1秒
    const createdAtStr = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')} ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}:${String(createdAt.getSeconds()).padStart(2, '0')}`;

    const order: WorkOrder = {
      id: `o${String(i + 1).padStart(3, '0')}`,
      orderNo: `00048${String(5000000 + i).slice(1, 7)}`,
      title: titles[fixed.titleIndex],
      type: dispatchTypes[titles[fixed.titleIndex]] || '指标调度',
      status: fixed.status,
      tab: fixed.tab,
      priority: '',
      region: regions[i % regions.length],
      createdAt: createdAtStr,
      timeoutStatus: fixed.timeoutStatus,
    };

    if (fixed.status === 'completed') {
      const completedAt = new Date(createdAt);
      completedAt.setDate(completedAt.getDate() + Math.floor(Math.random() * 5));
      order.completedAt = `${completedAt.getFullYear()}-${String(completedAt.getMonth() + 1).padStart(2, '0')}-${String(completedAt.getDate()).padStart(2, '0')} ${String(completedAt.getHours()).padStart(2, '0')}:${String(completedAt.getMinutes()).padStart(2, '0')}`;
    }

    orders.push(order);
  }

  // 生成剩余的随机数据
  for (let i = fixedOrders.length; i < count; i++) {
    const tab = tabs[i % 3]; // 均匀分布到三个Tab
    let status: string;
    
    // 根据Tab确定状态
    if (tab === '待办') {
      status = 'pending';
    } else if (tab === '已办') {
      status = 'processing';
    } else { // 我发起的
      status = statuses[Math.floor(Math.random() * statuses.length)];
    }

    // 所有工单都有超时状态
    let timeoutStatus: string;
    if (status === 'pending' || status === 'processing') {
      // 待办和处理中的工单，10%的概率超时
      if (Math.random() > 0.1) {
        timeoutStatus = '正常';
      } else {
        timeoutStatus = timeoutStatuses[Math.floor(Math.random() * 3)];
      }
    } else {
      // 已完成的工单，默认为正常
      timeoutStatus = '正常';
    }

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    const createdAtStr = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')} ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`;

    const title = titles[Math.floor(Math.random() * titles.length)];
    const order: WorkOrder = {
      id: `o${String(i + 1).padStart(3, '0')}`,
      orderNo: `00048${String(5000000 + i).slice(1, 7)}`,
      title: title,
      type: dispatchTypes[title] || '指标调度',
      status: status,
      tab: tab,
      priority: '',
      region: regions[Math.floor(Math.random() * regions.length)],
      createdAt: createdAtStr,
      timeoutStatus: timeoutStatus,
    };

    if (status === 'completed') {
      const completedAt = new Date(createdAt);
      completedAt.setDate(completedAt.getDate() + Math.floor(Math.random() * 5));
      order.completedAt = `${completedAt.getFullYear()}-${String(completedAt.getMonth() + 1).padStart(2, '0')}-${String(completedAt.getDate()).padStart(2, '0')} ${String(completedAt.getHours()).padStart(2, '0')}:${String(completedAt.getMinutes()).padStart(2, '0')}`;
    }

    orders.push(order);
  }

  return orders;
}

/**
 * 获取最近工单列表
 * GET /api/dispatch/overview/orders
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const region = searchParams.get('region') || 'all';
    const tab = searchParams.get('tab') || '待办'; // 默认显示待办

    // 生成100条模拟工单数据
    let allOrders = generateMockOrders(100);

    // 根据Tab筛选
    if (tab) {
      allOrders = allOrders.filter(order => order.tab === tab);
    }

    // 根据状态筛选
    if (status) {
      allOrders = allOrders.filter(order => order.status === status);
    }

    // 根据区域筛选
    if (region !== 'all') {
      allOrders = allOrders.filter(order => order.region === region);
    }

    // 按创建时间倒序排序
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 限制返回数量
    const orders = allOrders.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: orders,
      total: allOrders.length,
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取工单列表失败',
      },
      { status: 500 }
    );
  }
}
