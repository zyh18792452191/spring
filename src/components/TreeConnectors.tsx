'use client';

import React from 'react';

// 布局配置常量
const LAYOUT_CONFIG = {
  NODE_WIDTH: 180,      // 节点宽度
  NODE_HEIGHT: 80,      // 节点高度
  HORIZONTAL_GAP: 40,   // 父子节点水平间距
  VERTICAL_GAP: 20,     // 子节点垂直间距
  MAIN_LINE_OFFSET: 10, // 父节点右中点向下偏移距离
};

interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Connection {
  parentId: string;
  parentX: number;
  parentY: number;
  parentWidth: number;
  parentHeight: number;
  children: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface TreeConnectorsProps {
  connections: Connection[];
  lineColor?: string;
  lineWidth?: number;
}

/**
 * 树形连接线组件 - 业界最佳实践实现
 * 特点：
 * 1. 预先计算节点位置，不依赖 DOM
 * 2. 使用 SVG path 绘制连接线
 * 3. 垂直主线 + 水平分支的规范路径
 */
export default function TreeConnectors({
  connections,
  lineColor = '#d1d5db',
  lineWidth = 2,
}: TreeConnectorsProps) {
  /**
   * 生成连接线的 SVG 路径
   * 路径规则：父节点右中点 → 垂直向下 → 水平分支 → 子节点左中点
   */
  const generateConnectorPath = (
    parentX: number,
    parentY: number,
    parentWidth: number,
    parentHeight: number,
    children: Array<{ x: number; y: number; width: number; height: number }>
  ): string => {
    if (children.length === 0) return '';

    // 父节点右中点
    const parentRightMidX = parentX + parentWidth;
    const parentRightMidY = parentY + parentHeight / 2;

    // 主线起点：父节点右中点向下偏移
    const mainLineStartX = parentRightMidX;
    const mainLineStartY = parentRightMidY + LAYOUT_CONFIG.MAIN_LINE_OFFSET;

    // 主线终点：最下方子节点的 Y 坐标
    const mainLineEndY = Math.max(...children.map(p => p.y + p.height / 2));

    // 水平连接线的 X 坐标（父节点和子节点之间的中间位置）
    const horizontalLineX = parentRightMidX + LAYOUT_CONFIG.HORIZONTAL_GAP / 2;

    // 构建路径
    let path = '';

    // 1. 父节点右中点到主线起点（垂直向下）
    path += `M ${parentRightMidX} ${parentRightMidY} `;
    path += `L ${mainLineStartX} ${mainLineStartY} `;

    // 2. 垂直主线（从第一个子节点到最后一个子节点）
    if (children.length > 1) {
      // 计算第一个子节点的 Y 坐标
      const firstChildY = children[0].y + children[0].height / 2;
      path += `L ${mainLineStartX} ${firstChildY} `;
    }

    // 3. 为每个子节点绘制水平分支
    children.forEach((child, index) => {
      const childLeftMidX = child.x;
      const childLeftMidY = child.y + child.height / 2;

      // 从主线到子节点的水平分支
      path += `M ${mainLineStartX} ${childLeftMidY} `;
      path += `L ${horizontalLineX} ${childLeftMidY} `;
      path += `L ${childLeftMidX} ${childLeftMidY} `;
    });

    return path;
  };

  /**
   * 计算画布边界
   */
  const calculateCanvasBounds = () => {
    if (connections.length === 0) {
      return { minX: 0, minY: 0, maxX: 500, maxY: 500 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    connections.forEach(conn => {
      minX = Math.min(minX, conn.parentX);
      minY = Math.min(minY, conn.parentY);
      maxX = Math.max(maxX, conn.parentX + conn.parentWidth);
      maxY = Math.max(maxY, conn.parentY + conn.parentHeight);

      conn.children.forEach(child => {
        minX = Math.min(minX, child.x);
        minY = Math.min(minY, child.y);
        maxX = Math.max(maxX, child.x + child.width);
        maxY = Math.max(maxY, child.y + child.height);
      });
    });

    return {
      minX: minX - 50,
      minY: minY - 50,
      maxX: maxX + 50,
      maxY: maxY + 50,
    };
  };

  const bounds = calculateCanvasBounds();

  return (
    <svg
      width="100%"
      height="100%"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`}
    >
      {connections.map((conn, index) => (
        <path
          key={`connector-${index}`}
          d={generateConnectorPath(
            conn.parentX,
            conn.parentY,
            conn.parentWidth,
            conn.parentHeight,
            conn.children
          )}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/**
 * 辅助函数：计算节点的位置信息
 * 这是一个纯函数，不依赖 DOM
 */
export function calculateNodePositions(
  tree: any[],
  startX: number = 0,
  startY: number = 0
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  const calculatePositions = (
    nodes: any[],
    level: number,
    startY: number
  ) => {
    let currentY = startY;

    nodes.forEach((node) => {
      const x = startX + level * (LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_GAP);
      const y = currentY;

      positions.set(node.id, {
        id: node.id,
        x,
        y,
        width: LAYOUT_CONFIG.NODE_WIDTH,
        height: LAYOUT_CONFIG.NODE_HEIGHT,
      });

      // 递归计算子节点位置
      if (node.children && node.children.length > 0) {
        calculatePositions(node.children, level + 1, currentY);
        // 更新下一个节点的 Y 坐标（考虑子节点的高度）
        const childrenHeight =
          node.children.length * LAYOUT_CONFIG.NODE_HEIGHT +
          (node.children.length - 1) * LAYOUT_CONFIG.VERTICAL_GAP;
        currentY += Math.max(LAYOUT_CONFIG.NODE_HEIGHT, childrenHeight) + LAYOUT_CONFIG.VERTICAL_GAP;
      } else {
        currentY += LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_GAP;
      }
    });
  };

  calculatePositions(tree, 0, startY);
  return positions;
}

/**
 * 辅助函数：收集所有连接关系
 */
export function collectConnections(tree: any[]): Connection[] {
  const connections: Connection[] = [];

  const collect = (node: any) => {
    if (node.children && node.children.length > 0) {
      connections.push({
        parentId: node.id,
        parentX: 0, // 这里的坐标会在使用时从 positions 中获取
        parentY: 0,
        parentWidth: LAYOUT_CONFIG.NODE_WIDTH,
        parentHeight: LAYOUT_CONFIG.NODE_HEIGHT,
        children: node.children.map((child: any) => ({
          id: child.id,
          x: 0,
          y: 0,
          width: LAYOUT_CONFIG.NODE_WIDTH,
          height: LAYOUT_CONFIG.NODE_HEIGHT,
        })),
      });

      node.children.forEach(collect);
    }
  };

  tree.forEach(collect);
  return connections;
}
