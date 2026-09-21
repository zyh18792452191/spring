'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Shield, UserCheck, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PersonnelPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const personnel = [
    {
      id: 1,
      name: '张三',
      position: '营地主管',
      department: '运营部',
      status: '在职',
      phone: '138****1234',
      email: 'zhangsan@example.com',
      joinDate: '2023-06-15',
      currentCamp: '山区训练营地',
    },
    {
      id: 2,
      name: '李四',
      position: '装备管理员',
      department: '后勤部',
      status: '在职',
      phone: '139****5678',
      email: 'lisi@example.com',
      joinDate: '2023-07-20',
      currentCamp: '装备库A',
    },
    {
      id: 3,
      name: '王五',
      position: '安全员',
      department: '安全部',
      status: '在职',
      phone: '137****9012',
      email: 'wangwu@example.com',
      joinDate: '2023-08-10',
      currentCamp: '森林探险营地',
    },
    {
      id: 4,
      name: '赵六',
      position: '教练',
      department: '培训部',
      status: '休假中',
      phone: '136****3456',
      email: 'zhaoliu@example.com',
      joinDate: '2023-09-05',
      currentCamp: '-',
    },
    {
      id: 5,
      name: '孙七',
      position: '后勤专员',
      department: '后勤部',
      status: '在职',
      phone: '135****7890',
      email: 'sunqi@example.com',
      joinDate: '2023-10-12',
      currentCamp: '装备库B',
    },
    {
      id: 6,
      name: '周八',
      position: '实习生',
      department: '运营部',
      status: '试用中',
      phone: '134****2345',
      email: 'zhouba@example.com',
      joinDate: '2024-01-05',
      currentCamp: '山区训练营地',
    },
  ];

  const filteredPersonnel = personnel.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">人员管理</h2>
          <p className="text-sm text-gray-500">
            管理所有员工信息和状态
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新增人员
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索姓名、职位或部门..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 人员列表 */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-600">
          <div className="col-span-3">人员信息</div>
          <div className="col-span-2">职位部门</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">联系方式</div>
          <div className="col-span-2">当前位置</div>
          <div className="col-span-1">操作</div>
        </div>
        <div className="divide-y">
          {filteredPersonnel.map((person) => (
            <div
              key={person.id}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{person.name}</h4>
                    <p className="text-xs text-gray-500">ID: {person.id}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-900">{person.position}</p>
                <p className="text-xs text-gray-500">{person.department}</p>
              </div>
              <div className="col-span-2">
                <StatusBadge status={person.status} />
              </div>
              <div className="col-span-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Phone className="h-3 w-3" />
                  {person.phone}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Mail className="h-3 w-3" />
                  {person.email}
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5" />
                  {person.currentCamp}
                </div>
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

        {filteredPersonnel.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">未找到匹配的人员</p>
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
    '在职': {
      icon: UserCheck,
      className: 'bg-green-100 text-green-700',
    },
    '休假中': {
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-700',
    },
    '试用中': {
      icon: Shield,
      className: 'bg-blue-100 text-blue-700',
    },
    '离职': {
      icon: Clock,
      className: 'bg-red-100 text-red-700',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['在职'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
