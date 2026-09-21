'use client';

import { X, MoreHorizontal } from 'lucide-react';
import { useTabs, Tab } from '@/contexts/TabsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TabsBarProps {
  onTabClick?: (tab: { id: string; path: string; title: string }) => void;
}

export default function TabsBar({ onTabClick }: TabsBarProps) {
  const { tabs, activeTab, removeTab, setActiveTab, closeOtherTabs, closeAllTabs, fixedTabIds } = useTabs();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 overflow-x-auto" style={{ height: '44px', minHeight: '44px' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const isFixed = fixedTabIds.includes(tab.id);

        return (
          <div
            key={tab.id}
            className={cn(
              'group relative flex items-center gap-2 px-4 py-2 rounded-t-lg rounded-bl-sm transition-all min-w-max cursor-pointer select-none',
              'hover:shadow-md',
              isActive
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200 border-b-white -mb-px rounded-b-none'
                : 'bg-transparent text-gray-500 border border-transparent hover:bg-white/70 hover:border-gray-200 hover:text-gray-700'
            )}
            onClick={() => {
              setActiveTab(tab.id);
              onTabClick?.(tab);
            }}
            style={{ height: '40px', minHeight: '40px', marginTop: '4px' }}
          >
            <span className="text-sm font-medium whitespace-nowrap tracking-tight">{tab.title}</span>
            {!isFixed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full transition-all',
                  isActive
                    ? 'hover:bg-blue-50 text-blue-400 hover:text-blue-600'
                    : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                )}
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {/* 关闭其他标签的下拉菜单 */}
            {tabs.length > 1 && isActive && !isFixed && (
              <div className="absolute -bottom-9 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => closeOtherTabs(tab.id)}
                      className="text-xs cursor-pointer hover:bg-gray-50"
                    >
                      关闭其他
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={closeAllTabs}
                      className="text-xs cursor-pointer hover:bg-gray-50"
                    >
                      关闭所有
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
