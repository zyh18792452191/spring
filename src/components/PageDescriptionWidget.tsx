'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Save, Edit2, Eye, EyeOff, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePathname } from 'next/navigation';

interface PageDescription {
  path: string;
  description: string;
  last_updated: string;
}

/**
 * 页面业务说明组件
 * 支持展开/收起、编辑/保存功能
 * 说明数据存储在 Supabase 数据库中
 */
export function PageDescriptionWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [editText, setEditText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);

    // 从 localStorage 读取隐藏状态（策略相关页面不隐藏）
    const isStrategyPage = pathname?.includes('/workspace/strategy');
    if (isStrategyPage) {
      setIsHidden(false);
    } else {
      const hiddenState = localStorage.getItem('page-description-widget-hidden');
      if (hiddenState === 'true') {
        setIsHidden(true);
      }
    }
  }, [pathname]);

  // 监听键盘快捷键（Ctrl+Shift+D 或 Cmd+Shift+D）切换显示/隐藏
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const newState = !isHidden;
        setIsHidden(newState);
        localStorage.setItem('page-description-widget-hidden', String(newState));
      }
    };

    if (isClient) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isHidden, isClient]);

  // 从 API 加载说明
  useEffect(() => {
    if (!isClient || !pathname) return;

    const loadDescription = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/page-descriptions?path=${encodeURIComponent(pathname)}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDescription(result.data.description || '');
          setEditText(result.data.description || '');
          setHasDescription(!!result.data.description?.trim());
          setLastUpdated(result.data.last_updated || null);
        } else {
          setDescription('');
          setEditText('');
          setHasDescription(false);
          setLastUpdated(null);
        }
      } catch (error) {
        console.error('加载页面说明失败:', error);
        setDescription('');
        setEditText('');
        setHasDescription(false);
        setLastUpdated(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDescription();
  }, [pathname, isClient]);

  // 保存说明到 API
  const handleSave = async () => {
    if (!isClient) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/page-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: pathname,
          description: editText,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDescription(editText);
        setHasDescription(!!editText.trim());
        setLastUpdated(result.data.last_updated || null);
        setIsEditing(false);
      } else {
        alert('保存失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('保存页面说明失败:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditText(description);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditText(description);
    setIsEditing(true);
  };

  const handleHide = () => {
    setIsHidden(true);
    localStorage.setItem('page-description-widget-hidden', 'true');
    setIsOpen(false);
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.setItem('page-description-widget-hidden', 'false');
  };

  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 在主要业务页面显示，不在登录页显示
  // 策略页面始终显示，不需要等待 isClient
  const isStrategyPage = pathname?.includes('/workspace/strategy');
  
  if (!isClient && !isStrategyPage) {
    return null;
  }

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && !isHidden && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className="fixed bottom-6 right-6 z-[99999] flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">业务说明</span>
          {hasDescription && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">已填写</span>
          )}
        </button>
      )}

      {/* 说明面板 */}
      {isOpen && !isHidden && (
        <div
          className="w-[90vw] md:w-[70vw] lg:w-[60vw] max-w-[1200px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* 面板头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">页面业务说明</span>
              {lastUpdated && !isEditing && (
                <span className="text-xs text-blue-100 flex items-center gap-1 ml-2">
                  <Clock className="w-3 h-3" />
                  {lastUpdated}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!isEditing && hasDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-7 w-7 p-0 text-white hover:bg-blue-500"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 text-white hover:bg-blue-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 面板内容 */}
          {!isMinimized && (
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              {isEditing ? (
                /* 编辑模式 */
                <div className="flex flex-col space-y-3 h-full">
                  <div className="flex-1 overflow-hidden">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="请输入该页面的业务逻辑和说明...&#10;&#10;例如：&#10;1. 页面功能概述&#10;2. 主要业务流程&#10;3. 注意事项&#10;4. 相关指标说明"
                      className="min-h-[400px] max-h-[65vh] w-full resize-none text-sm"
                      style={{ height: 'calc(65vh - 120px)' }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{editText.length} 字符</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="gap-1"
                      >
                        <X className="w-3 h-3" />
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Clock className="w-3 h-3 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            保存
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 查看模式 */
                <div className="flex flex-col space-y-3 h-full">
                  {description ? (
                    <div className="prose prose-sm max-w-none overflow-y-auto flex-1" style={{ maxHeight: 'calc(65vh - 80px)' }}>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm p-1">
                        {description}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 flex-1">
                      <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">暂无业务说明</p>
                      <p className="text-xs mt-1">点击编辑按钮添加说明</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleHide}
                      className="gap-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <EyeOff className="w-3 h-3" />
                      隐藏按钮
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="w-3 h-3" />
                      {description ? '编辑说明' : '添加说明'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 恢复图标 - 当按钮被隐藏时显示 */}
      {isHidden && (
        <button
          onClick={handleShow}
          className="fixed bottom-6 right-6 z-[99999] flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="显示业务说明按钮（快捷键：Ctrl+Shift+D）"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
