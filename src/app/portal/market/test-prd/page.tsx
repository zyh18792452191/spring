'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TestPRDPage() {
  const [content, setContent] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 生成PRD预览
  const generatePreview = async () => {
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
          filename: `市场运营平台首页PRD_${new Date().toISOString().slice(0, 10)}.docx`,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">市场运营平台首页 PRD 文档测试</h1>

      <div className="flex gap-4 mb-6">
        <Button onClick={generatePreview}>生成PRD预览</Button>
        <Button onClick={generateWord} disabled={!content}>生成Word文档</Button>
      </div>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {downloadUrl && (
        <Card className="mb-6 p-4 bg-green-50 border-green-200">
          <a
            href={downloadUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            下载Word文档（有效期7天）
          </a>
        </Card>
      )}

      {content && (
        <Card className="p-6">
          <div className="prose max-w-none whitespace-pre-wrap">
            {content}
          </div>
        </Card>
      )}
    </div>
  );
}
