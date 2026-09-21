"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';

// 工单类型分类定义（与工单列表页、工单综合查询页一致）
interface WorkOrderCategoryData {
  count: number;
  children?: Record<string, { count: number }>;
}

const workOrderCategories: Record<string, WorkOrderCategoryData> = {
  全部类型: { count: 0 },
  生产类: {
    count: 0,
    children: {
      '中高端策略调度': { count: 0 },
      '中高端客群调度': { count: 0 },
      '离网维系策略调度': { count: 0 },
      '离网维系客群调度': { count: 0 },
    },
  },
  管理类: {
    count: 0,
    children: {
      '中高端指标调度': { count: 0 },
      '离网维系指标调度': { count: 0 },
    },
  },
  审批类: {
    count: 0,
    children: {
      '公告审批': { count: 0 },
      '素材授权': { count: 0 },
      '导出审批': { count: 0 },
      '导出审批任务': { count: 0 },
    },
  },
  测试: { count: 0 },
};

interface WorkOrderTypeTreeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function WorkOrderTypeTreeSelect({
  value,
  onChange,
  disabled = false,
}: WorkOrderTypeTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 判断是否有子节点
  const hasChildren = (category: any) => {
    return category.children && typeof category.children === 'object' && Object.keys(category.children).length > 0;
  };

  // 切换分类展开/收起
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // 获取选中的路径
  const getSelectedPath = () => {
    if (!value || value === 'all') return '全部类型';

    for (const [category, categoryData] of Object.entries(workOrderCategories)) {
      if (category === '全部类型') continue;

      if (hasChildren(categoryData)) {
        // 检查是否匹配二级分类
        if (categoryData.children) {
          for (const [subCategory] of Object.entries(categoryData.children)) {
            if (value === `${category}/${subCategory}`) {
              return `${category} / ${subCategory}`;
            }
          }
        }
      } else {
        // 检查是否匹配一级分类
        if (value === category) {
          return category;
        }
      }
    }

    return '全部类型';
  };

  // 处理选择
  const handleSelect = (categoryName: string, subCategoryName?: string) => {
    if (subCategoryName) {
      onChange(`${categoryName}/${subCategoryName}`);
    } else if (categoryName === '全部类型') {
      onChange('all');
    } else if (!hasChildren((workOrderCategories as any)[categoryName])) {
      // 没有子节点的一级分类，直接选择
      onChange(categoryName);
    }
    setIsOpen(false);
  };

  // 判断是否选中
  const isSelected = (categoryName: string, subCategoryName?: string) => {
    if (subCategoryName) {
      return value === `${categoryName}/${subCategoryName}`;
    }
    if (categoryName === '全部类型') {
      return value === 'all' || value === '';
    }
    // 对于有子节点的分类，检查其子节点是否被选中
    const categoryData = (workOrderCategories as any)[categoryName];
    if (hasChildren(categoryData)) {
      for (const subCategory of Object.keys(categoryData.children)) {
        if (value === `${categoryName}/${subCategory}`) {
          return true;
        }
      }
      return false;
    }
    return value === categoryName;
  };

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="min-w-[180px] rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-left hover:bg-gray-50 focus:border-[#0085D0] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between"
      >
        <span className="truncate">{getSelectedPath()}</span>
        <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
      </button>

      {/* 下拉面板 */}
      {isOpen && !disabled && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 树形菜单 */}
          <div className="absolute top-full left-0 z-20 mt-1 w-80 max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              {Object.entries(workOrderCategories).map(([categoryName, categoryData]) => {
                const hasChild = hasChildren(categoryData);
                const isExpanded = expandedCategories.has(categoryName);
                const selected = isSelected(categoryName);

                return (
                  <div key={categoryName}>
                    {/* 一级分类 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (hasChild) {
                          toggleCategory(categoryName);
                        } else {
                          handleSelect(categoryName);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                        selected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {hasChild && (
                          <span className="shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </span>
                        )}
                        <span>{categoryName}</span>
                      </div>
                      {selected && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </button>

                    {/* 二级分类 */}
                    {hasChild && isExpanded && categoryData.children && (
                      <div className="ml-6 mt-1 space-y-1">
                        {Object.entries(categoryData.children).map(([subCategoryName]) => {
                          const subSelected = isSelected(categoryName, subCategoryName);
                          return (
                            <button
                              key={subCategoryName}
                              type="button"
                              onClick={() => handleSelect(categoryName, subCategoryName)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                                subSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                              }`}
                            >
                              <span>{subCategoryName}</span>
                              {subSelected && (
                                <Check className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
