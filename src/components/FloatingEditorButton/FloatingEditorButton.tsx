'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';

interface FloatingEditorButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export default function FloatingEditorButton({ isEnabled, onToggle }: FloatingEditorButtonProps) {
  const [position, setPosition] = useState({ x: 20, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖动
  const mouseDownPos = useRef({ x: 0, y: 0 }); // 记录鼠标按下时的初始位置
  const startButtonPos = useRef({ x: 0, y: 0 }); // 记录按钮初始位置
  const buttonRef = useRef<HTMLDivElement>(null);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
    // 默认位置：右下角
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
  }, []);

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 只响应左键
      setIsDragging(true);
      mouseDownPos.current = {
        x: e.clientX,
        y: e.clientY
      };
      startButtonPos.current = { ...position }; // 记录按钮初始位置
    }
  };

  // 处理鼠标移动（拖动）
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    // 计算鼠标移动距离
    const deltaX = e.clientX - mouseDownPos.current.x;
    const deltaY = e.clientY - mouseDownPos.current.y;

    // 计算新位置
    const newX = startButtonPos.current.x + deltaX;
    const newY = startButtonPos.current.y + deltaY;

    // 限制在窗口范围内
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  // 处理鼠标释放
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);

    // 计算总移动距离
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPos.current.x, 2) +
      Math.pow(e.clientY - mouseDownPos.current.y, 2)
    );

    console.log('FloatingEditorButton: 鼠标释放，移动距离:', moveDistance);

    // 如果移动距离小于5像素，认为是点击
    if (moveDistance < 5) {
      console.log('FloatingEditorButton: 触发点击事件');
      onToggle();
    } else {
      console.log('FloatingEditorButton: 拖动结束，不触发点击');
    }
  };

  // 监听鼠标移动和释放
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      handleMouseMove(e);
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]); // 只依赖isDragging状态

  // 如果不在客户端，不渲染
  if (!isClient) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className={`fixed z-[9999] w-14 h-14 rounded-full shadow-2xl cursor-move flex items-center justify-center transition-all duration-300 ${
        isEnabled
          ? 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-200 ring-opacity-50'
          : 'bg-slate-700 hover:bg-slate-600'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      title={isEnabled ? '点击关闭编辑器' : '点击开启编辑器'}
    >
      {isEnabled ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <Edit2 className="w-6 h-6 text-white" />
      )}
    </div>
  );
}
