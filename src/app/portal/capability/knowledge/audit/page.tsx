'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Clock, FileCheck, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

type ContentType = 'CASE' | 'SCRIPT' | 'MANUAL' | 'SCENARIO';

const CONTENT_TYPE_MAP: Record<ContentType, { label: string; color: string }> = {
  CASE: { label: '策略案例', color: 'bg-blue-100 text-blue-700' },
  SCRIPT: { label: '营销话术', color: 'bg-purple-100 text-purple-700' },
  MANUAL: { label: '操作手册', color: 'bg-amber-100 text-amber-700' },
  SCENARIO: { label: '场景知识', color: 'bg-teal-100 text-teal-700' },
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

interface AuditItem {
  id: string;
  title: string;
  contentType: ContentType;
  scenarioCodes: number[];
  submitter: string;
  submitTime: string;
  summary: string;
  content: string;
  tags: string[];
  auditComment?: string;
  auditor?: string;
  auditTime?: string;
}

const PENDING_LIST: AuditItem[] = [
  {
    id: 'AU001',
    title: '精益平台预警场景配置操作手册',
    contentType: 'MANUAL',
    scenarioCodes: [1, 3, 5, 7],
    submitter: '张伟',
    submitTime: '2026-08-05 11:00:00',
    summary: '精益平台预警场景的配置操作指南，涵盖预警规则创建、阈值设置、触发条件配置和通知渠道选择，适用于运营人员日常配置。',
    content: '一、预警规则创建\n1. 登录精益平台，进入"预警管理"模块\n2. 点击"新建预警规则"，选择预警类型\n3. 配置触发条件和阈值参数\n4. 设置通知渠道和接收人\n\n二、阈值设置\n- 指标类预警：设置上下限阈值\n- 趋势类预警：设置变化率阈值\n- 事件类预警：设置触发条件\n\n三、通知渠道\n- 站内消息\n- 短信通知\n- 企业微信推送',
    tags: ['流程规范', '新手必读'],
  },
  {
    id: 'AU002',
    title: '全球通离网原因追溯流程与问卷话术',
    contentType: 'SCENARIO',
    scenarioCodes: [7, 4],
    submitter: '张伟',
    submitTime: '2026-08-11 16:00:00',
    summary: '全球通客户离网原因追溯的标准流程和调查问卷话术，包含追访时机、问卷设计、数据采集和原因分类规则。',
    content: '一、追访时机\n- 携转完成后3个工作日内\n- 离网后7天内\n\n二、问卷设计\n1. 离网主要原因（单选）\n2. 是否考虑回归（单选）\n3. 对原服务的评价（1-5分）\n4. 改进建议（文本）\n\n三、话术\n"您好，我是新疆移动的客服代表，了解到您近期办理了号码转出，想了解一下您转出主要是哪方面的原因..."',
    tags: ['流程规范'],
  },
];

const APPROVED_LIST: AuditItem[] = [
  {
    id: 'AU003',
    title: '携转挽留策略案例——乌鲁木齐成功挽留高价值客户',
    contentType: 'CASE',
    scenarioCodes: [1],
    submitter: '李明',
    submitTime: '2026-07-14 09:00:00',
    summary: '针对乌鲁木齐地区携转意向高价值客户，通过精准画像分析识别挽留窗口期，结合差异化话术和专属优惠方案，成功挽留率提升至68%。',
    content: '（策略案例详情内容...）',
    tags: ['最佳实践', '携转挽留'],
    auditComment: '案例详实，数据支撑充分，值得推广。',
    auditor: '运营主管-赵部长',
    auditTime: '2026-07-15 08:30:00',
  },
  {
    id: 'AU004',
    title: '全球通离网挽留标准话术（2026版）',
    contentType: 'SCRIPT',
    scenarioCodes: [4],
    submitter: '王芳',
    submitTime: '2026-06-19 16:00:00',
    summary: '全球通离网客户挽留标准化沟通话术，包含开场白、需求挖掘、方案推荐、异议处理和结束语5个环节。',
    content: '（话术详情内容...）',
    tags: ['话术模板', '全球通离网'],
    auditComment: '话术结构清晰，异议处理环节需补充合约续约类应答。',
    auditor: '营销主管-刘部长',
    auditTime: '2026-06-20 10:00:00',
  },
];

const REJECTED_LIST: AuditItem[] = [
  {
    id: 'AU005',
    title: '热线商机引导话术与派单规则',
    contentType: 'SCRIPT',
    scenarioCodes: [6],
    submitter: '陈刚',
    submitTime: '2026-07-24 10:00:00',
    summary: '热线渠道商机识别与引导话术，包含商机类型判断、意向确认、信息采集和派单流程，适用于客服人员。',
    content: '（话术详情内容...）',
    tags: ['话术模板', '热线商机'],
    auditComment: '话术过于笼统，缺少针对不同商机类型的差异化引导语，派单规则描述不够具体，请补充后重新提交。',
    auditor: '营销主管-刘部长',
    auditTime: '2026-07-25 15:00:00',
  },
];

export default function KnowledgeAuditPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<AuditItem | null>(null);
  const [auditAction, setAuditAction] = useState<'approve' | 'reject'>('approve');
  const [auditComment, setAuditComment] = useState('');

  const pendingCount = PENDING_LIST.length;

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'pending': return PENDING_LIST;
      case 'approved': return APPROVED_LIST;
      case 'rejected': return REJECTED_LIST;
      default: return [];
    }
  }, [activeTab]);

  const getScenarioNames = (codes: number[]) => {
    return codes.map(c => SCENARIOS.find(s => s.code === c)?.name || `场景${c}`).join('、');
  };

  const handleAudit = (item: AuditItem, action: 'approve' | 'reject') => {
    setAuditTarget(item);
    setAuditAction(action);
    setAuditComment('');
    setAuditDialogOpen(true);
  };

  const submitAudit = () => {
    if (auditAction === 'reject' && !auditComment.trim()) {
      toast.error('驳回时必须填写审核意见');
      return;
    }
    if (auditTarget) {
      toast.success(auditAction === 'approve' ? `已通过「${auditTarget.title}」` : `已驳回「${auditTarget.title}」`);
    }
    setAuditDialogOpen(false);
    setAuditTarget(null);
  };

  return (
    <div className="p-6 space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">待审核</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">今日已审核</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">本周已发布</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">待审核</TabsTrigger>
          <TabsTrigger value="approved">已通过</TabsTrigger>
          <TabsTrigger value="rejected">已驳回</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">知识标题</TableHead>
                    <TableHead className="w-[10%]">内容类型</TableHead>
                    <TableHead className="w-[15%]">关联场景</TableHead>
                    <TableHead className="w-[10%]">提交人</TableHead>
                    <TableHead className="w-[15%]">提交时间</TableHead>
                    <TableHead className="w-[10%]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  ) : currentList.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={CONTENT_TYPE_MAP[item.contentType].color}>
                          {CONTENT_TYPE_MAP[item.contentType].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{getScenarioNames(item.scenarioCodes)}</TableCell>
                      <TableCell className="text-sm">{item.submitter}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.submitTime}</TableCell>
                      <TableCell>
                        {tab === 'pending' ? (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-green-600 hover:text-green-700" onClick={() => handleAudit(item, 'approve')}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />通过
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleAudit(item, 'reject')}>
                              <XCircle className="h-4 w-4 mr-1" />驳回
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {tab === 'approved' ? '已通过' : '已驳回'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 审核弹窗 */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{auditAction === 'approve' ? '审核通过' : '审核驳回'}</DialogTitle>
          </DialogHeader>

          {auditTarget && (
            <div className="space-y-4">
              {/* 知识摘要信息 */}
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <h3 className="font-medium">{auditTarget.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={CONTENT_TYPE_MAP[auditTarget.contentType].color}>
                      {CONTENT_TYPE_MAP[auditTarget.contentType].label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{getScenarioNames(auditTarget.scenarioCodes)}</span>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{auditTarget.summary}</p>
                  <div className="bg-muted/30 rounded-md p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {auditTarget.content}
                  </div>
                  {auditTarget.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {auditTarget.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 审核意见 */}
              <div className="space-y-1.5">
                <Label className="text-sm">
                  审核意见
                  {auditAction === 'reject' && <span className="text-destructive ml-1">（必填）</span>}
                </Label>
                <Textarea
                  placeholder={auditAction === 'reject' ? '请填写驳回原因（限200字）' : '请输入审核意见（选填）'}
                  value={auditComment}
                  onChange={e => setAuditComment(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <div className="text-xs text-right text-muted-foreground">{auditComment.length}/200</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditDialogOpen(false)}>取消</Button>
            <Button
              variant={auditAction === 'approve' ? 'default' : 'destructive'}
              onClick={submitAudit}
              disabled={auditAction === 'reject' && !auditComment.trim()}
            >
              {auditAction === 'approve' ? '确认通过' : '确认驳回'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
