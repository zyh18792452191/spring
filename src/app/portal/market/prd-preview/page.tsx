'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PRDPreviewPage() {
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePreview = async () => {
    setIsGenerating(true);
    setPreviewContent('');
    setError('');

    try {
      const response = await fetch('/api/generate-prd-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codeContext: 'market operation platform overview page',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PRD preview');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setPreviewContent(fullContent);

        // 自动滚动到底部
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PRD文档预览</h1>
          <p className="text-sm text-gray-500 mt-1">市场运营平台首页 - 产品需求文档</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generatePreview}
            disabled={isGenerating}
            className="bg-[#0085D0] hover:bg-[#006DB8]"
          >
            {isGenerating ? '生成中...' : '生成预览文档'}
          </Button>
          {previewContent && (
            <Button variant="outline" onClick={() => {
              const blob = new Blob([previewContent], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'prd-preview.md';
              a.click();
              URL.revokeObjectURL(url);
            }}>
              下载Markdown
            </Button>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* 预览内容区域 */}
      <Card className="p-6">
        {isGenerating && !previewContent && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085D0] mx-auto"></div>
              <p className="mt-4 text-gray-600">正在生成PRD预览文档...</p>
              <p className="text-sm text-gray-500 mt-2">基于实际代码分析功能点</p>
            </div>
          </div>
        )}

        {previewContent && (
          <div
            ref={contentRef}
            className="prose max-w-none overflow-auto max-h-[70vh]"
            style={{
              fontFamily: 'FangSong, 仿宋, serif',
              fontSize: '14px',
              lineHeight: '1.8',
            }}
          >
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{
                __html: previewContent
                  .replace(/^### (.*$)/gim, '<h3 style="font-family: FangSong, 仿宋, serif; font-size: 16px; font-weight: bold; margin: 20px 0 10px 0;">$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2 style="font-family: SimHei, 黑体, sans-serif; font-size: 18px; font-weight: bold; margin: 25px 0 15px 0;">$1</h2>')
                  .replace(/^# (.*$)/gim, '<h1 style="font-family: SimHei, 黑体, sans-serif; font-size: 22px; font-weight: bold; margin: 30px 0 20px 0;">$1</h1>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br>')
              }}
            />
          </div>
        )}

        {!isGenerating && !previewContent && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 mb-2">点击"生成预览文档"按钮</p>
              <p className="text-sm text-gray-500">系统将基于项目代码分析实际功能点</p>
              <p className="text-sm text-gray-500">生成严谨的PRD预览文档</p>
            </div>
          </div>
        )}
      </Card>

      {/* 说明信息 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📌 说明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 本预览文档严格基于项目代码分析生成，不包含任何臆造功能</li>
          <li>• 所有功能描述均与DispatchTrackingNew.tsx组件实际功能一致</li>
          <li>• 请仔细确认文档内容后，再生成最终Word文档</li>
          <li>• 确认无误后，将生成符合企业标准的Word文档（黑体标题、仿宋正文）</li>
        </ul>
      </Card>
    </div>
  );
}
