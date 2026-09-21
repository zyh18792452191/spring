'use client';

import { Settings, User, Bell, Lock, Database, Globe, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">系统设置</h2>
        <p className="text-sm text-gray-500">
          管理系统配置和偏好设置
        </p>
      </div>

      {/* 设置分类 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧导航 */}
        <div className="space-y-2">
          {settingsCategories.map((category, index) => (
            <button
              key={category.name}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                index === 0
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <category.icon className="h-5 w-5" />
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 账户设置 */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">账户设置</h3>
              <p className="text-sm text-gray-500">管理您的账户信息和安全设置</p>
            </div>

            <div className="space-y-6">
              {/* 用户信息 */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                  A
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">管理员</h4>
                  <p className="text-sm text-gray-500">admin@example.com</p>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    用户名
                  </label>
                  <input
                    type="text"
                    defaultValue="管理员"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@example.com"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    手机号码
                  </label>
                  <input
                    type="tel"
                    defaultValue="138****1234"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    角色权限
                  </label>
                  <input
                    type="text"
                    defaultValue="系统管理员"
                    disabled
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </div>
              </div>

              <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                保存更改
              </button>
            </div>
          </div>

          {/* 通知设置 */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">通知设置</h3>
              <p className="text-sm text-gray-500">配置系统通知和提醒</p>
            </div>

            <div className="space-y-4">
              {notifications.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" className="peer sr-only" defaultChecked={item.defaultChecked} />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 系统配置 */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">系统配置</h3>
              <p className="text-sm text-gray-500">管理系统级配置参数</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  默认语言
                </label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>简体中文</option>
                  <option>English</option>
                  <option>日本語</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  时区设置
                </label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Asia/Shanghai (UTC+8)</option>
                  <option>America/New_York (UTC-5)</option>
                  <option>Europe/London (UTC+0)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  数据保留周期
                </label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>30 天</option>
                  <option>90 天</option>
                  <option>180 天</option>
                  <option>1 年</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const settingsCategories = [
  { name: '账户设置', icon: User },
  { name: '通知设置', icon: Bell },
  { name: '安全设置', icon: Lock },
  { name: '数据管理', icon: Database },
  { name: '语言与地区', icon: Globe },
  { name: '帮助与支持', icon: HelpCircle },
];

const notifications = [
  {
    title: '营地状态变更通知',
    description: '当营地状态发生变化时发送通知',
    defaultChecked: true,
  },
  {
    title: '装备库存预警',
    description: '装备库存低于阈值时发送提醒',
    defaultChecked: true,
  },
  {
    title: '人员状态更新',
    description: '人员报到、离职等状态变化时通知',
    defaultChecked: false,
  },
  {
    title: '每日运营报告',
    description: '每日自动发送运营数据汇总报告',
    defaultChecked: true,
  },
];
