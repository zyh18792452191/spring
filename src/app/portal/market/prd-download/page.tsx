'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

export default function PRDDownloadPage() {
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 获取最新的下载链接
  const getLatestDownloadLink = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. 生成PRD内容
      const prdResponse = await fetch('/api/prd-home-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!prdResponse.ok) {
        throw new Error(`生成PRD失败: ${prdResponse.status}`);
      }

      const reader = prdResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
      }

      // 2. 生成Word文档
      const wordResponse = await fetch('/api/generate-prd-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!wordResponse.ok) {
        throw new Error(`生成Word失败: ${wordResponse.status}`);
      }

      const wordData = await wordResponse.json();

      if (wordData.success && wordData.downloadUrl) {
        setDownloadUrl(wordData.downloadUrl);
        setFilename('市场运营平台首页PRD.docx');
      } else {
        throw new Error('生成Word文档失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取下载链接失败');
      console.error('Get download link error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取最新链接
  useEffect(() => {
    getLatestDownloadLink();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            市场运营平台首页 PRD 文档下载
          </h1>
          <p className="text-gray-600">
            点击下方按钮下载最新的PRD文档
          </p>
        </div>

        {/* 下载卡片 */}
        <Card className="p-8 bg-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-600 font-semibold flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                正在生成最新文档...
              </p>
            </div>
          )}

          {downloadUrl && (
            <div className="text-center">
              <a
                href={downloadUrl}
                download={filename}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="w-6 h-6" />
                下载市场运营平台首页PRD文档
              </a>

              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600">
                  文件名：{filename}
                </p>
                <p className="text-sm text-gray-600">
                  更新时间：{new Date().toLocaleString('zh-CN')}
                </p>
                <p className="text-xs text-gray-500">
                  链接有效期：7天
                </p>
              </div>

              <div className="mt-8 pt-6 border-t">
                <Button
                  onClick={getLatestDownloadLink}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  刷新并生成最新文档
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 说明 */}
        <Card className="mt-6 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>1. 点击"下载市场运营平台首页PRD文档"按钮即可下载</li>
            <li>2. 如需最新版本，点击"刷新并生成最新文档"按钮</li>
            <li>3. 下载链接有效期为7天，过期后需重新生成</li>
            <li>4. 文档基于实际代码生成，确保内容与页面功能一致</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
