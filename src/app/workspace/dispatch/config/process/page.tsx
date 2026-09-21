'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, LayoutGrid } from 'lucide-react';

interface FlowCard {
  id: string;
  name: string;
  scope: string;
  creator: string;
  businessType: string;
  createdAt: string;
  nodes: number;
  hasBranch: boolean;
}

const mockFlows: FlowCard[] = [
  { id: '1', name: '预警调度流程', scope: '全国', creator: '超级管理员', businessType: '生产类', createdAt: '2026-07-03', nodes: 5, hasBranch: true },
  { id: '2', name: '指标调度V5', scope: '全国', creator: '超级管理员', businessType: '管理类', createdAt: '2026-04-16', nodes: 4, hasBranch: true },
  { id: '3', name: '指标调度-子流程V3', scope: '全国', creator: '超级管理员', businessType: '管理类', createdAt: '2026-04-16', nodes: 3, hasBranch: false },
  { id: '4', name: '策略调度V5', scope: '全国', creator: '超级管理员', businessType: '生产类', createdAt: '2026-04-16', nodes: 4, hasBranch: true },
  { id: '5', name: '策略调度-子流程V5', scope: '全国', creator: '超级管理员', businessType: '生产类', createdAt: '2026-04-16', nodes: 3, hasBranch: false },
  { id: '6', name: '客群调度V3', scope: '全国', creator: '超级管理员', businessType: '生产类', createdAt: '2026-04-16', nodes: 4, hasBranch: true },
  { id: '7', name: '客群调度-子流程V3', scope: '全国', creator: '超级管理员', businessType: '生产类', createdAt: '2026-04-16', nodes: 3, hasBranch: false },
  { id: '8', name: '区域攻坚调度流程', scope: '全国', creator: '超级管理员', businessType: '生产类', createdAt: '2026-04-10', nodes: 3, hasBranch: false },
  { id: '9', name: '快速导出审批流程', scope: '全国', creator: '超级管理员', businessType: '审批类', createdAt: '2026-04-28', nodes: 4, hasBranch: true },
  { id: '10', name: '标准导出审批流程', scope: '全国', creator: '超级管理员', businessType: '审批类', createdAt: '2026-04-28', nodes: 5, hasBranch: true },
  { id: '11', name: '简易分包看管流程', scope: '全疆', creator: '系统预置', businessType: '生产类', createdAt: '2026-07-10', nodes: 5, hasBranch: false },
  { id: '12', name: '携转预警执行流程', scope: '全疆', creator: '系统预置', businessType: '生产类', createdAt: '2026-07-10', nodes: 9, hasBranch: true },
  { id: '13', name: '保有任务调度流程', scope: '全疆', creator: '系统预置', businessType: '生产类', createdAt: '2026-07-11', nodes: 5, hasBranch: false },
];

// 预置流程模板
interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  businessType: string;
  nodes: number;
  hasBranch: boolean;
  applicableTypes: string[];
}

const presetTemplates: FlowTemplate[] = [
  {
    id: 'tpl-simple',
    name: '简易分包看管流程',
    description: '适用于宽带离网预警、全球通离网预警、投诉工单预警、热线商机预警、异动客户预警、全球通客户离网追溯、全球通客户停机赢回预警、全球通停机客户赢回-铁通预警等8种非携转类预警的通用执行流程。流程环节：开始→人工节点(分管领导审批)→人工节点(网格长执行)→外部节点(外系统推送)→结束',
    businessType: '生产类',
    nodes: 5,
    hasBranch: false,
    applicableTypes: ['宽带离网预警', '全球通离网预警', '投诉工单预警', '热线商机预警', '异动客户预警', '全球通客户离网追溯', '全球通客户停机赢回预警', '全球通停机客户赢回-铁通预警'],
  },
  {
    id: 'tpl-mnp',
    name: '携转预警执行流程',
    description: '适用于携转预警的专用多步网关执行流程，含3个条件网关（是否全球通客户→是否白金卡钻卡金卡→是否宽带用户）实现差异化处置路径。流程环节：开始→网关(全球通?)→人工(全球通维系)→网关(高价值?)→人工(高价值挽留)→网关(宽带?)→外部(宽带维系推送)→人工(网格长执行)→结束',
    businessType: '生产类',
    nodes: 9,
    hasBranch: true,
    applicableTypes: ['携转预警'],
  },
  {
    id: 'tpl-retain',
    name: '保有任务调度流程',
    description: '适用于存量客群保有维系任务的标准执行流程。运营人员选择客群后手动发起，三级经理审批通过后由地市分公司执行人接收并处理，IOP平台执行维系动作，完成后以文件接口方式回传效果数据。流程环节：开始→人工节点(三级经理审批)→人工节点(接收)→外部节点(IOP处理)→外部节点(效果回传)→结束',
    businessType: '生产类',
    nodes: 5,
    hasBranch: false,
    applicableTypes: ['保有任务调度'],
  },
];

const businessTypes = ['管理类', '生产类', '审批类', '测试'];
const flowStatuses = ['草稿', '已发布', '已停用'];

// Mini flow node renderer
function MiniFlowDiagram({ nodes, hasBranch }: { nodes: number; hasBranch: boolean }) {
  const nodeCount = Math.min(nodes, 4);
  return (
    <div className="flex items-center gap-1 py-2 px-1">
      {/* Start node */}
      <div className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-400 flex-shrink-0" />
      <div className="w-3 h-0.5 bg-muted-foreground/30" />
      {/* Middle nodes */}
      {Array.from({ length: nodeCount - 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          {hasBranch && i === 0 ? (
            <>
              <div className="w-4 h-4 rotate-45 bg-amber-100 border-2 border-amber-400 flex-shrink-0" />
              <div className="w-3 h-0.5 bg-muted-foreground/30" />
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded bg-blue-100 border-2 border-blue-400 flex-shrink-0" />
              <div className="w-3 h-0.5 bg-muted-foreground/30" />
            </>
          )}
        </div>
      ))}
      {/* End node */}
      <div className="w-5 h-5 rounded-full bg-rose-100 border-2 border-rose-400 flex-shrink-0" />
    </div>
  );
}

export default function FlowConfigPage() {
  const [activeTab, setActiveTab] = useState<'flow' | 'template'>('flow');
  const [dimension, setDimension] = useState<'all' | 'team' | 'personal'>('all');
  const [searchText, setSearchText] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const filteredFlows = mockFlows.filter(f => {
    if (searchText && !f.name.includes(searchText)) return false;
    if (businessTypeFilter !== 'all' && f.businessType !== businessTypeFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-lg font-semibold">流程配置</h1>
      </div>

      {/* Tabs: 流程 / 模板 */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-6 border-b">
          <button
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'flow' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('flow')}
          >
            流程
          </button>
          <button
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'template' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('template')}
          >
            模板
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-3 flex items-center gap-3 flex-wrap">
        {/* Dimension tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          {(['all', 'team', 'personal'] as const).map(d => (
            <button
              key={d}
              className={`px-3 py-1 text-xs rounded-sm transition-colors ${dimension === d ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setDimension(d)}
            >
              {d === 'all' ? '全部' : d === 'team' ? '团队' : '个人'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-1">
          <Input
            placeholder="请输入流程名称"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-48 h-8 text-xs"
          />
          <Button size="sm" className="h-8"><Search className="w-3.5 h-3.5 mr-1" />搜索</Button>
        </div>

        {/* Filters */}
        <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="全部业务类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部业务类型</SelectItem>
            {businessTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="全部流程状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部流程状态</SelectItem>
            {flowStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" className="h-8">
          <LayoutGrid className="w-3.5 h-3.5 mr-1" />工单维度
        </Button>

        <Link href="/workspace/dispatch/config/process/new">
          <Button size="sm" className="h-8">
            <Plus className="w-3.5 h-3.5 mr-1" />新增
          </Button>
        </Link>
      </div>

      {/* Card Grid - Flow Tab */}
      {activeTab === 'flow' && (
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="grid grid-cols-5 gap-4">
          {filteredFlows.map(flow => (
            <Card
              key={flow.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedCard === flow.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCard(flow.id)}
            >
              <CardContent className="p-3">
                {/* Mini flow diagram */}
                <div className="bg-muted/30 rounded-md mb-2 p-1">
                  <MiniFlowDiagram nodes={flow.nodes} hasBranch={flow.hasBranch} />
                </div>
                {/* Info */}
                <div className="space-y-1">
                  <div className="font-medium text-sm truncate">{flow.name}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{flow.scope}</span>
                    <span>{flow.businessType}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{flow.creator}</span>
                    <span>{flow.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFlows.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            暂无流程数据
          </div>
        )}
      </div>
      )}

      {/* Template Tab Content */}
      {activeTab === 'template' && (
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 mt-2">
            {presetTemplates.map(tpl => (
              <Card key={tpl.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  {/* Mini flow diagram */}
                  <div className="bg-muted/30 rounded-md mb-3 p-2">
                    <MiniFlowDiagram nodes={tpl.nodes} hasBranch={tpl.hasBranch} />
                  </div>
                  {/* Template info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{tpl.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{tpl.businessType}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">系统预置</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tpl.description}</p>
                    {/* Applicable warning types */}
                    <div className="pt-1">
                      <div className="text-[11px] text-muted-foreground mb-1">适用预警类型：</div>
                      <div className="flex flex-wrap gap-1">
                        {tpl.applicableTypes.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Action */}
                    <div className="flex items-center justify-end pt-2 border-t">
                      <Link href={`/workspace/dispatch/config/process/new?template=${tpl.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">使用此模板创建流程</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
