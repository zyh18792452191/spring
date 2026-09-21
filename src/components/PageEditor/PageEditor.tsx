'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Edit2, Save, X, Move, Type, Palette, Layout, AlignCenter, Eye, EyeOff, Undo, Redo, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PropertyPanel from './PropertyPanel';
import ChangesPanel from './ChangesPanel';
import { ensureElementHasId } from '@/lib/utils/uniqueId';

interface ElementInfo {
  element: HTMLElement;
  elementId: string; // 唯一元素ID
  tagName: string;
  className: string;
  styles: CSSStyleDeclaration;
  attributes: Record<string, string>;
  bounds: DOMRect;
}

interface PageEditorProps {
  enabled?: boolean;
  onSave?: (changes: any[]) => void;
  children: React.ReactNode;
}

// 修改记录接口
interface EditChange {
  id: string;
  selector: string;
  type: 'style' | 'content' | 'attribute';
  property: string;
  value: string;
  oldValue: string;
  timestamp: number;
  elementId?: string;
  elementClass?: string;
}

export default function PageEditor({ enabled = false, onSave, children }: PageEditorProps) {
  // isEditMode 应该跟随 enabled prop 的变化
  const [isEditMode, setIsEditMode] = useState(enabled);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [changes, setChanges] = useState<EditChange[]>([]);
  const [showChangesPanel, setShowChangesPanel] = useState(false);
  const editorOverlayRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 当 enabled prop 变化时，同步更新 isEditMode
  useEffect(() => {
    console.log('PageEditor: enabled prop 变化', { enabled, isEditMode });
    setIsEditMode(enabled);
    if (!enabled) {
      // 禁用编辑器时，清除选中状态和高亮
      setSelectedElement(null);
      clearHighlight();
    }
  }, [enabled]);

  // 切换编辑模式（供内部使用，实际由父组件控制）
  const toggleEditMode = () => {
    const newState = !isEditMode;
    setIsEditMode(newState);
    setSelectedElement(null);
  };

  // 处理元素点击
  const handleElementClick = (e: MouseEvent) => {
    if (!isEditMode) return;

    const target = e.target as HTMLElement;

    // 检查是否点击了编辑器面板或控件内的元素
    if (!target || target.closest('.editor-panel') || target.closest('.editor-controls') || target.closest('.editor-floating-button')) {
      return;
    }

    // 阻止事件继续传播
    e.preventDefault();
    e.stopPropagation();

    // 确保元素有唯一ID
    const elementId = ensureElementHasId(target);

    // 获取元素信息
    const elementInfo: ElementInfo = {
      element: target,
      elementId, // 使用唯一ID
      tagName: target.tagName.toLowerCase(),
      className: target.className,
      styles: window.getComputedStyle(target),
      attributes: Array.from(target.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      bounds: target.getBoundingClientRect(),
    };

    setSelectedElement(elementInfo);
    highlightElement(target);
  };

  // 高亮选中元素
  const highlightElement = (element: HTMLElement) => {
    // 移除之前的高亮
    document.querySelectorAll('.editor-highlight').forEach(el => el.remove());

    // 添加新高亮
    const highlight = document.createElement('div');
    highlight.className = 'editor-highlight';
    highlight.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 2px solid #0085D0;
      background: rgba(0, 133, 208, 0.1);
      z-index: 9998;
    `;

    const updateHighlight = () => {
      const rect = element.getBoundingClientRect();
      highlight.style.left = `${rect.left}px`;
      highlight.style.top = `${rect.top}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
    };

    updateHighlight();
    document.body.appendChild(highlight);

    // 监听窗口大小变化
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    resizeObserverRef.current = new ResizeObserver(updateHighlight);
    resizeObserverRef.current.observe(element);
  };

  // 清除高亮
  const clearHighlight = () => {
    document.querySelectorAll('.editor-highlight').forEach(el => el.remove());
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
  };

  // 记录修改
  const recordChange = (
    type: 'style' | 'content' | 'attribute',
    property: string,
    value: string,
    oldValue: string
  ) => {
    console.log('recordChange 被调用:', {
      type,
      property,
      value,
      oldValue,
      hasSelectedElement: !!selectedElement,
      changesCount: changes.length,
    });

    if (!selectedElement) {
      console.error('recordChange: selectedElement 为 null，无法记录修改！');
      return;
    }

    const change: EditChange = {
      id: `change-${Date.now()}-${Math.random()}`,
      selector: `[data-editor-id="${selectedElement.elementId}"]`, // 使用唯一ID作为选择器
      type,
      property,
      value,
      oldValue,
      timestamp: Date.now(),
      elementId: selectedElement.elementId, // 使用唯一ID
      elementClass: selectedElement.className || undefined,
    };

    setChanges((prev) => {
      const newChanges = [...prev, change];
      console.log('setChanges 更新:', {
        oldCount: prev.length,
        newCount: newChanges.length,
      });
      return newChanges;
    });

    console.log('记录修改成功:', change);
  };

  // 更新元素样式
  const updateElementStyle = (property: string, value: string) => {
    console.log('updateElementStyle 被调用:', { property, value, hasSelectedElement: !!selectedElement });
    if (!selectedElement) return;

    const oldValue = selectedElement.styles.getPropertyValue(property);
    console.log('更新样式:', { property, oldValue, newValue: value });

    selectedElement.element.style.setProperty(property, value);

    // 记录修改
    recordChange('style', property, value, oldValue);

    highlightElement(selectedElement.element);
  };

  // 更新元素属性
  const updateElementAttribute = (name: string, value: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.attributes[name] || '';
    selectedElement.element.setAttribute(name, value);

    // 记录修改
    recordChange('attribute', name, value, oldValue);

    highlightElement(selectedElement.element);
  };

  // 更新元素内容
  const updateElementContent = (value: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.element.textContent || '';
    selectedElement.element.textContent = value;

    // 记录修改
    recordChange('content', 'textContent', value, oldValue);

    highlightElement(selectedElement.element);
  };

  // 保存更改
  const handleSave = async () => {
    console.log('handleSave 被调用', { changesCount: changes.length });
    if (changes.length === 0) {
      alert('没有需要保存的修改');
      return;
    }

    try {
      console.log('开始保存修改...', changes);
      // 调用API保存修改
      const response = await fetch('/api/page-editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes,
          pagePath: window.location.pathname,
        }),
      });

      const result = await response.json();
      console.log('保存API返回结果:', result);

      if (result.success) {
        alert(
          `✅ 保存成功！\n\n` +
          `已保存 ${changes.length} 处修改到源文件\n` +
          `文件路径: ${result.filePath || '未指定'}\n\n` +
          `⚠️ 重要：需要刷新页面才能看到更新后的内容\n\n` +
          `点击"确定"立即刷新页面\n` +
          `点击"取消"稍后手动刷新（Ctrl+F5 或 Cmd+Shift+R 强制刷新）`
        );
        console.log('保存结果:', result);

        // 清空修改记录
        setChanges([]);
        setSelectedElement(null);
        clearHighlight();

        // 保存成功后，立即刷新页面
        setTimeout(() => {
          console.log('正在刷新页面以加载更新后的内容...');
          // 强制刷新（绕过缓存）
          window.location.href = window.location.href;
        }, 500);
      } else {
        alert(`❌ 保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请查看控制台日志');
    }
  };

  // 导出修改记录
  const exportChanges = () => {
    const report = changes
      .map(
        (change) =>
          `${change.type.toUpperCase()}: ${change.property}\n` +
          `  旧值: ${change.oldValue}\n` +
          `  新值: ${change.value}\n` +
          `  选择器: ${change.selector}\n`
      )
      .join('\n');

    console.log('修改记录:\n', report);
    alert(
      `已导出 ${changes.length} 处修改到控制台\n\n` +
      `请按F12打开控制台查看详细记录\n\n` +
      `提示: 代码自动保存功能正在开发中\n当前需要手动修改代码文件`
    );
  };

  // 清除修改记录
  const clearChanges = () => {
    if (changes.length === 0) return;
    if (confirm(`确定要清除所有 ${changes.length} 条修改记录吗？`)) {
      setChanges([]);
    }
  };

  // 清除选中
  const handleClear = () => {
    console.log('handleClear 被调用');
    setSelectedElement(null);
    clearHighlight();
  };

  // 添加全局点击监听
  useEffect(() => {
    if (!isEditMode) {
      clearHighlight();
      return;
    }

    document.addEventListener('click', handleElementClick, true);

    return () => {
      document.removeEventListener('click', handleElementClick, true);
      clearHighlight();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isEditMode]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearHighlight();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* 编辑模式提示 */}
      {isEditMode && (
        <div className="fixed top-4 left-4 z-[9999] editor-controls">
          <Card className="p-3 shadow-lg bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 text-sm">
              <Edit2 className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">编辑模式已开启</span>
              <span className="text-blue-600">- 点击任意元素进行编辑</span>
              {changes.length > 0 && (
                <span className="text-red-600">（{changes.length} 处修改）</span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 页面内容 */}
      {children}

      {/* 属性编辑面板 */}
      {isEditMode && selectedElement && (
        <PropertyPanel
          element={selectedElement}
          onUpdateStyle={updateElementStyle}
          onUpdateAttribute={updateElementAttribute}
          onUpdateContent={updateElementContent}
          onClose={handleClear}
          onSave={handleSave}
        />
      )}

      {/* 修改记录面板 */}
      {isEditMode && changes.length > 0 && (
        <ChangesPanel
          changes={changes}
          onClear={clearChanges}
          onExport={exportChanges}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
