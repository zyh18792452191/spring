import { NextRequest, NextResponse } from 'next/server';

// GET - 获取工号选项（从外系统同步，模拟数据）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // 模拟外系统的人员数据
    const externalSystemEmployees = [
      { employeeNo: 'BJ001', name: '张三', region: '乌鲁木齐', department: '运营部', position: '运营专员' },
      { employeeNo: 'BJ002', name: '李四', region: '乌鲁木齐', department: '市场部', position: '市场经理' },
      { employeeNo: 'SH001', name: '王五', region: '克拉玛依', department: '运营部', position: '运营主管' },
      { employeeNo: 'SH002', name: '赵六', region: '克拉玛依', department: '技术部', position: '技术支持' },
      { employeeNo: 'GD001', name: '孙七', region: '吐鲁番', department: '运营部', position: '运营总监' },
      { employeeNo: 'GD002', name: '周八', region: '吐鲁番', department: '市场部', position: '市场专员' },
      { employeeNo: 'ZJ001', name: '吴九', region: '昌吉', department: '运营部', position: '运营经理' },
      { employeeNo: 'ZJ002', name: '郑十', region: '昌吉', department: '客服部', position: '客服主管' },
      { employeeNo: 'JS001', name: '钱一', region: '哈密', department: '运营部', position: '运营专员' },
      { employeeNo: 'JS002', name: '陈二', region: '哈密', department: '销售部', position: '销售经理' },
      { employeeNo: 'HB001', name: '林三', region: '喀什', department: '运营部', position: '运营主管' },
      { employeeNo: 'HB002', name: '黄四', region: '喀什', department: '市场部', position: '市场总监' },
      { employeeNo: 'HN001', name: '杨五', region: '伊犁', department: '运营部', position: '运营经理' },
      { employeeNo: 'HN002', name: '朱六', region: '伊犁', department: '技术部', position: '技术经理' },
      { employeeNo: 'SD001', name: '马七', region: '博州', department: '运营部', position: '运营总监' },
      { employeeNo: 'SD002', name: '胡八', region: '博州', department: '客服部', position: '客服经理' },
    ];

    // 搜索过滤
    let filteredEmployees = externalSystemEmployees;
    if (query) {
      const queryLower = query.toLowerCase();
      filteredEmployees = externalSystemEmployees.filter(
        emp =>
          emp.employeeNo.toLowerCase().includes(queryLower) ||
          emp.name.toLowerCase().includes(queryLower) ||
          emp.region.toLowerCase().includes(queryLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredEmployees,
    });
  } catch (error: any) {
    console.error('获取工号选项失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取工号选项失败' },
      { status: 500 }
    );
  }
}
