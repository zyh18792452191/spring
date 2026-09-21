'use client';

import { useEffect, useState } from 'react';

export default function PRDPreviewPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/prd-home-preview');
      const text = await response.text();
      setContent(text);
      setLoading(false);
    } catch (err) {
      setError('加载预览内容失败');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-blue-500">
            市场运营平台首页 PRD 预览
          </h1>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-mono text-gray-700">
              {content}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            打印预览
          </button>
          <button
            onClick={fetchContent}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            刷新内容
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-semibold mb-2">确认说明：</p>
          <p>1. 请仔细阅读以上PRD内容</p>
          <p>2. 如内容符合要求，请告知我生成Word文档</p>
          <p>3. 如需调整，请告知具体修改内容</p>
        </div>
      </div>
    </div>
  );
}
