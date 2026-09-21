'use client';

import { useState } from 'react';
import { BarChart3, CheckCircle2, BookOpen, RefreshCw, Send, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
  AI_INSIGHT_REPORTS,
  INSIGHT_INDICATOR_TEMPLATES,
  RECEIVED_DIAGNOSIS_LIST,
  type ReceivedDiagnosis,
  type AiInsightReport,
  type InsightIndicatorTemplate,
} from '../data';

type TabKey = 'template' | 'diagnosis' | 'report';

const TABS: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
  { key: 'template', label: '指标树模板引用', icon: BarChart3 },
  { key: 'diagnosis', label: '诊断结论接收', icon: CheckCircle2 },
  { key: 'report', label: 'AI 洞察报告引用', icon: Sparkles },
];

export default function StrategyCollabInsightPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('template');
  const [templates, setTemplates] = useState<InsightIndicatorTemplate[]>(INSIGHT_INDICATOR_TEMPLATES);
  const [diagnosisList, setDiagnosisList] = useState<ReceivedDiagnosis[]>(RECEIVED_DIAGNOSIS_LIST);
  const [reports, setReports] = useState<AiInsightReport[]>(AI_INSIGHT_REPORTS);
  const [pushedCount, setPushedCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState('2026-08-28 09:35');

  const handleCiteTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cited: true, refCount: item.refCount + 1 } : item)),
    );
  };

  const handleReceiveDiagnosis = (id: string) => {
    setDiagnosisList((prev) => prev.map((item) => (item.id === id ? { ...item, status: '已接收' } : item)));
  };

  const handleCiteReport = (id: string) => {
    setReports((prev) => prev.map((item) => (item.id === id ? { ...item, cited: true } : item)));
  };

  const handlePushToInsight = () => {
    setPushedCount((prev) => prev + 1);
  };

  const handleSync = () => {
    setLastSyncAt(new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">与洞察中心协作</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            引用洞察中心的指标树模板与 AI 洞察报告、接收诊断结论作为策略制定输入；策略沉淀的最佳实践可反向推送至洞察中心。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">最近同步：{lastSyncAt}</span>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSync}>
            <RefreshCw className="w-4 h-4" />
            接收最新诊断
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handlePushToInsight}>
            <Send className="w-4 h-4" />
            推送至洞察中心
          </Button>
        </div>
      </div>

      {pushedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          已向洞察中心推送 {pushedCount} 次最佳实践（推送内容：策略沉淀的标杆策略清单，供洞察中心归因分析引用）
        </div>
      )}

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'template' && (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">模板ID</TableHead>
                <TableHead className="min-w-[180px]">指标树模板名称</TableHead>
                <TableHead className="min-w-[140px]">业务场景</TableHead>
                <TableHead className="min-w-[90px]">指标数</TableHead>
                <TableHead className="min-w-[170px]">来源</TableHead>
                <TableHead className="min-w-[90px]">引用次数</TableHead>
                <TableHead className="min-w-[140px]">更新时间</TableHead>
                <TableHead className="min-w-[100px]">引用状态</TableHead>
                <TableHead className="min-w-[90px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.scenario}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{item.indicatorCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                  <TableCell className="text-sm text-foreground">{item.refCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.updatedAt}</TableCell>
                  <TableCell>
                    {item.cited ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">已引用</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        未引用
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      disabled={item.cited}
                      onClick={() => handleCiteTemplate(item.id)}
                    >
                      {item.cited ? '已引用' : '引用'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === 'diagnosis' && (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">诊断编号</TableHead>
                <TableHead className="min-w-[170px]">指标名称</TableHead>
                <TableHead className="min-w-[140px]">业务场景</TableHead>
                <TableHead className="min-w-[300px]">异常原因（来自根因库匹配）</TableHead>
                <TableHead className="min-w-[100px]">建议策略数</TableHead>
                <TableHead className="min-w-[140px]">接收时间</TableHead>
                <TableHead className="min-w-[90px]">状态</TableHead>
                <TableHead className="min-w-[130px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnosisList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{item.indicatorName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.scenario}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.rootCause}</TableCell>
                  <TableCell className="text-sm text-foreground">{item.strategyCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.receivedAt}</TableCell>
                  <TableCell>
                    {item.status === '已接收' ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">已接收</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        待接收
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        disabled={item.status === '已接收'}
                        onClick={() => handleReceiveDiagnosis(item.id)}
                      >
                        {item.status === '已接收' ? '已接收' : '接收'}
                      </Button>
                      <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
                        去制定
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="space-y-3">
          {reports.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                  <Badge variant="secondary">{item.scenario}</Badge>
                  {item.cited && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">已引用</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  报告编号：{item.id} · 章节数：{item.sections} · 生成时间：{item.generatedAt}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={item.cited}
                onClick={() => handleCiteReport(item.id)}
              >
                {item.cited ? '已引用' : '引用报告'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}