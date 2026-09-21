'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function PrdTestPreviewPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 上传文件到对象存储并生成签名URL
  const uploadAndGetSignedUrl = async () => {
    setUploading(true);
    setError(null);
    try {
      const response = await fetch('/api/upload-prd-test', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || '上传失败');
      }
      
      setSignedUrl(result.signedUrl);
    } catch (err) {
      console.error('上传失败:', err);
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  // 页面加载时自动上传
  useEffect(() => {
    uploadAndGetSignedUrl();
  }, []);

  // 下载文件
  const downloadPrd = async () => {
    if (!signedUrl) return;
    
    try {
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '市场运营平台-门户首页-V28.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">市场运营平台首页 PRD V28</h1>
        
        <div className="bg-card border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">版本说明 V28</h2>
          <p className="text-muted-foreground mb-4">
            本版本基于V27版本修正以下问题：
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>1. <strong>补充截图功能</strong>：在每个功能模块中添加"界面设计"小节，标记截图位置</li>
            <li>2. <strong>修改接口说明</strong>：接口参数和返回值使用中文业务参数（参数名称、参数类型等），具体接口规范由技术侧制定</li>
            <li>3. <strong>更新版本号</strong>：文件名按规则命名为市场运营平台-门户首页-V28.docx</li>
          </ul>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-green-800 font-semibold mb-2">
              ✅ V28版本核心特性
            </p>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• 包含7个标准章节：修订历史、简介、业务流程、系统需求、接口说明、对现有功能影响、风险评估</li>
              <li>• 每个功能模块添加"界面设计"小节，预留截图位置（如：[截图：指标总览模块-指标卡片展示]）</li>
              <li>• 接口说明使用中文业务参数，符合产品经理视角</li>
              <li>• 字段说明使用表格格式，清晰展示字段名、字段类型、数据来源、显示格式/业务说明</li>
              <li>• 已删除所有臆造功能，基于实际代码分析</li>
              <li>• 序号层级正确：上一级为数字序号时，本级使用括号序号</li>
              <li>• 已补充案例排序规则：按发布日期降序排列</li>
            </ul>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800 font-semibold mb-2">
              📋 文档内容概览
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 指标总览模块：6个子模块（市场份额、价值保有、规模保有、渠道触客、业务订购/退订），每个包含功能说明、字段说明、业务逻辑、约束规则、界面设计</li>
              <li>• 调度跟踪模块：整体态势、效果跟踪，包含详细的功能说明和接口定义</li>
              <li>• 优秀运营案例模块：案例列表展示，包含排序规则和字段定义</li>
              <li>• 接口说明：3个主要接口（指标总览、调度跟踪、优秀运营案例），使用中文业务参数</li>
            </ul>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">V28版本新增特性</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">界面设计截图预留：每个功能模块添加"界面设计"小节</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">接口参数中文化：使用业务参数名称，具体规范由技术侧制定</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">7个标准章节：修订历史、简介、业务流程、系统需求、接口说明、对现有功能影响、风险评估</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">字段说明表格：字段名 | 字段类型 | 数据来源 | 显示格式/业务说明</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">业务逻辑和约束规则：详细描述系统行为和限制条件</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">字体格式：一级/二级标题黑体，正文仿宋</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">✓</div>
              <span className="text-muted-foreground">基于实际代码分析，无臆造功能</span>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">下载 PRD V28 文档</h2>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">正在准备下载链接...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-800">上传失败：{error}</p>
              </div>
              <Button onClick={uploadAndGetSignedUrl} disabled={uploading} variant="outline">
                {uploading ? '重试中...' : '重试'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                文件已上传至对象存储，有效期7天。
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-sm text-blue-800 mb-2">公网下载链接：</p>
                <p className="text-xs text-blue-600 break-all font-mono">{signedUrl}</p>
              </div>
              <Button onClick={downloadPrd} className="w-full" size="lg">
                📥 下载PRD文档
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                或复制上方链接在浏览器中打开
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
