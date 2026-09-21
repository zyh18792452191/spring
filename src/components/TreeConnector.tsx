'use client';

import { useEffect, useRef, useState } from 'react';

interface ConnectorLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface TreeConnectorProps {
  parentId: string;
  childrenIds: string[];
  lineColor?: string;
  lineWidth?: number;
}

export default function TreeConnector({
  parentId,
  childrenIds,
  lineColor = '#d1d5db', // gray-300
  lineWidth = 2,
}: TreeConnectorProps) {
  const [lines, setLines] = useState<ConnectorLine[]>([]);
  const parentRef = useRef<HTMLElement>(null);
  const childrenRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    // 注册子节点引用
    const observer = new MutationObserver(() => {
      updateLines();
    });

    // 监听 DOM 变化
    if (typeof document !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [parentId, childrenIds]);

  const updateLines = () => {
    if (typeof document === 'undefined') return;

    // 获取父节点位置
    const parentEl = parentRef.current;
    if (!parentEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const parentCenterX = parentRect.left + parentRect.width / 2;
    const parentBottomY = parentRect.bottom;

    // 获取所有子节点位置
    const newLines: ConnectorLine[] = [];

    childrenIds.forEach((childId) => {
      const childEl = childrenRefs.current.get(childId);
      if (!childEl) return;

      const childRect = childEl.getBoundingClientRect();
      const childCenterX = childRect.left + childRect.width / 2;
      const childTopY = childRect.top;

      newLines.push({
        startX: parentCenterX,
        startY: parentBottomY,
        endX: childCenterX,
        endY: childTopY,
      });
    });

    setLines(newLines);
  };

  // 注册子节点
  const registerChild = (id: string, element: HTMLElement) => {
    childrenRefs.current.set(id, element);
    updateLines();
  };

  // 注册父节点
  const registerParent = (element: HTMLElement) => {
    parentRef.current = element;
    updateLines();
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {lines.map((line, index) => {
        const { startX, startY, endX, endY } = line;

        // 判断是否需要折线
        const isOffset = Math.abs(startX - endX) > 5;

        // 生成路径
        let pathD = '';
        if (isOffset) {
          // 折线：父节点底部 → 水平 → 垂直 → 子节点顶部
          const midY = startY + (endY - startY) / 2;
          pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
        } else {
          // 纯垂直线
          pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        }

        return (
          <path
            key={index}
            d={pathD}
            stroke={lineColor}
            strokeWidth={lineWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

// 上下文，用于注册节点
import { createContext, useContext } from 'react';

interface TreeConnectorContextValue {
  registerParent: (element: HTMLElement) => void;
  registerChild: (id: string, element: HTMLElement) => void;
}

const TreeConnectorContext = createContext<TreeConnectorContextValue | null>(null);

export function useTreeConnector() {
  const context = useContext(TreeConnectorContext);
  if (!context) {
    throw new Error('useTreeConnector must be used within TreeConnectorProvider');
  }
  return context;
}

export function TreeConnectorProvider({ children }: { children: React.ReactNode }) {
  const [connectors, setConnectors] = useState<Map<string, TreeConnectorContextValue>>(new Map());

  return (
    <TreeConnectorContext.Provider value={null}>
      {children}
    </TreeConnectorContext.Provider>
  );
}
