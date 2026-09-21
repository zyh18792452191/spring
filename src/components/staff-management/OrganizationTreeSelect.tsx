'use client';

import { useState, useMemo } from 'react';
import { Building2, ChevronRight, ChevronDown, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ORGANIZATION_TREE, getOrganizationById, getOrganizationPath, searchOrganizations, OrganizationNode } from '@/lib/staff-management/organization-data';

interface OrganizationTreeSelectProps {
  value?: string;              // 选中的组织ID
  onChange: (value: string) => void;
  placeholder?: string;
  showFullPath?: boolean;      // 是否显示完整路径
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;        // 是否允许清空
  showAllOption?: boolean;     // 是否显示"全部"选项
}

export function OrganizationTreeSelect({
  value,
  onChange,
  placeholder = '请选择组织',
  showFullPath = false,
  className,
  disabled = false,
  allowClear = true,
  showAllOption = false,
}: OrganizationTreeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 获取选中的节点
  const selectedNode = value ? getOrganizationById(value) : undefined;

  // 获取显示文本
  const displayText = useMemo(() => {
    if (!value) return '';
    if (value === 'all') return '全部组织';
    if (!selectedNode) return '';
    return showFullPath ? getOrganizationPath(value) : selectedNode.name;
  }, [selectedNode, value, showFullPath]);

  // 搜索过滤
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return ORGANIZATION_TREE;
    
    const matchedIds = new Set<string>();
    const results = searchOrganizations(searchQuery);
    
    results.forEach(node => {
      matchedIds.add(node.id);
      if (node.parentId) {
        matchedIds.add(node.parentId);
      }
    });
    
    return ORGANIZATION_TREE.filter(node => matchedIds.has(node.id));
  }, [searchQuery]);

  // 切换展开状态
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 选择节点
  const handleSelect = (node: OrganizationNode) => {
    onChange(node.id);
    setOpen(false);
    setSearchQuery('');
  };

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // 渲染树节点
  const renderNode = (node: OrganizationNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = value === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-blue-50 rounded-md transition-colors',
            isSelected && 'bg-blue-100',
            level > 0 && 'ml-4'
          )}
          onClick={() => handleSelect(node)}
        >
          {/* 展开/收起按钮 */}
          {hasChildren ? (
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* 图标 */}
          <Building2 className={cn(
            'w-4 h-4',
            node.level === 1 ? 'text-blue-500' : 'text-gray-400'
          )} />

          {/* 名称 */}
          <span className={cn(
            'flex-1 text-sm truncate',
            node.level === 1 ? 'font-medium text-gray-900' : 'text-gray-700'
          )}>
            {node.name}
          </span>

          {/* 选中标记 */}
          {isSelected && (
            <Check className="w-4 h-4 text-blue-600" />
          )}

          {/* 级别标签 */}
          <Badge variant="outline" className={cn(
            'text-xs',
            node.level === 1 ? 'border-blue-300 text-blue-600' : 'border-gray-300 text-gray-500'
          )}>
            {node.level === 1 ? '省公司' : '部门'}
          </Badge>
        </div>

        {/* 子节点 */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'justify-between font-normal',
            !selectedNode && 'text-gray-400',
            className
          )}
        >
          <span className="truncate">
            {displayText || placeholder}
          </span>
          {allowClear && selectedNode ? (
            <button
              onClick={handleClear}
              className="ml-2 hover:bg-gray-100 rounded p-0.5"
            >
              <span className="text-gray-400 hover:text-gray-600">×</span>
            </button>
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索组织..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              未找到匹配的组织
            </div>
          ) : (
            <>
              {/* 全部选项 */}
              {showAllOption && (
                <div
                  className={cn(
                    'flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-blue-50 rounded-md transition-colors mb-1',
                    value === 'all' && 'bg-blue-100'
                  )}
                  onClick={() => {
                    onChange('all');
                    setOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="w-5" />
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 text-sm font-medium text-gray-900">全部组织</span>
                  {value === 'all' && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                    全部
                  </Badge>
                </div>
              )}
              {filteredNodes.map(node => renderNode(node))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default OrganizationTreeSelect;
