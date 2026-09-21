'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function KnowledgeManagementPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const initializeKnowledgeBase = async () => {
    setIsInitializing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/knowledge/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || '初始化失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识库管理</h1>
          <p className="text-sm text-gray-500 mt-1">市场运营平台 - 业务知识库</p>
        </div>
        <Button
          onClick={initializeKnowledgeBase}
          disabled={isInitializing}
          className="bg-[#0085D0] hover:bg-[#006DB8]"
        >
          {isInitializing ? '初始化中...' : '初始化知识库'}
        </Button>
      </div>

      {/* 初始化结果 */}
      {result && (
        <Card className="p-6 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-900 mb-4">✅ 初始化成功</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>数据集名称：</strong>{result.dataset}</p>
            <p><strong>导入文档数：</strong>{result.docIds?.length}</p>
            <p><strong>文档ID：</strong></p>
            <ul className="list-disc list-inside pl-4">
              {result.docIds?.map((id: string, index: number) => (
                <li key={index} className="font-mono text-xs">{id}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* 错误信息 */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-900 mb-2">❌ 初始化失败</h3>
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      )}

      {/* 说明信息 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">📚 知识库说明</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-1">什么是知识库？</h4>
            <p>知识库是一个持久化的业务文档存储系统，用于保存项目的所有业务上下文、功能说明、UI规范等信息。</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">为什么需要知识库？</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>持久化保存业务上下文，避免对话结束后丢失</li>
              <li>支持跨会话理解项目整体架构</li>
              <li>确保新功能与已有功能保持一致</li>
              <li>帮助AI助手理解复杂的业务关联关系</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">知识库包含哪些内容？</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>项目基本信息（技术栈、项目结构、核心功能）</li>
              <li>功能详细说明（调度跟踪、筛选器、效果跟踪等）</li>
              <li>UI设计规范（品牌色、字体、按钮、表格等）</li>
              <li>业务规则（数据权限、工单类型、指标计算等）</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">如何使用？</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>点击"初始化知识库"按钮创建知识库</li>
              <li>后续对话中，AI助手会自动检索相关知识</li>
              <li>新增功能时，记得更新知识库内容</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 使用示例 */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-3">💡 使用示例</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">示例1：生成新页面</p>
            <p className="text-gray-600">在后续对话中，你可以说：</p>
            <code className="block mt-2 p-2 bg-gray-800 text-green-400 rounded">
              "帮我生成一个工单详情页面，要求风格与现有页面一致，使用项目的UI规范"
            </code>
            <p className="text-gray-600 mt-2">AI助手会自动从知识库中检索UI规范和项目结构，确保生成的页面符合要求。</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">示例2：生成PRD文档</p>
            <p className="text-gray-600">你可以说：</p>
            <code className="block mt-2 p-2 bg-gray-800 text-green-400 rounded">
              "为优秀运营案例模块生成PRD文档，参考已有的调度跟踪PRD格式"
            </code>
            <p className="text-gray-600 mt-2">AI助手会检索已有的PRD格式和业务规则，确保新文档风格一致。</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
