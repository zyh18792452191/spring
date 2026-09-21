'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Download, ExternalLink, AlertCircle } from 'lucide-react';

interface DatabaseInitDialogProps {
  open: boolean;
  onClose: () => void;
  onInitSuccess: () => void;
}

export function DatabaseInitDialog({ open, onClose, onInitSuccess }: DatabaseInitDialogProps) {
  const [sqlScript, setSqlScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSqlScript = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/init-db');
      const data = await response.json();

      if (data.success && data.sql) {
        setSqlScript(data.sql);
      }
    } catch (error) {
      console.error('获取SQL脚本失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlScript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'init-database.sql';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleVerify = async () => {
    try {
      const response = await fetch('/api/init-pages-data');
      const data = await response.json();

      if (data.success && data.stats.moduleCount > 0) {
        alert('✓ 数据库已正确初始化！\n\n现在可以开始使用页面管理功能了。');
        onInitSuccess();
        onClose();
      } else {
        alert('✗ 数据库尚未正确初始化。\n\n请确保已在 Supabase SQL Editor 中执行了所有SQL语句。');
      }
    } catch (error) {
      console.error('验证失败:', error);
      alert('验证失败，请检查控制台日志');
    }
  };

  const handleInitData = async () => {
    try {
      const response = await fetch('/api/init-pages-data', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert(`✓ 初始化成功：成功 ${data.successCount} 条，失败 ${data.errorCount} 条`);
        if (data.successCount > 0) {
          onInitSuccess();
          onClose();
        }
      } else {
        alert(`初始化失败: ${data.message}`);
      }
    } catch (error) {
      console.error('初始化失败:', error);
      alert('初始化失败，请查看控制台日志');
    }
  };

  // 当对话框打开时，获取SQL脚本
  if (open && !sqlScript && !loading) {
    fetchSqlScript();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>初始化数据库</DialogTitle>
          <DialogDescription>
            首次使用需要创建数据库表结构
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* 步骤说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">请按以下步骤操作：</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>点击下方"复制SQL"或"下载SQL"获取初始化脚本</li>
                  <li>打开 <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Supabase Dashboard</a></li>
                  <li>进入项目 → SQL Editor</li>
                  <li>粘贴SQL脚本并执行</li>
                  <li>返回此页面，点击"验证并初始化数据"按钮</li>
                </ol>
              </div>
            </div>
          </div>

          {/* SQL脚本显示区域 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">SQL 初始化脚本</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!sqlScript || loading}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      复制SQL
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!sqlScript || loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载SQL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  打开 Supabase
                </Button>
              </div>
            </div>
            <Textarea
              value={loading ? '加载中...' : sqlScript}
              readOnly
              className="font-mono text-xs min-h-[300px]"
              placeholder="SQL脚本将显示在这里..."
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button variant="outline" onClick={handleVerify}>
            验证数据库
          </Button>
          <Button onClick={handleInitData}>
            验证并初始化数据
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
