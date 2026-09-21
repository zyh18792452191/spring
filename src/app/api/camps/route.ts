import { NextResponse } from 'next/server';

const camps = [
  {
    id: 1,
    name: '山区训练营地',
    location: '乌鲁木齐天山区',
    capacity: 50,
    current: 32,
    status: '运营中',
    established: '2024-01-15',
    facilities: ['帐篷', '厨房', '卫生间', '医疗点'],
  },
  {
    id: 2,
    name: '森林探险营地',
    location: '乌鲁木齐沙依巴克区',
    capacity: 40,
    current: 25,
    status: '运营中',
    established: '2024-02-01',
    facilities: ['帐篷', '篝火区', '观星台'],
  },
  {
    id: 3,
    name: '湖泊休闲营地',
    location: '克拉玛依独山子区',
    capacity: 30,
    current: 0,
    status: '维护中',
    established: '2023-12-10',
    facilities: ['帐篷', '码头', '钓鱼区'],
  },
  {
    id: 4,
    name: '高原适应营地',
    location: '阿克苏省张家口市',
    capacity: 60,
    current: 45,
    status: '运营中',
    established: '2024-03-20',
    facilities: ['帐篷', '氧气站', '医疗点', '休息区'],
  },
  {
    id: 5,
    name: '荒野生存训练营地',
    location: '阿克苏省承德市',
    capacity: 25,
    current: 18,
    status: '运营中',
    established: '2024-04-05',
    facilities: ['简易帐篷', '野外厨房', '应急点'],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: camps,
    message: '获取营地列表成功',
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newCamp = {
    id: camps.length + 1,
    ...body,
    established: new Date().toISOString().split('T')[0],
  };

  camps.push(newCamp);

  return NextResponse.json({
    success: true,
    data: newCamp,
    message: '新增营地成功',
  }, { status: 201 });
}
