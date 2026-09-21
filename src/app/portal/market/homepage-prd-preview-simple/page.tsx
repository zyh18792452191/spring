'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';

export default function SimplePRDPreviewPage() {
  const [content, setContent] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string>('');

  // 生成PRD预览
  const generatePreview = async () => {
    setIsGenerating(true);
    setError('');
    setContent('');
    setDownloadUrl('');

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

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        fullContent += text;
        setContent(fullContent);
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
    if (content) {
      navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // 生成Word文档
  const generateWord = async () => {
    if (!content) {
      setError('请先生成PRD内容');
      return;
    }

    try {
      const response = await fetch('/api/generate-prd-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`生成Word失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      } else {
        throw new Error('生成Word文档失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成Word失败');
      console.error('Generate Word error:', err);
    }
  };

  // 页面加载时自动生成
  useEffect(() => {
    generatePreview();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            市场运营平台首页 PRD 文档预览
          </h1>
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
            onClick={generateWord}
            disabled={!content || isGenerating}
            variant="default"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            生成Word文档
          </Button>
        </div>

        {/* Word文档下载链接 */}
        {downloadUrl && (
          <Card className="mb-6 p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Word文档已生成
                </h4>
                <p className="text-sm text-green-700">
                  点击下方按钮下载文档（有效期7天）
                </p>
              </div>
              <a
                href={downloadUrl}
                download="市场运营平台首页PRD.docx"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-lg font-semibold"
              >
                <Download className="w-5 h-5" />
                下载Word文档
              </a>
            </div>
          </Card>
        )}

        {/* 错误提示 */}
        {error && (
          <Card className="mb-6 p-6 bg-red-50 border-red-200">
            <p className="text-red-600 font-semibold">{error}</p>
          </Card>
        )}

        {/* 生成状态提示 */}
        {isGenerating && (
          <Card className="mb-6 p-6 bg-blue-50 border-blue-200">
            <p className="text-blue-600 font-semibold">
              正在生成PRD文档，请稍候...
            </p>
          </Card>
        )}

        {/* 文档内容预览 */}
        {content && (
          <Card className="p-8 bg-white">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {content}
            </div>
          </Card>
        )}

        {/* 空状态 */}
        {!isGenerating && !content && !error && (
          <Card className="p-12 bg-white text-center">
            <p className="text-gray-500 mb-4">正在初始化PRD文档...</p>
          </Card>
        )}
      </div>
    </div>
  );
}
