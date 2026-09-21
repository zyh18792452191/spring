'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagNode {
  name: string;
  fullName?: string; // 完整标签名称（用于筛选）
  count: number;
  children?: TagNode[];
}

interface TagTreeSelectProps {
  data: TagNode[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allOptionLabel?: string;
  allOptionValue?: string;
  className?: string;
}

// 将平铺的标签列表转换为树形结构
function convertToTree(tagStats: { name: string; count: number }[]): TagNode[] {
  const tree: { [key: string]: TagNode } = {};
  const result: TagNode[] = [];

  // 一级标签定义（按照预置标签的顺序）
  const firstLevelTags = ['存量运营', '国际业务运营', '家庭运营'];

  tagStats.forEach(item => {
    const parts = item.name.split(' / ');
    if (parts.length === 1) {
      // 只有一级标签（去重后的人数，如"存量运营" = 358）
      // 如果已经存在（之前通过子标签创建的），只更新count，不要覆盖children
      if (!tree[item.name]) {
        tree[item.name] = {
          name: item.name,
          count: item.count,
          children: [],
        };
      } else {
        tree[item.name].count = item.count;
      }
    } else {
      // 有二级标签
      const parentName = parts[0];
      const childName = parts.slice(1).join(' / '); // 只取子标签部分

      if (!tree[parentName]) {
        tree[parentName] = {
          name: parentName,
          count: 0,
          children: [],
        };
      }
      tree[parentName].children!.push({
        name: childName, // 子标签只显示名称，不包含父标签
        fullName: item.name, // 保存完整名称用于筛选
        count: item.count,
      });

      // 如果一级标签的count已经是去重后的人数（如358），就不要再累加子标签
      // 只有当count为0时才累加子标签
      if (tree[parentName].count === 0) {
        tree[parentName].count += item.count;
      }
    }
  });

  // 按照预定义的顺序返回一级标签
  firstLevelTags.forEach(tag => {
    if (tree[tag]) {
      result.push(tree[tag]);
    }
  });

  // 添加其他不在预定义列表中的标签
  Object.keys(tree).forEach(tag => {
    if (!firstLevelTags.includes(tag)) {
      result.push(tree[tag]);
    }
  });

  return result;
}

// 判断一个标签是否是另一个标签的子标签
function isChildTag(parentTag: string, childTag: string): boolean {
  const parentParts = parentTag.split(' / ');
  const childParts = childTag.split(' / ');
  
  // 子标签的长度必须大于父标签
  if (childParts.length <= parentParts.length) {
    return false;
  }
  
  // 子标签的前缀必须与父标签完全匹配
  for (let i = 0; i < parentParts.length; i++) {
    if (parentParts[i] !== childParts[i]) {
      return false;
    }
  }
  
  return true;
}

function TreeNode({ node, value, onChange, level = 0 }: { node: TagNode; value: string; onChange: (value: string) => void; level?: number }) {
  const [expanded, setExpanded] = useState(level === 0);
  const isSelected = value === (node.fullName || node.name);
  // 检查是否是选中标签的子标签（当选中父标签时，所有子标签也高亮）
  const isChildOfSelected = !isSelected && isChildTag(value, node.fullName || node.name);
  const shouldHighlight = isSelected || isChildOfSelected;
  const hasChildren = node.children && node.children.length > 0;

  // 当选中父标签时，自动展开
  useEffect(() => {
    if (hasChildren && isChildTag(value, node.fullName || node.name)) {
      setExpanded(true);
    }
  }, [value, node.name, hasChildren]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(node.fullName || node.name); // 使用完整标签名称进行筛选
    // 点击父标签时，自动展开子标签
    if (hasChildren) {
      setExpanded(true);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-100 cursor-pointer rounded transition-colors ${
          shouldHighlight ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            onClick={handleToggleExpand}
            className="p-0 hover:bg-transparent flex items-center justify-center"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <Tag className={`h-4 w-4 ${shouldHighlight ? 'text-blue-600' : 'text-gray-500'}`} />
        
        <span className={`flex-1 text-sm ${shouldHighlight ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
          {node.name}
        </span>
        
        <Badge variant="secondary" className="text-xs">
          {node.count}
        </Badge>
        
        {isSelected && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${child.name}-${index}`}
              node={child}
              value={value}
              onChange={onChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TagTreeSelect({
  data,
  value,
  onChange,
  placeholder = '请选择',
  allOptionLabel = '全部',
  allOptionValue = 'all',
  className = '',
}: TagTreeSelectProps) {
  const [open, setOpen] = useState(false);

  const treeData = convertToTree(data);

  const selectedLabel = value === allOptionValue ? allOptionLabel : value;

  const handleSelectAll = () => {
    onChange(allOptionValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between ${className}`}
        >
          <span className="truncate text-left">{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {/* 全部选项 */}
          <div
            className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-100 cursor-pointer rounded transition-colors ${
              value === allOptionValue ? 'bg-blue-50' : ''
            }`}
            onClick={handleSelectAll}
          >
            <div className="w-4" />
            <span className={`flex-1 text-sm ${value === allOptionValue ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
              {allOptionLabel}
            </span>
            {value === allOptionValue && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </div>

          {/* 树形选项 */}
          {treeData.map((node, index) => (
            <TreeNode
              key={`${node.name}-${index}`}
              node={node}
              value={value}
              onChange={(val) => {
                onChange(val);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
