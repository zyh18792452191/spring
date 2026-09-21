'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import UserWatchView from './components/UserWatchView';
import GridDispatchStats from './components/GridDispatchStats';
import GridDispatchDetail from './components/GridDispatchDetail';

type TabKey = 'watch' | 'stats' | 'detail';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'watch', label: '全量用户看管视图' },
  { key: 'stats', label: '物理网格分派统计' },
  { key: 'detail', label: '存量用户物理网格分派明细' },
];

export default function CustomerSupervisionPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('watch');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 标题区 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 pt-5">
        <h1 className="text-xl font-semibold text-gray-900">全量用户看管关系监控</h1>
        <p className="text-sm text-gray-500 mt-1">全量客户看管归属关系与物理网格分派情况监控报表</p>

        {/* Tab 切换（参照原型 tab-item 样式） */}
        <div className="flex items-center gap-8 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={cn(
                'relative pb-3 text-sm font-medium transition-colors',
                activeTab === tab.key ? 'text-[#3471ff]' : 'text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span
                className={cn(
                  'absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-[#3471ff] transition-opacity',
                  activeTab === tab.key ? 'opacity-100' : 'opacity-0'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'watch' && <UserWatchView />}
        {activeTab === 'stats' && <GridDispatchStats />}
        {activeTab === 'detail' && <GridDispatchDetail />}
      </div>
    </div>
  );
}
