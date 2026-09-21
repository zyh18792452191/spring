'use client';

import { useEffect, useState } from 'react';
import { PageEditor } from '@/components/PageEditor';
import FloatingEditorButton from '@/components/FloatingEditorButton';

interface EditorWrapperProps {
  children: React.ReactNode;
}

export default function EditorWrapper({ children }: EditorWrapperProps) {
  const [editorEnabled, setEditorEnabled] = useState(false);

  useEffect(() => {
    // 检查URL参数（只有URL参数明确指定时才改变状态）
    const urlParams = new URLSearchParams(window.location.search);
    const editorParam = urlParams.get('editor');

    // 只有URL参数明确指定时才改变默认状态
    if (editorParam === 'true') {
      setEditorEnabled(true);
      localStorage.setItem('page-editor-enabled', 'true');
    } else if (editorParam === 'false') {
      setEditorEnabled(false);
      localStorage.setItem('page-editor-enabled', 'false');
    }
    // 默认状态始终是false（不启用），不再从localStorage恢复
  }, []);

  // 监听键盘快捷键（Ctrl+Shift+E 或 Cmd+Shift+E）切换编辑器
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const newState = !editorEnabled;
        setEditorEnabled(newState);
        localStorage.setItem('page-editor-enabled', String(newState));

        // 显示提示
        if (newState) {
          alert('✅ 页面编辑器已启用\n\n' +
            '点击任意元素进行编辑\n' +
            '按 Ctrl+Shift+E 或 Cmd+Shift+E 关闭编辑器\n' +
            '或点击右下角的浮动按钮');
        } else {
          alert('🚫 页面编辑器已禁用');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editorEnabled]);

  const toggleEditor = () => {
    const newState = !editorEnabled;
    console.log('EditorWrapper: 切换编辑器状态', {
      enabled: editorEnabled,
      newState: newState
    });
    setEditorEnabled(newState);
    localStorage.setItem('page-editor-enabled', String(newState));

    if (newState) {
      alert('✅ 页面编辑器已启用\n\n' +
        '点击任意元素进行编辑\n' +
        '按 Ctrl+Shift+E 或 Cmd+Shift+E 关闭编辑器\n' +
        '或再次点击浮动按钮');
    }
  };

  return (
    <>
      <PageEditor enabled={editorEnabled}>{children}</PageEditor>
      {/* 浮动编辑按钮 - 已隐藏 */}
      {/* <FloatingEditorButton isEnabled={editorEnabled} onToggle={toggleEditor} /> */}
    </>
  );
}
