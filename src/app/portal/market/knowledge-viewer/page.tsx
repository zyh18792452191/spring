'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, History, Code, Download, Search, RefreshCw } from 'lucide-react';

interface KnowledgeFile {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function KnowledgeViewerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [knowledgeData, setKnowledgeData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const knowledgeFiles: KnowledgeFile[] = [
    {
      id: 'main',
      name: '/tmp/knowledge_base_alternative.md',
      title: '主知识库',
      description: '项目概述、功能说明、UI设计规范、业务规则（591行）',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-blue-600',
    },
    {
      id: 'history',
      name: '/tmp/project_history_knowledge.md',
      title: '项目历史',
      description: '关键决策、开发历程、经验教训、用户偏好（315行）',
      icon: <History className="h-5 w-5" />,
      color: 'text-purple-600',
    },
    {
      id: 'business',
      name: '/tmp/market_pages_business_logic.md',
      title: '页面业务逻辑',
      description: '各页面详细功能、数据结构、API调用（442行）',
      icon: <Code className="h-5 w-5" />,
      color: 'text-green-600',
    },
  ];

  const loadKnowledge = async () => {
    setLoading(true);
    setError('');

    try {
      const data: Record<string, string> = {};

      for (const file of knowledgeFiles) {
        const response = await fetch(`/api/knowledge/read?file=${encodeURIComponent(file.name)}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            data[file.id] = result.content;
          }
        }
      }

      setKnowledgeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (file: KnowledgeFile, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.id}_knowledge.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightKeywords = (text: string, keywords: string) => {
    if (!keywords) return text;

    const keywordList = keywords.split(' ').filter(k => k.length > 0);
    let highlightedText = text;

    keywordList.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });

    return highlightedText;
  };

  useEffect(() => {
    loadKnowledge();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#0085D0]" />
            项目知识库查看器
          </h1>
          <p className="text-sm text-gray-500 mt-1">市场运营平台 - 完整的项目知识体系</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadKnowledge}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* 加载状态 */}
      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#0085D0] mx-auto mb-4" />
              <p className="text-gray-600">正在加载知识库内容...</p>
            </div>
          </div>
        </Card>
      )}

      {/* 知识库概览 */}
      {!loading && Object.keys(knowledgeData).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {knowledgeFiles.map((file) => {
            const content = knowledgeData[file.id];
            const lineCount = content ? content.split('\n').length : 0;

            return (
              <Card
                key={file.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  const tabs = document.querySelectorAll('[role="tab"]');
                  const targetTab = Array.from(tabs).find(
                    (tab) => tab.getAttribute('data-value') === file.id
                  );
                  if (targetTab) {
                    (targetTab as HTMLElement).click();
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={file.color}>{file.icon}</div>
                  <span className="text-xs text-gray-500">{lineCount} 行</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{file.title}</h3>
                <p className="text-sm text-gray-600">{file.description}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono">{file.name}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* 搜索功能 */}
      {!loading && Object.keys(knowledgeData).length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索知识库内容..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0085D0]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* 知识库内容详情 */}
      {!loading && Object.keys(knowledgeData).length > 0 && (
        <Tabs defaultValue="main" className="space-y-4">
          <TabsList>
            {knowledgeFiles.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="flex items-center gap-2"
              >
                {file.icon}
                {file.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {knowledgeFiles.map((file) => {
            const content = knowledgeData[file.id];
            if (!content) return null;

            return (
              <TabsContent key={file.id} value={file.id} className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {file.icon}
                        {file.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                    </div>
                    <Button
                      onClick={() => downloadFile(file, content)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                  </div>

                  {/* 内容预览 */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        文件路径
                      </h3>
                      <code className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                        {file.name}
                      </code>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        文件内容
                      </h3>
                      <div
                        className="prose max-w-none overflow-auto max-h-[600px] bg-white border rounded-lg p-4"
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          lineHeight: '1.6',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: highlightKeywords(content, searchQuery),
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* 使用说明 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">📖 使用说明</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>查看内容：</strong>点击上方的Tab切换不同的知识库文档</p>
          <p><strong>搜索功能：</strong>使用搜索框查找关键词，匹配的内容会被高亮显示</p>
          <p><strong>下载文档：</strong>点击"下载"按钮将知识库保存到本地</p>
          <p><strong>刷新内容：</strong>如果知识库有更新，点击"刷新"按钮重新加载</p>
        </div>
      </Card>

      {/* 知识库统计 */}
      {!loading && Object.keys(knowledgeData).length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📊 知识库统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0085D0]">
                {Object.keys(knowledgeData).length}
              </div>
              <div className="text-sm text-gray-600">文档数量</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0085D0]">
                {Object.values(knowledgeData).reduce(
                  (sum, content) => sum + content.split('\n').length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">总行数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0085D0]">
                {Object.values(knowledgeData).reduce(
                  (sum, content) => sum + content.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">总字数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0085D0]">
                {(Object.values(knowledgeData).reduce(
                  (sum, content) => sum + content.length,
                  0
                ) / 1024).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">总KB</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
