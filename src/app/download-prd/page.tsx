'use client';

import React, { useState, useEffect } from 'react';

interface PrdVersion {
  version: string;
  fileName: string;
  downloadUrl: string;
  fileSize?: number;
  notes: string[];
}

export default function DownloadPRDPage() {
  const [v26Data, setV26Data] = useState<PrdVersion | null>(null);
  const [v27Data, setV27Data] = useState<PrdVersion | null>(null);
  const [v28Data, setV28Data] = useState<PrdVersion | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<'v26' | 'v27' | 'v28'>('v28');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 同时获取三个版本
    Promise.all([
      fetch('/api/upload-prd-to-storage', { method: 'POST' }).then(res => res.json()),
      fetch('/api/upload-prd-v27', { method: 'POST' }).then(res => res.json()),
      fetch('/api/upload-prd-v28', { method: 'POST' }).then(res => res.json()),
    ])
      .then(([v26, v27, v28]) => {
        if (v26.success) setV26Data(v26);
        if (v27.success) setV27Data(v27);
        if (v28.success) setV28Data(v28);
      })
      .catch(err => {
        setError('获取下载链接失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const currentData = selectedVersion === 'v26' ? v26Data : selectedVersion === 'v27' ? v27Data : v28Data;

  const handleDownload = async () => {
    if (!currentData?.downloadUrl) return;

    try {
      const response = await fetch(currentData.downloadUrl);
      if (!response.ok) throw new Error('下载失败');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = currentData.fileName || '市场运营平台首页PRD.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载错误:', error);
      alert('下载失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || (!v26Data && !v27Data)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600">{error || '无法获取文档信息'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center">
          {/* 图标 */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            市场运营平台首页 PRD
          </h1>
          <p className="text-sm font-semibold text-blue-600 mb-4">
            {currentData?.version || '最新版本'}
          </p>

          {/* 版本选择 */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setSelectedVersion('v26')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedVersion === 'v26'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!v26Data}
            >
              v26
            </button>
            <button
              onClick={() => setSelectedVersion('v27')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedVersion === 'v27'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!v27Data}
            >
              v27
            </button>
            <button
              onClick={() => setSelectedVersion('v28')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedVersion === 'v28'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!v28Data}
            >
              v28
            </button>
          </div>

          {/* 描述 */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            基于实际代码生成的严谨 PRD 文档，可直接交付给开发团队使用。
          </p>

          {/* 文档特点 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6 text-left">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              文档特点：
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>与实际代码 <strong>100%</strong> 一致</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>移除所有臆造内容</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>详细的业务逻辑说明</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>清晰的指标定义</span>
              </li>
            </ul>
          </div>

          {/* 修改说明 */}
          {currentData?.notes && currentData.notes.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-left">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                修改说明：
              </h3>
              <ul className="text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                {currentData.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载文档
          </button>

          {/* 文件信息 */}
          <p className="mt-4 text-xs text-gray-500">
            文件大小: {((currentData?.fileSize || 0) / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
    </div>
  );
}
