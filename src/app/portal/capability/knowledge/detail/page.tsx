'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Eye, Calendar, User, Tag } from 'lucide-react';

type ContentType = 'CASE' | 'SCRIPT' | 'MANUAL' | 'SCENARIO';
type KnowledgeStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'OFFLINE';

const CONTENT_TYPE_MAP: Record<ContentType, { label: string; color: string }> = {
  CASE: { label: '策略案例', color: 'bg-blue-100 text-blue-700' },
  SCRIPT: { label: '营销话术', color: 'bg-purple-100 text-purple-700' },
  MANUAL: { label: '操作手册', color: 'bg-amber-100 text-amber-700' },
  SCENARIO: { label: '场景知识', color: 'bg-teal-100 text-teal-700' },
};

const STATUS_MAP: Record<KnowledgeStatus, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  PENDING: { label: '待审核', color: 'bg-orange-100 text-orange-700' },
  PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: '已驳回', color: 'bg-red-100 text-red-700' },
  OFFLINE: { label: '已下线', color: 'bg-gray-100 text-gray-500' },
};

const SCENARIOS = [
  { code: 1, name: '携转挽留' },
  { code: 2, name: '携出授权码' },
  { code: 3, name: '宽带存量关怀' },
  { code: 4, name: '全球通离网' },
  { code: 5, name: '全球通投诉' },
  { code: 6, name: '热线商机' },
  { code: 7, name: '异动修复' },
  { code: 8, name: '离网原因追溯' },
  { code: 9, name: '停机赢回' },
];

// 模拟详情数据
const DETAIL_MAP: Record<string, {
  knowledgeId: string;
  title: string;
  contentType: ContentType;
  scenarioCodes: number[];
  caseResult?: 'SUCCESS' | 'FAIL';
  summary: string;
  content: string;
  tags: string[];
  status: KnowledgeStatus;
  creator: string;
  createTime: string;
  updateTime: string;
  viewCount: number;
  rejectReason?: string;
}> = {
  KN001: {
    knowledgeId: 'KN001',
    title: '携转挽留策略案例——乌鲁木齐成功挽留高价值客户',
    contentType: 'CASE',
    scenarioCodes: [1],
    caseResult: 'SUCCESS',
    summary: '针对乌鲁木齐地区携转意向高价值客户，通过精准画像分析识别挽留窗口期，结合差异化话术和专属优惠方案，成功挽留率提升至68%。',
    content: `<h2>一、背景</h2>
<p>2026年Q2，乌鲁木齐地区携转意向客户显著增加，其中月消费200元以上的高价值客户占比达35%。原有挽留方案缺乏针对性，挽留率仅为42%，远低于集团要求的60%目标。</p>

<h2>二、策略设计</h2>
<p>基于大数据平台客户画像分析，识别携转意向的3个关键信号：</p>
<ul>
<li><strong>信号1</strong>：近30天内查询竞品套餐次数≥3次</li>
<li><strong>信号2</strong>：合约到期前15天内未续约</li>
<li><strong>信号3</strong>：月均消费环比下降20%以上</li>
</ul>

<h2>三、执行方案</h2>
<p>针对不同信号组合设计差异化挽留方案：</p>
<table border="1" cellpadding="8" cellspacing="0">
<tr><th>信号组合</th><th>挽留方案</th><th>话术方向</th></tr>
<tr><td>信号1+2</td><td>专属优惠套餐+合约延长12个月</td><td>强调价格优势和长期权益</td></tr>
<tr><td>信号1+3</td><td>增值业务免费体验3个月</td><td>突出差异化服务体验</td></tr>
<tr><td>信号2+3</td><td>流量加倍+家庭共享优惠</td><td>强调家庭融合价值</td></tr>
</table>

<h2>四、执行效果</h2>
<p>策略执行4周后，核心指标变化：</p>
<ul>
<li>高价值客户挽留率：42% → 68%（+26pp）</li>
<li>挽留成功客户ARPU保持率：92%</li>
<li>挽留后3个月留存率：85%</li>
</ul>

<h2>五、经验总结</h2>
<ol>
<li>精准画像是前提：多信号组合识别比单一信号准确率提升40%</li>
<li>差异化方案是关键：3类方案对比"一刀切"挽留率提升22pp</li>
<li>执行时效性：信号触发后48小时内触达，挽留成功率最高</li>
</ol>`,
    tags: ['最佳实践', '携转挽留'],
    status: 'PUBLISHED',
    creator: '李明',
    createTime: '2026-07-15 10:30:00',
    updateTime: '2026-08-01 14:20:00',
    viewCount: 156,
  },
};

const DEFAULT_DETAIL = {
  knowledgeId: 'KN000',
  title: '知识标题示例',
  contentType: 'CASE' as ContentType,
  scenarioCodes: [1],
  summary: '这是知识的摘要内容，用于列表展示和搜索结果预览。',
  content: '<p>这是知识的正文内容示例。实际内容支持富文本格式，包含图文混排、表格和代码块。</p>',
  tags: ['最佳实践'],
  status: 'DRAFT' as KnowledgeStatus,
  creator: '示例用户',
  createTime: '2026-08-01 10:00:00',
  updateTime: '2026-08-01 10:00:00',
  viewCount: 0,
};

function KnowledgeDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'KN001';

  const detail = DETAIL_MAP[id] || { ...DEFAULT_DETAIL, knowledgeId: id };

  const canEdit = detail.status === 'DRAFT' || detail.status === 'REJECTED' || detail.status === 'OFFLINE';

  const getScenarioNames = (codes: number[]) => {
    return codes.map(c => SCENARIOS.find(s => s.code === c)?.name || `场景${c}`).join('、');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button className="hover:text-primary" onClick={() => router.push('/portal/capability/knowledge/list')}>知识中心</button>
        <span>/</span>
        <button className="hover:text-primary" onClick={() => router.push('/portal/capability/knowledge/list')}>知识库管理</button>
        <span>/</span>
        <span className="text-foreground truncate max-w-[300px]">{detail.title}</span>
      </div>

      {/* 标题区 */}
      <div>
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-bold flex-1">{detail.title}</h1>
          <Badge variant="outline" className={STATUS_MAP[detail.status].color + ' shrink-0 mt-1'}>
            {STATUS_MAP[detail.status].label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Badge variant="outline" className={CONTENT_TYPE_MAP[detail.contentType].color}>
            {CONTENT_TYPE_MAP[detail.contentType].label}
          </Badge>
          {detail.caseResult && (
            <Badge variant="outline" className={detail.caseResult === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
              {detail.caseResult === 'SUCCESS' ? '成功' : '失败'}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* 元信息栏 */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{getScenarioNames(detail.scenarioCodes)}</span>
        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{detail.creator}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />创建于 {detail.createTime}</span>
        <span>更新于 {detail.updateTime}</span>
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{detail.viewCount} 次浏览</span>
      </div>

      {/* 摘要 */}
      {detail.summary && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">摘要</h3>
            <p className="text-sm">{detail.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* 正文内容 */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: detail.content || '<p class="text-muted-foreground">暂无内容</p>' }}
          />
        </CardContent>
      </Card>

      {/* 标签区 */}
      {detail.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">标签：</span>
          {detail.tags.map((tag, i) => (
            <Badge key={i} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}

      {/* 驳回原因 */}
      {detail.status === 'REJECTED' && detail.rejectReason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-red-700 mb-1">驳回原因</h3>
            <p className="text-sm text-red-600">{detail.rejectReason}</p>
          </CardContent>
        </Card>
      )}

      {/* 底部操作区 */}
      <Separator />
      <div className="flex items-center justify-between pb-6">
        <Button variant="outline" onClick={() => router.push('/portal/capability/knowledge/list')}>
          <ArrowLeft className="h-4 w-4 mr-1" />返回列表
        </Button>
        {canEdit && (
          <Button onClick={() => router.push(`/portal/capability/knowledge/edit?id=${detail.knowledgeId}`)}>
            <Pencil className="h-4 w-4 mr-1" />编辑
          </Button>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-muted-foreground">加载中...</span></div>}>
      <KnowledgeDetailPageContent />
    </Suspense>
  );
}
