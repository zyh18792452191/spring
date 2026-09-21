'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import IndicatorTreeCard, { IndicatorCardData } from './IndicatorTreeCard';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';

// 重新导出类型
export type { IndicatorCardData };

interface IndicatorTreeProps {
  data: IndicatorCardData[];
  onCardClick?: (id: string) => void;
  selectedId?: string; // 当前选中的节点ID
  onSelectedChange?: (id: string) => void; // 选中节点变化时的回调
}

// TreeNode 组件 - 提取到外部
const TreeNode: React.FC<{
  node: IndicatorCardData;
  level: number;
  onCardClick?: (id: string) => void;
  onToggle?: (id: string) => void;
  selectedId?: string;
}> = ({ node, level, onCardClick, onToggle, selectedId }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded !== false; // 默认展开，只有明确为 false 时才收起
  const isCategory = node.label === '分类节点';
  const cardHeight = isCategory ? 70 : 110;
  const cardHalfHeight = cardHeight / 2;

  // 递归计算节点及其所有后代节点的总高度
  const calculateNodeTotalHeight = (node: IndicatorCardData): number => {
    const isNodeCategory = node.label === '分类节点';
    const nodeHeight = isNodeCategory ? 70 : 110;

    if (!node.children || node.children.length === 0 || node.isExpanded === false) {
      return nodeHeight;
    }

    // 递归计算子节点高度
    const childrenHeights = node.children.map(child => calculateNodeTotalHeight(child));

    // 计算所有子节点的总高度，包括它们之间的 gap
    const totalChildrenHeight = childrenHeights.reduce((sum, height) => sum + height, 0);
    const totalGap = (childrenHeights.length - 1) * 24;

    return nodeHeight + totalChildrenHeight + totalGap;
  };

  // 计算所有子节点的总高度（不包括当前节点）
  const childrenTotalHeight = hasChildren && isExpanded
    ? (node.children!.reduce((total, child) => {
        return total + calculateNodeTotalHeight(child);
      }, 0) + (node.children!.length - 1) * 24) // 加上子节点之间的 gap
    : 0;

  return (
    <div className="flex items-start relative">
      {/* 卡片 */}
      <div className="relative">
        <IndicatorTreeCard
          data={node}
          onClick={onCardClick}
          onToggle={onToggle}
          selectedId={selectedId}
        />
      </div>

      {/* 子节点容器 - 纵向排列 */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col relative" style={{ marginLeft: '24px' }}>
          {/* 垂直线 - 从父节点右侧中心开始 */}
          <div
            className="absolute left-0 bg-blue-400 pointer-events-none"
            style={{
              top: `${cardHalfHeight}px`,
              bottom: `${cardHalfHeight}px`,
              width: '2px',
              zIndex: 0,
            }}
          />

          {/* 子节点 */}
          {node.children?.map((child, index) => {
            const childIsCategory = child.label === '分类节点';
            const childCardHeight = childIsCategory ? 70 : 110;
            const childCardHalfHeight = childCardHeight / 2;

            return (
              <div
                key={child.id}
                className="relative flex items-start"
                style={{ marginBottom: index < node.children!.length - 1 ? '24px' : '0' }}
              >
                {/* 水平分支 - 从垂直线延伸到子节点左侧中心 */}
                <div
                  className="absolute bg-blue-400 pointer-events-none flex items-center"
                  style={{
                    left: '0',
                    top: `${childCardHalfHeight}px`,
                    width: '24px',
                    height: '2px',
                    zIndex: 0,
                  }}
                >
                  {/* 添加箭头 - 指向子节点 */}
                  <svg
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 1L7 4L1 7"
                      stroke="#60B3E2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="relative" style={{ paddingLeft: '24px' }}>
                  <TreeNode
                    node={{ ...child, parentId: node.id }}
                    level={level + 1}
                    onCardClick={onCardClick}
                    onToggle={onToggle}
                    selectedId={selectedId}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const IndicatorTree: React.FC<IndicatorTreeProps> = ({ data, onCardClick, selectedId, onSelectedChange }) => {
  // 确保所有节点都有 isExpanded 属性，默认为 true（展开状态）
  const initializeTree = useCallback((nodes: IndicatorCardData[]): IndicatorCardData[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: node.isExpanded !== undefined ? node.isExpanded : true,
      children: node.children ? initializeTree(node.children) : undefined
    }));
  }, []);

  const [treeData, setTreeData] = useState<IndicatorCardData[]>(() => initializeTree(data));
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 当 data prop 变化时，更新 treeData
  useEffect(() => {
    setTreeData(initializeTree(data));
  }, [data, initializeTree]);

  const handleToggle = (id: string) => {
    const toggleNode = (nodes: IndicatorCardData[]): IndicatorCardData[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            isExpanded: !node.isExpanded,
          };
        }
        if (node.children) {
          return {
            ...node,
            children: toggleNode(node.children),
          };
        }
        return node;
      });
    };

    setTreeData(prevData => toggleNode(prevData));
  };

  // 缩放处理
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.5, Math.min(2, scale + delta));
      setScale(newScale);
    }
  };

  // 平移处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 工具栏操作
  const handleZoomIn = () => {
    setScale(Math.min(2, scale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(Math.max(0.5, scale - 0.1));
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMoveLeft = () => {
    setPosition(prev => ({ ...prev, x: prev.x - 50 }));
  };

  const handleMoveRight = () => {
    setPosition(prev => ({ ...prev, x: prev.x + 50 }));
  };

  const handleMoveUp = () => {
    setPosition(prev => ({ ...prev, y: prev.y - 50 }));
  };

  const handleMoveDown = () => {
    setPosition(prev => ({ ...prev, y: prev.y + 50 }));
  };

  return (
    <div className="relative h-full min-h-[600px]">
      {/* 指标树显示区域 - 占据整个空间 */}
      <div
        ref={containerRef}
        className={`h-full min-h-[600px] bg-white p-6 overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* 指标树内容 - 应用缩放和平移 */}
        <div
          className="absolute origin-top-left transition-transform duration-150"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            left: '140px',
            top: '140px',
          }}
        >
          <div className="flex items-start">
            {treeData.map((rootNode) => (
              <TreeNode
                key={rootNode.id}
                node={rootNode}
                level={0}
                onCardClick={onCardClick}
                onToggle={handleToggle}
                selectedId={selectedId}
              />
            ))}
          </div>
        </div>

        {/* 底部工具栏 - 绝对定位，悬浮在画布上方 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 w-12 text-center bg-white/90 backdrop-blur-sm shadow-sm rounded">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
            title="放大"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={handleMoveUp}
            className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
            title="上移"
          >
            <ChevronUp className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={handleMoveLeft}
              className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
              title="左移"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
              title="重置"
            >
              <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
            </button>
            <button
              onClick={handleMoveRight}
              className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
              title="右移"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleMoveDown}
            className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
            title="下移"
          >
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 rounded transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorTree;
