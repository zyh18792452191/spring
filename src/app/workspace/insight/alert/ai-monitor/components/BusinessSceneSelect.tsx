'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BUSINESS_SCENE_TREE, formatScenePath, SceneNode } from '../data';

interface BusinessSceneSelectProps {
  /** 当前选中的三级业务场景路径（叶子），如 ['公众市场','流量运营','流量运营']；null 表示未选 */
  value: string[] | null;
  onChange: (path: string[] | null) => void;
  placeholder?: string;
  /** 是否允许清除（筛选场景使用；新增必填场景关闭） */
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 业务场景三级结构树选择器（绝对定位面板，兼容 Dialog 内使用）
 * 左栏：一级（全国/公众市场）→ 中栏：二级场景域 → 右栏：三级业务场景（叶子，点击后回填完整路径）
 */
export function BusinessSceneSelect({
  value,
  onChange,
  placeholder = '请选择业务场景',
  clearable = true,
  disabled = false,
  className,
}: BusinessSceneSelectProps) {
  const [open, setOpen] = useState(false);
  // 弹层内暂存的一/二级选中项（用于级联浏览，不影响外部 value）
  const [level1, setLevel1] = useState<SceneNode | null>(null);
  const [level2, setLevel2] = useState<SceneNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPathText = value ? formatScenePath(value) : '';

  const openPanel = () => {
    // 按已选路径回放级联位置；未选时默认展开第一/二级，保证三列结构立即可见
    let n1: SceneNode | null = null;
    let n2: SceneNode | null = null;
    if (value && value.length >= 1) {
      n1 = BUSINESS_SCENE_TREE.find((n) => n.name === value[0]) ?? null;
      n2 = n1?.children?.find((n) => n.name === value[1]) ?? null;
    }
    if (!n1) n1 = BUSINESS_SCENE_TREE[0] ?? null;
    if (!n2) n2 = n1?.children?.[0] ?? null;
    setLevel1(n1);
    setLevel2(n2);
    setOpen(true);
  };

  const pickLeaf = (path: string[]) => {
    onChange(path);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={cn('w-full justify-between font-normal h-9', !value && 'text-gray-400')}
      >
        <span className="truncate">{value ? selectedPathText : placeholder}</span>
        <span className="flex items-center gap-1 shrink-0">
          {clearable && value && (
            <X
              className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange(null);
              }}
            />
          )}
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
        </span>
      </Button>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-[60] mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-[560px] max-w-[85vw]">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {/* 一级：业务场景大类 */}
            <SceneColumn
              items={BUSINESS_SCENE_TREE}
              selected={level1?.name}
              onSelect={(node) => {
                setLevel1(node);
                setLevel2(null);
              }}
            />
            {/* 二级：场景域 */}
            <SceneColumn
              items={level1?.children ?? []}
              selected={level2?.name}
              onSelect={(node) => setLevel2(node)}
            />
            {/* 三级：业务场景（叶子，可点击选中） */}
            <LeafColumn
              nodes={level2?.children ?? []}
              selectedPath={value}
              onPick={(name) => {
                if (level1 && level2) pickLeaf([level1.name, level2.name, name]);
              }}
            />
          </div>
          {clearable && value && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/60">
              <span className="text-xs text-gray-500">
                已选：<span className="text-[#0085D0]">{selectedPathText}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                清除选择
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 一/二级列（点击即选中并继续展开下一级） */
function SceneColumn({
  items,
  selected,
  onSelect,
}: {
  items: SceneNode[];
  selected?: string;
  onSelect: (node: SceneNode) => void;
}) {
  return (
    <div className="max-h-72 overflow-y-auto">
      {items.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-xs text-gray-300">-</div>
      ) : (
        items.map((node) => {
          const active = selected === node.name;
          return (
            <button
              key={node.name}
              type="button"
              onClick={() => onSelect(node)}
              className={cn(
                'w-full flex items-center justify-between gap-1 px-3 py-2 text-sm text-left hover:bg-blue-50',
                active && 'bg-blue-50 text-[#0085D0] font-medium hover:bg-blue-50'
              )}
            >
              <span className="truncate">{node.name}</span>
              {node.children && node.children.length > 0 && (
                <ChevronRight className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-[#0085D0]' : 'text-gray-300')} />
              )}
            </button>
          );
        })
      )}
    </div>
  );
}

/** 三级叶子列（点击叶子即完成选择） */
function LeafColumn({
  nodes,
  selectedPath,
  onPick,
}: {
  nodes: SceneNode[];
  selectedPath: string[] | null;
  onPick: (name: string) => void;
}) {
  return (
    <div className="max-h-72 overflow-y-auto">
      {nodes.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-xs text-gray-300">-</div>
      ) : (
        nodes.map((node) => {
          const active = !!selectedPath && selectedPath[2] === node.name;
          return (
            <button
              key={node.name}
              type="button"
              onClick={() => onPick(node.name)}
              className={cn(
                'w-full flex items-center justify-between gap-1 px-3 py-2 text-sm text-left hover:bg-blue-50',
                active && 'bg-blue-50 text-[#0085D0] font-medium hover:bg-blue-50'
              )}
            >
              <span className="truncate">{node.name}</span>
              {active && <Check className="w-3.5 h-3.5 shrink-0 text-[#0085D0]" />}
            </button>
          );
        })
      )}
    </div>
  );
}
