'use client';

import React, { useState, useEffect } from 'react';

export default function PrdV22PreviewPage() {
  const [prdData, setPrdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 检查是否已有上传的 PRD
    fetch('/api/upload-prd-to-storage', {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrdData(data);
        } else {
          setError('上传失败');
        }
      })
      .catch(err => {
        setError('获取下载链接失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDownload = async () => {
    if (!prdData?.downloadUrl) return;

    try {
      // 使用公网可访问的签名 URL 下载
      const response = await fetch(prdData.downloadUrl);
      if (!response.ok) throw new Error('下载失败');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = prdData.fileName || '市场运营平台首页PRD_v1.0.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载错误:', error);
      alert('下载失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                市场运营平台首页 PRD v22
              </h1>
              <p className="text-sm font-semibold text-blue-600">修复序号断层版</p>
            </div>
          </div>

          {/* 下载按钮 */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>正在准备下载链接...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : (
              <button
                onClick={handleDownload}
                disabled={!prdData?.downloadUrl}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载 Word 文档
              </button>
            )}

            {prdData && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{(prdData.fileSize / 1024).toFixed(1)} KB</span>
                {' '}| 有效期 {Math.floor(prdData.expiresIn / 86400)} 天
              </div>
            )}
          </div>
        </div>

        {/* PRD 内容预览 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">PRD 内容预览</h2>

          {prdData?.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                本次修正说明：
              </h3>
              <ul className="space-y-2">
                {prdData.notes.map((note: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">核心章节结构：</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">1-2 基础信息</h4>
                <ul className="space-y-1">
                  <li>1. 简介</li>
                  <li>2. 角色定义与权限矩阵</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">3-4 核心规则</h4>
                <ul className="space-y-1">
                  <li>3. 数据权限控制规则</li>
                  <li>4. 业务流程 <span className="text-blue-600 font-semibold">(已修复序号)</span></li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">5-7 业务需求</h4>
                <ul className="space-y-1">
                  <li>5. 营服平台需求</li>
                  <li>6. 数据说明</li>
                  <li>7. 对现有功能影响</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">8-10 其他</h4>
                <ul className="space-y-1">
                  <li>8. 风险评估</li>
                  <li>9. 数据更新策略</li>
                  <li>10. 异常处理</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">序号修复详情：</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-red-600 font-bold">❌ 修复前：</span>
                  <span className="font-mono text-red-700">4 → 4.2 <span className="text-red-600">(缺少 4.1)</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 font-bold">✅ 修复后：</span>
                  <span className="font-mono text-green-700">4 → 4.1 → 4.2 <span className="text-green-600">(序号连续)</span></span>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm">
                    <strong>4.1 一级运营人员业务流程</strong> 已恢复，包含 8 步业务流程：
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>用户登录系统，系统识别用户角色为一级运营人员。</li>
                    <li>系统加载全国指标总览数据，默认展示时间筛选为"近30天"。</li>
                    <li>系统展示5张指标卡片，显示全国整体数据。</li>
                    <li>用户点击指标卡片，系统展开详情模块，显示该指标的全国数据。</li>
                    <li>用户切换详情模块的Tab，系统更新图表数据（全国+31省对比）。</li>
                    <li>系统加载调度跟踪数据，展示全国整体态势（31省数据对比）和效果跟踪（全国工单列表）。</li>
                    <li>系统加载优秀运营案例，展示全国所有案例。</li>
                    <li>用户在优秀运营案例中按地州、业务类型、效果等级筛选案例。</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        {prdData?.downloadUrl && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm text-green-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>公网可访问，无需 VPN</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
