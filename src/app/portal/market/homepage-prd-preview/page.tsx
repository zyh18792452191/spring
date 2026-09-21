'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';

export default function HomePagePRDPreviewPage() {
  const [content, setContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [downloadInfo, setDownloadInfo] = useState<{
    downloadUrl: string;
    filename: string;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 生成PRD预览
  const generatePreview = async () => {
    setIsGenerating(true);
    setError('');
    setContent('');

    try {
      const response = await fetch('/api/prd-home-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`生成失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setContent(prev => prev + text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      console.error('Generate preview error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制内容
  const copyContent = () => {
    if (contentRef.current) {
      navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // 下载内容为txt文件
  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `首页PRD预览_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 生成Word文档并上传到对象存储
  const generateWordDocument = async () => {
    if (!content) {
      setError('请先生成PRD内容');
      return;
    }

    setIsGeneratingWord(true);
    setError('');

    try {
      const filename = `市场运营平台首页PRD_${new Date().toISOString().slice(0, 10)}.docx`;

      const response = await fetch('/api/generate-prd-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error(`生成Word文档失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        setDownloadInfo({
          downloadUrl: data.downloadUrl,
          filename: data.filename,
        });
      } else {
        throw new Error('生成Word文档失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成Word文档失败，请重试');
      console.error('Generate Word document error:', err);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  // 页面加载时自动生成
  useEffect(() => {
    generatePreview();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">市场运营平台首页 PRD 文档预览</h1>
        <p className="text-gray-600">
          基于实际代码生成，确保文档内容与页面功能严格一致
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={generatePreview}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '生成中...' : '重新生成'}
        </Button>
        <Button
          onClick={copyContent}
          disabled={!content || isGenerating}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {isCopied ? '已复制' : '复制内容'}
        </Button>
        <Button
          onClick={downloadContent}
          disabled={!content || isGenerating}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          下载预览
        </Button>
        <Button
          onClick={generateWordDocument}
          disabled={!content || isGenerating || isGeneratingWord}
          variant="default"
          className="flex items-center gap-2"
        >
          {isGeneratingWord ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGeneratingWord ? '生成中...' : '生成Word文档'}
        </Button>
      </div>

      {/* Word文档下载链接 */}
      {downloadInfo && (
        <Card className="mb-6 p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-900 mb-2">
                Word文档已生成
              </h4>
              <p className="text-sm text-green-700 mb-3">
                文件名：{downloadInfo.filename}
              </p>
            </div>
            <a
              href={downloadInfo.downloadUrl}
              download={downloadInfo.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载Word文档
            </a>
          </div>
          <p className="text-xs text-green-600 mt-3">
            链接有效期：7天
          </p>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Card className="mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* 生成状态提示 */}
      {isGenerating && !content && (
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-600">正在生成PRD文档，请稍候...</p>
        </Card>
      )}

      {/* 文档内容预览 */}
      {content && (
        <Card className="p-6 bg-white">
          <div
            ref={contentRef}
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/\n/g, '<br>')
                .replace(/#{4}\s+(.+)/g, '<h4 class="text-base font-bold mt-4 mb-2">$1</h4>')
                .replace(/#{3}\s+(.+)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
                .replace(/#{2}\s+(.+)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
                .replace(/#{1}\s+(.+)/g, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/- (.+)/g, '<li class="ml-4">$1</li>')
            }}
          />
        </Card>
      )}

      {/* 空状态 */}
      {!isGenerating && !content && !error && (
        <Card className="p-12 bg-white text-center">
          <p className="text-gray-500 mb-4">点击"重新生成"按钮开始生成PRD文档</p>
          <p className="text-sm text-gray-400">
            文档将基于实际代码生成，确保内容与页面功能严格一致
          </p>
        </Card>
      )}
    </div>
  );
}
