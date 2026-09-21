'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, PackageCheck, PackageX, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const equipment = [
    {
      id: 1,
      name: '高山帐篷',
      type: '住宿装备',
      quantity: 45,
      available: 38,
      status: '正常',
      location: '装备库A',
      lastMaintenance: '2024-01-20',
    },
    {
      id: 2,
      name: '防潮睡袋',
      type: '住宿装备',
      quantity: 60,
      available: 55,
      status: '正常',
      location: '装备库A',
      lastMaintenance: '2024-01-18',
    },
    {
      id: 3,
      name: '户外炊具套装',
      type: '厨房装备',
      quantity: 20,
      available: 18,
      status: '正常',
      location: '装备库B',
      lastMaintenance: '2024-01-25',
    },
    {
      id: 4,
      name: '登山杖',
      type: '运动装备',
      quantity: 80,
      available: 72,
      status: '部分损坏',
      location: '装备库C',
      lastMaintenance: '2024-01-15',
    },
    {
      id: 5,
      name: '应急医疗包',
      type: '医疗装备',
      quantity: 15,
      available: 15,
      status: '正常',
      location: '装备库A',
      lastMaintenance: '2024-01-28',
    },
    {
      id: 6,
      name: '防水背包',
      type: '行李装备',
      quantity: 35,
      available: 30,
      status: '正常',
      location: '装备库B',
      lastMaintenance: '2024-01-22',
    },
  ];

  const filteredEquipment = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">装备管理</h2>
          <p className="text-sm text-gray-500">
            管理所有装备的库存和使用情况
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新增装备
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索装备名称或类型..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 装备列表 */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-600">
          <div className="col-span-3">装备名称</div>
          <div className="col-span-2">类型</div>
          <div className="col-span-2">库存状态</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">位置</div>
          <div className="col-span-1">操作</div>
        </div>
        <div className="divide-y">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {item.type}
                </span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div 
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${Math.round((item.available / item.quantity) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {item.available}/{item.quantity}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <StatusBadge status={item.status} />
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {item.location}
              </div>
              <div className="col-span-1">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <PackageX className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">未找到匹配的装备</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    '正常': {
      icon: PackageCheck,
      className: 'bg-green-100 text-green-700',
      dotClass: 'bg-green-500',
    },
    '部分损坏': {
      icon: PackageX,
      className: 'bg-yellow-100 text-yellow-700',
      dotClass: 'bg-yellow-500',
    },
    '需维护': {
      icon: CircleDot,
      className: 'bg-orange-100 text-orange-700',
      dotClass: 'bg-orange-500',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['正常'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
