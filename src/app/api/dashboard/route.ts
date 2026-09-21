import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    camps: 12,
    equipment: 348,
    personnel: 86,
    pending: 7,
    revenue: 128500,
    visitors: 2456,
    satisfaction: 4.8,
  };

  return NextResponse.json({
    success: true,
    data,
    message: '获取仪表盘数据成功',
  });
}
