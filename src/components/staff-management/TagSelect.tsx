"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TagItem {
  id: string;
  name: string;
  children?: TagItem[];
}

export interface TagSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  singleSelect?: boolean; // 单选模式：只能选择一个标签（用于批量管理）
  showCount?: boolean; // 是否显示标签人数
  includeAll?: boolean; // 是否包含"全部"选项
  externalTagCounts?: { [key: string]: number }; // 外部传入的标签人数（统一数据源）
  totalCount?: number; // 外部传入的总人数（"全部"显示的人数）
}

interface TagCount {
  [key: string]: number;
}

// 静态标签数据（两级结构）
const STATIC_TAGS: TagItem[] = [
  {
    id: 'l1_1',
    name: '存量运营',
    children: [
      { id: 'l2_1', name: '中高端客户运营' },
      { id: 'l2_2', name: '离网维系' },
      { id: 'l2_3', name: '用量运营' },
      { id: 'l2_4', name: '融合运营' },
      { id: 'l2_5', name: '细分市场运营' },
    ],
  },
  {
    id: 'l1_2',
    name: '国际业务运营',
    // 无二级标签，可以直接选择
  },
  {
    id: 'l1_3',
    name: '家庭运营',
    // 无二级标签，可以直接选择
  },
];

export default function TagSelect({
  value,
  onChange,
  disabled = false,
  singleSelect = false,
  showCount = false,
  includeAll = false,
  externalTagCounts,
  totalCount: externalTotalCount,
}: TagSelectProps) {
  // 标签人数统计
  const [tagCounts, setTagCounts] = useState<TagCount>({});
  const [totalCount, setTotalCount] = useState(0); // 全部标签人数
  const [loadingCounts, setLoadingCounts] = useState(false);

  // 当外部传入的externalTagCounts变化时，直接更新内部状态
  useEffect(() => {
    if (externalTagCounts && Object.keys(externalTagCounts).length > 0) {
      const counts: TagCount = {};
      Object.assign(counts, externalTagCounts);
      setTagCounts(counts);

      // 使用外部传入的totalCount，如果没有传入则不设置（避免计算错误）
      if (externalTotalCount !== undefined) {
        setTotalCount(externalTotalCount);
      }
    }
  }, [externalTagCounts, externalTotalCount]);

  // 当showCount为true且没有外部externalTagCounts时，自己查询
  useEffect(() => {
    if (showCount && (!externalTagCounts || Object.keys(externalTagCounts).length === 0)) {
      loadTagCounts();
    }
  }, [showCount]);

  const loadTagCounts = async () => {
    setLoadingCounts(true);
    try {
      const counts: TagCount = {};

      // 如果外部传入了tagCounts，直接使用（统一数据源）
      if (tagCounts) {
        Object.assign(counts, tagCounts);
        // 计算总人数（去重后的一级标签人数）
        const 存量运营人数 = counts['存量运营'] || 0;
        const 家庭运营人数 = counts['家庭运营'] || 0;
        const 国际业务运营人数 = counts['国际业务运营'] || 0;
        setTotalCount(存量运营人数 + 家庭运营人数 + 国际业务运营人数);
        setTagCounts(counts);
        return;
      }

      // 否则，自己查询（兼容旧逻辑）
      // 加载所有已打标签的在职人员总数
      const allResponse = await fetch('/api/staff-management?hasTags=true&status=active&pageSize=1');
      const allResult = await allResponse.json();
      setTotalCount(allResult.total || 0);

      // 加载所有标签的人数（只统计在职人员）
      for (const tag of STATIC_TAGS) {
        // 如果有二级标签，先加载二级标签人数，然后计算一级标签人数
        if (tag.children && tag.children.length > 0) {
          // 加载所有二级标签人数
          const subtagCounts: number[] = [];
          for (const child of tag.children) {
            // 二级标签名称格式：一级标签 / 二级标签
            const fullName = `${tag.name} / ${child.name}`;
            const l2Response = await fetch(`/api/staff-management?tag=${encodeURIComponent(fullName)}&status=active&pageSize=1`);
            const l2Result = await l2Response.json();
            counts[fullName] = l2Result.total || 0;
            subtagCounts.push(l2Result.total || 0);
          }

          // 一级标签人数使用子标签的最大值（去重近似）
          counts[tag.name] = Math.max(...subtagCounts);
        } else {
          // 没有二级标签，直接加载一级标签人数
          const l1Response = await fetch(`/api/staff-management?tag=${encodeURIComponent(tag.name)}&status=active&pageSize=1`);
          const l1Result = await l1Response.json();
          counts[tag.name] = l1Result.total || 0;
        }
      }

      setTagCounts(counts);
    } catch (error) {
      console.error('加载标签人数失败:', error);
    } finally {
      setLoadingCounts(false);
    }
  };

  // 切换选中状态
  const toggleSelection = (tag: TagItem, isLevel2: boolean, parentName?: string) => {
    const displayName = isLevel2 ? `${parentName} / ${tag.name}` : tag.name;

    // 单选模式："全部"与其他标签互斥
    if (singleSelect) {
      if (value.includes(displayName)) {
        // 已选中，取消
        onChange([]);
      } else {
        // 未选中，选中该标签
        onChange([displayName]);
      }
      return;
    }

    // 多选模式
    if (value.includes(displayName)) {
      // 已选中，移除
      const newValue = value.filter(v => v !== displayName);

      // 如果取消的是父标签，同时取消所有子标签
      if (!isLevel2 && tag.children && tag.children.length > 0) {
        const childNames = tag.children.map(child => `${tag.name} / ${child.name}`);
        const filteredValue = newValue.filter(v => !childNames.includes(v));
        onChange(filteredValue);
      } else {
        onChange(newValue);
      }
    } else {
      // 未选中，添加

      // 如果选中的是父标签，同时选中所有子标签
      if (!isLevel2 && tag.children && tag.children.length > 0) {
        const childNames = tag.children.map(child => `${tag.name} / ${child.name}`);
        onChange([...value, displayName, ...childNames]);
      } else {
        onChange([...value, displayName]);
      }
    }
  };

  // 选择"全部"（不可勾选，只是显示）
  const selectAll = () => {
    if (singleSelect) {
      // "全部"只是一个展示项，不改变选中状态
      // 如果要切换到"全部"视图，由父组件处理
      onChange(['全部']);
    }
  };

  // 移除已选标签
  const removeSelection = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== tagName));
  };

  // 判断是否选中
  const isSelected = (tagName: string) => {
    return value.includes(tagName);
  };

  // 渲染标签项
  const renderTagItem = (tag: TagItem, isChild: boolean = false, parentName?: string) => {
    const displayName = isChild ? `${parentName} / ${tag.name}` : tag.name;
    const selected = isSelected(displayName);
    const count = tagCounts[displayName] || 0;

    return (
      <div key={tag.id} className={`${isChild ? 'ml-4' : ''}`}>
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer ${selected ? 'bg-blue-50' : ''}`}
          onClick={() => toggleSelection(tag, isChild, parentName)}
        >
          {/* 展开/收起图标 */}
          {tag.children && tag.children.length > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {(!tag.children || tag.children.length === 0) && <div className="w-4" />}

          {/* 标签名称 */}
          <span className={`flex-1 ${selected ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
            {tag.name}
          </span>

          {/* 人数统计 */}
          {showCount && !loadingCounts && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}

          {/* 选中标记 */}
          {selected && (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* 渲染子标签 */}
        {tag.children && tag.children.length > 0 && (
          <div className="mt-1">
            {tag.children.map(child => renderTagItem(child, true, tag.name))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* 单选模式：不显示已选标签 */}
      {!singleSelect && (
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {value.length === 0 ? (
            <div className="text-sm text-gray-400 py-2">
              请选择标签
            </div>
          ) : (
            value.map((tagName) => (
              <div
                key={tagName}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
              >
                {tagName}
                {!disabled && (
                  <button
                    onClick={(e) => removeSelection(tagName, e)}
                    className="ml-1 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 标签选择器 - 默认展开 */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        {/* "全部"选项 - 可点击，只显示人数 */}
        {includeAll && singleSelect && (
          <div
            className="flex items-center gap-2 py-2 px-3 mb-2 border-b cursor-pointer hover:bg-gray-50 rounded-lg"
            onClick={() => onChange(['all'])}
          >
            <div className="w-4" />
            <span className={`flex-1 ${isSelected('all') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
              全部
            </span>
            {showCount && !loadingCounts && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </div>
        )}

        {STATIC_TAGS.map(tag => renderTagItem(tag))}
      </div>
    </div>
  );
}
