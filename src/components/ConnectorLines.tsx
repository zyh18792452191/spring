'use client';

import { useRef, useEffect } from 'react';

interface ConnectorLinesProps {
  parentElement: HTMLElement | null;
  childrenElements: HTMLElement[];
  lineColor?: string;
  lineWidth?: number;
}

/**
 * SVG 连接线组件
 * 根据父节点和子节点的位置，绘制精确的连接线
 */
export default function ConnectorLines({
  parentElement,
  childrenElements,
  lineColor = '#d1d5db',
  lineWidth = 2,
}: ConnectorLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !parentElement) return;

    // 清除旧的连接线
    svgRef.current.innerHTML = '';

    const parentRect = parentElement.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();

    // 父节点底部中心点（相对于 SVG）
    const startX = parentRect.left + parentRect.width / 2 - svgRect.left;
    const startY = parentRect.bottom - svgRect.top;

    // 绘制连接线
    childrenElements.forEach((childEl, index) => {
      if (!childEl) return;

      const childRect = childEl.getBoundingClientRect();

      // 子节点顶部中心点（相对于 SVG）
      const endX = childRect.left + childRect.width / 2 - svgRect.left;
      const endY = childRect.top - svgRect.top;

      // 判断是否需要折线（水平偏移 > 10px）
      const isOffset = Math.abs(startX - endX) > 10;

      // 生成路径
      let pathD = '';
      if (isOffset) {
        // 直角折线：父节点底部 → 垂直向下 → 水平向子节点 → 垂直向下到子节点
        const midY = startY + (endY - startY) / 2;
        pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
      } else {
        // 纯垂直线
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
      }

      // 创建路径元素
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('stroke', lineColor);
      path.setAttribute('stroke-width', lineWidth.toString());
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');

      svgRef.current!.appendChild(path);
    });
  }, [parentElement, childrenElements, lineColor, lineWidth]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
