'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CampsPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
      location: '克拉玛依独山子区',
      capacity: 40,
      current: 25,
      status: '运营中',
      established: '2024-02-01',
      facilities: ['帐篷', '篝火区', '观星台'],
    },
    {
      id: 3,
      name: '湖泊休闲营地',
      location: '吐鲁番高昌区',
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

  const filteredCamps = camps.filter(
    (camp) =>
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">营地管理</h2>
          <p className="text-sm text-gray-500">
            管理所有营地的运营状态和信息
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新增营地
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索营地名称或位置..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 营地列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCamps.map((camp) => (
          <CampCard key={camp.id} camp={camp} />
        ))}
      </div>

      {filteredCamps.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">未找到匹配的营地</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface CampCardProps {
  camp: {
    id: number;
    name: string;
    location: string;
    capacity: number;
    current: number;
    status: string;
    established: string;
    facilities: string[];
  };
}

function CampCard({ camp }: CampCardProps) {
  const utilizationRate = Math.round((camp.current / camp.capacity) * 100);
  
  const statusColors = {
    '运营中': 'bg-green-100 text-green-700',
    '维护中': 'bg-yellow-100 text-yellow-700',
    '已关闭': 'bg-red-100 text-red-700',
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* 营地图片占位 */}
      <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100" />
      
      <div className="p-5">
        {/* 营地名称和状态 */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{camp.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              {camp.location}
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[camp.status as keyof typeof statusColors]}`}>
            {camp.status}
          </span>
        </div>

        {/* 营地信息 */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>容量: {camp.capacity}人</span>
            </div>
            <span className="font-medium text-gray-900">
              当前: {camp.current}人
            </span>
          </div>
          
          {/* 使用率进度条 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
              <div 
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{utilizationRate}%</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>建立时间: {camp.established}</span>
          </div>

          {/* 设施标签 */}
          <div className="pt-2">
            <div className="flex flex-wrap gap-1.5">
              {camp.facilities.slice(0, 3).map((facility) => (
                <span 
                  key={facility}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {facility}
                </span>
              ))}
              {camp.facilities.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{camp.facilities.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1">
            <Edit className="h-3 w-3" />
            编辑
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1">
            <Trash2 className="h-3 w-3 text-red-500" />
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}
