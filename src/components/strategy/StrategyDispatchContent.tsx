'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Check, Send, AlertCircle, Plus, User, X, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PersonnelMatchAgentStreamPanel from '@/components/dispatch-agent/PersonnelMatchAgentStreamPanel';
import type { MatchRegionItem, RegionMatchResult } from '@/hooks/usePersonnelMatchBatchStream';
import { XINJIANG_PROVINCE_PERSONNEL } from '@/data/xinjiangDispatchPersonnel';
import { formatMatchMethodTags } from '@/lib/dispatch-agent/formatMatchReason';

// ==================== 数据类型定义 ====================

interface TaskSubRow {
  riskCustomerGroup: string;
  strategy: string;
  selectionTag: string;
  dispatchAreas: string;
}

interface TaskItem {
  id: number;
  subIndicator: string;
  rows: TaskSubRow[];
}

// ==================== 模拟数据 ====================

const MOCK_TASK_LIST: TaskItem[] = [
  {
    id: 1,
    subIndicator: '当月全球通终端硬件融合渗透率',
    rows: [
      {
        riskCustomerGroup: '潜在携出客户',
        strategy: '优化离网客户挽留与赢回流程。对高危高价值客户自动分配至专属客户经理，进行深度1对1沟通与关怀，提供定制化挽留方案，包括但不限于套餐优惠、终端补贴、增值服务免费体验等，确保客户感知到专属价值。',
        selectionTag: '圈选所有标签',
        dispatchAreas: '乌鲁木齐、昌吉、伊犁',
      },
      {
        riskCustomerGroup: '兜底规则',
        strategy: '针对全球通高ARPU值客户，通过IVR外呼推荐"硬件+视频会员+云存储"融合升级包，强调"一户全享"的性价比优势，并提供首月免费体验。',
        selectionTag: '圈选所有标签',
        dispatchAreas: '乌鲁木齐、昌吉、伊犁',
      },
    ],
  },
  {
    id: 2,
    subIndicator: '当月全球通高价值权益覆盖率',
    rows: [
      {
        riskCustomerGroup: '潜在降档客户',
        strategy: '强化高价值权益宣传，体现品牌权益差异，并结合客户需求，通过数智化生活产品或权益升级方案（如出行权益包、视频会员包）进行维系。',
        selectionTag: '圈选所有标签',
        dispatchAreas: '喀什、阿克苏、巴州',
      },
      {
        riskCustomerGroup: '兜底规则',
        strategy: '针对全球通高价值客户，通过App弹窗和短信推送"尊享出行+视频会员"融合权益包，强调品牌专属权益差异化。',
        selectionTag: '圈选所有标签',
        dispatchAreas: '喀什、阿克苏、巴州',
      },
    ],
  },
  {
    id: 3,
    subIndicator: '当月低频高额超套客户占比',
    rows: [
      {
        riskCustomerGroup: '宽带潜在需求客户',
        strategy: '主推"全家享融合套餐"，通过手机套餐与宽带的打包优惠，并利用APP弹窗、短信、客服外呼等多渠道触达，引导客户办理宽带融合业务。',
        selectionTag: '圈选所有标签',
        dispatchAreas: '克拉玛依、哈密、吐鲁番',
      },
      {
        riskCustomerGroup: '兜底规则',
        strategy: '在客户可能产生高流量的行为前或刚超套时，主动推送合适的大流量包。',
        selectionTag: '圈选所有标签',
        dispatchAreas: '克拉玛依、哈密、吐鲁番',
      },
    ],
  },
];

// IOP处理人列表
const IOP_USER_LIST: Array<{
  id: string;
  name: string;
  department: string;
  phone: string;
}> = [
  { id: 'iop-1', name: '王建国', department: 'IOP运营中心', phone: '13900139001' },
  { id: 'iop-2', name: '李明远', department: 'IOP运营中心', phone: '13900139002' },
  { id: 'iop-3', name: '张晓峰', department: 'IOP营销策划部', phone: '13900139003' },
  { id: 'iop-4', name: '陈思远', department: 'IOP营销策划部', phone: '13900139004' },
];

// 审批人列表
const APPROVER_LIST: Array<{
  id: string;
  name: string;
  department: string;
}> = [
  { id: 'approver-1', name: '王总', department: '总部领导' },
  { id: 'approver-2', name: '李总', department: '市场部' },
  { id: 'approver-3', name: '张总', department: '运营部' },
];

// ==================== 主组件 ====================

export interface StrategyDispatchSubmitPayload {
  orderTitle: string;
  businessScenario: string;
  dispatchSystem: 'IOP' | '网格通' | '剧本营销';
  description: string;
}

interface StrategyDispatchContentProps {
  indicatorName?: string;  // 默认 '全球通客户规模保有率'
  from?: string;           // 默认 'mid-high-customer-operations'
  onBack?: () => void;     // 提供时"返回"和"上一步"按钮调用它，否则保持 router.back()
  onSubmitSuccess?: (payload: StrategyDispatchSubmitPayload) => void; // 提供时提交成功（handleSubmit 校验通过后）调用它，否则保持 router.back()
  embed?: boolean;         // 嵌入弹窗模式：背景透明（由外层容器控制），不加 min-h-screen
}

function StrategyDispatchContent({ indicatorName: indicatorNameProp, from: fromProp = 'mid-high-customer-operations', onBack, onSubmitSuccess, embed = false }: StrategyDispatchContentProps) {
  const router = useRouter();
  const indicatorName = indicatorNameProp || '全球通客户规模保有率';
  const from = fromProp;

  // 根据来源页面设置默认业务场景
  const getDefaultBusinessScenario = (from: string): string => {
    if (from === 'churn-retention') return '公众市场/客户运营/离网维系';
    if (from === 'mid-high-customer-operations') return '公众市场/客户运营/全球通';
    if (from === 'traffic-operations') return '公众市场/流量运营';
    if (from === 'family-operations') return '公众市场/家庭运营';
    if (from === 'incremental-operations') return '公众市场/增量运营';
    return '公众市场/客户运营';
  };

  // 表单数据
  const [formData, setFormData] = useState({
    businessScenario: getDefaultBusinessScenario(from),
    orderType: '策略调度',
    orderTitle: `${indicatorName}未达标`,
    completionTime: '',
    description: `2026年04月新疆区${indicatorName}达标率偏低，请各分公司参照相应策略对客户进行营销推荐。`,
    dispatchSystem: 'IOP' as 'IOP' | '网格通' | '剧本营销',
    executionRole: '' as '' | '地市集运' | '网格经理',
    importanceLevel: '', // 重要级别：公司领导调度、公司部门调度
    enablePostEvaluation: false, // 是否开启后评估
    postEvaluationPeriodType: '月', // 后评估周期类型：月
    postEvaluationPeriodValue: '', // 后评估周期数值
    urgencyLevel: '重要', // 紧急程度：重要/紧急（人员匹配Agent输入维度）
  });

  // 业务场景简名（人员匹配Agent场景规则卡用）
  const sceneName = useMemo(() => {
    if (from === 'churn-retention') return '离网维系';
    if (from === 'traffic-operations') return '流量运营';
    if (from === 'family-operations') return '家庭运营';
    if (from === 'incremental-operations') return '增量运营';
    return '中高端客户保有';
  }, [from]);

  // 任务列表
  const [taskList, setTaskList] = useState<TaskItem[]>(MOCK_TASK_LIST);

  // 策略详情查看
  const [strategyDetail, setStrategyDetail] = useState<TaskSubRow | null>(null);

  // 新增策略
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  const [addStrategyForm, setAddStrategyForm] = useState<TaskSubRow>({
    riskCustomerGroup: '',
    strategy: '',
    selectionTag: '圈选所有标签',
    dispatchAreas: '',
  });

  // 关联活动配置
  const [linkedActivity, setLinkedActivity] = useState('');

  // IOP处理人
  const [iopHandler, setIopHandler] = useState<{ id: string; name: string } | null>(null);
  const [showIopUserDialog, setShowIopUserDialog] = useState(false);

  // 建议执行渠道（IOP时）
  const [suggestedChannels, setSuggestedChannels] = useState<string[]>([]);

  // 指标设置数据（从 workOrders 中提取唯一指标）
  const [indicators, setIndicators] = useState(() => {
    const uniqueIndicators = Array.from(
      new Set(taskList.map(order => order.subIndicator))
    ).map((name, index) => ({
      id: index + 1,
      name: name,
      targetValue: '',
    }));
    return uniqueIndicators;
  });

  // 审批人
  const [approver, setApprover] = useState<{ id: string; name: string } | null>(null);
  const [showApproverDialog, setShowApproverDialog] = useState(false);

  // ===== 人员匹配Agent =====
  // 匹配结果缓存：key = 区域名
  const [orderMatchResults, setOrderMatchResults] = useState<Record<string, RegionMatchResult>>({});
  const [matchStreaming, setMatchStreaming] = useState(false);

  // 从任务派发区域拆分全部区域（去重），作为 Agent 匹配区域列表
  const dispatchRegionNames = useMemo(() => {
    const regionSet = new Set<string>();
    taskList.forEach((task) =>
      task.rows.forEach((row) =>
        row.dispatchAreas
          .split(/[,，、]\s*/)
          .map((name) => name.trim())
          .filter(Boolean)
          .forEach((name) => regionSet.add(name))
      )
    );
    return Array.from(regionSet);
  }, [taskList]);

  const matchRegions: MatchRegionItem[] = useMemo(
    () =>
      dispatchRegionNames.map((name) => ({
        regionId: name,
        regionName: name,
        personnel: XINJIANG_PROVINCE_PERSONNEL[name] || [],
      })),
    [dispatchRegionNames]
  );

  const handleMatchResultsChange = useCallback((results: Record<string, RegionMatchResult>) => {
    setOrderMatchResults(results);
  }, []);

  // 单行（多区域）的匹配展示数据：取首个区域的 Agent 判定
  const getRowMatchInfo = (dispatchAreas: string) => {
    const areas = dispatchAreas
      .split(/[,，、]\s*/)
      .map((name) => name.trim())
      .filter(Boolean);
    const firstResult = areas.length > 0 ? orderMatchResults[areas[0]] : undefined;
    if (!firstResult?.ready) return null;
    return {
      assignee: firstResult.assignee,
      methodTags: formatMatchMethodTags(firstResult.basis),
      score: firstResult.basis?.candidate_scores?.[0]?.combined_score ?? null,
      reason: firstResult.reason,
    };
  };

  // 表单字段更新
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 提交
  const handleSubmit = () => {
    if (!formData.orderTitle.trim()) {
      alert('请填写工单标题');
      return;
    }
    if (!formData.completionTime) {
      alert('请选择要求完成时间');
      return;
    }
    if (!formData.description.trim()) {
      alert('请填写工单描述');
      return;
    }
    if (formData.dispatchSystem === 'IOP' && !iopHandler) {
      alert('请选择IOP处理人');
      return;
    }
    if (formData.dispatchSystem === '网格通' && !formData.executionRole) {
      alert('请选择执行角色');
      return;
    }
    if (formData.dispatchSystem === '剧本营销') {
      // 剧本营销无需配置执行渠道/处理人/执行角色，审批通过后由发起人在待办中配置
    }
    if (!approver) {
      alert('请选择审批人');
      return;
    }
    alert('提交审核成功！工单将进入审批流程。');
    if (onSubmitSuccess) {
      onSubmitSuccess({
        orderTitle: formData.orderTitle,
        businessScenario: formData.businessScenario,
        dispatchSystem: formData.dispatchSystem,
        description: formData.description,
      });
      return;
    }
    router.back();
  };

  return (
    <div className={embed ? 'bg-transparent' : 'min-h-screen bg-background'}>
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* 流程进度 */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">数据洞察</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">策略匹配</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <span className="text-sm font-semibold text-primary">调度派发</span>
          </div>
        </div>

        {/* 基础工单信息 */}
        <div className="bg-card rounded-lg border p-6 mb-4">
          <h3 className="text-base font-semibold mb-4">基础信息</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* 业务场景 + 工单类型 */}
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">
                <span className="text-red-500">*</span> 业务场景
              </Label>
              <Input
                value={formData.businessScenario}
                readOnly
                className="bg-muted border-0 flex-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">
                <span className="text-red-500">*</span> 工单类型
              </Label>
              <Input
                value={formData.orderType}
                readOnly
                className="bg-muted border-0 flex-1"
              />
            </div>

            {/* 工单标题 + 要求完成时间 */}
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">
                <span className="text-red-500">*</span> 工单标题
              </Label>
              <Input
                value={formData.orderTitle}
                onChange={(e) => updateField('orderTitle', e.target.value)}
                className="flex-1"
                placeholder="请输入工单标题"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">
                <span className="text-red-500">*</span> 要求完成时间
              </Label>
              <Input
                type="date"
                value={formData.completionTime}
                onChange={(e) => updateField('completionTime', e.target.value)}
                className="flex-1"
                placeholder="请选择要求完成时间"
              />
            </div>
          </div>

          {/* 工单描述 */}
          <div className="flex items-start gap-3 mt-4">
            <Label className="w-28 shrink-0 text-sm text-right pt-2">
              <span className="text-red-500">*</span> 工单描述
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="flex-1 min-h-[100px]"
              placeholder="请输入工单描述"
            />
          </div>

          {/* 紧急程度 */}
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-900">
              <span className="text-red-500">*</span> 紧急程度
            </Label>
            <Select value={formData.urgencyLevel} onValueChange={(value) => setFormData((prev) => ({ ...prev, urgencyLevel: value }))}>
              <SelectTrigger className="mt-2 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="重要">重要</SelectItem>
                <SelectItem value="紧急">紧急</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 重要级别 */}
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-900">重要级别</Label>
            <Select value={formData.importanceLevel || 'none'} onValueChange={(value) => {
              const level = value === 'none' ? '' : value;
              const mustEnable = level === '公司领导调度' || level === '公司部门调度';
              setFormData((prev) => ({ ...prev, importanceLevel: level, ...(mustEnable ? { enablePostEvaluation: true } : {}) }));
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="请选择重要级别（非必选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不选择</SelectItem>
                <SelectItem value="公司领导调度">公司领导调度</SelectItem>
                <SelectItem value="公司部门调度">公司部门调度</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 是否开启后评估 */}
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-900">是否开启后评估</Label>
            <Select value={formData.enablePostEvaluation ? 'yes' : 'no'} onValueChange={(value) => {
              const mustEnable = formData.importanceLevel === '公司领导调度' || formData.importanceLevel === '公司部门调度';
              if (mustEnable && value === 'no') return;
              setFormData((prev) => ({ ...prev, enablePostEvaluation: value === 'yes' }));
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">是</SelectItem>
                <SelectItem value="no" disabled={formData.importanceLevel === '公司领导调度' || formData.importanceLevel === '公司部门调度'}>否</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 后评估周期（仅在选择"是"时显示，策略调度均为月指标） */}
          {formData.enablePostEvaluation && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-green-900">月指标后评估周期</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">{indicators.length} 个月指标</span>
              </div>
              <div className="flex gap-2">
                <Select value={formData.postEvaluationPeriodType} onValueChange={(value) => setFormData((prev) => ({ ...prev, postEvaluationPeriodType: value as '月' }))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="月">月</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.postEvaluationPeriodValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                      setFormData((prev) => ({ ...prev, postEvaluationPeriodValue: value }));
                    }
                  }}
                  className="w-24"
                  placeholder="数值"
                />
                <span className="text-sm text-gray-500 self-center">个月后评估</span>
              </div>
            </div>
          )}

          {/* 指标设置区域 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
            <div className="bg-[#F9FAFB] px-4 py-3 border-b">
              <Label className="text-sm font-medium text-gray-900">指标设置</Label>
              <p className="text-xs text-gray-500 mt-1">为每个问题子指标设置全疆级目标值</p>
            </div>
            <table className="w-full">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">指标名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">目标值</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((indicator, index) => (
                  <tr key={indicator.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-900">{indicator.name}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="text"
                        value={indicator.targetValue}
                        onChange={(e) => {
                          const newIndicators = [...indicators];
                          newIndicators[index].targetValue = e.target.value;
                          setIndicators(newIndicators);
                        }}
                        placeholder="请输入目标值"
                        className="h-9"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="bg-card rounded-lg border p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">任务列表</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddStrategy(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> 新增策略
            </Button>
          </div>

          {/* 人员匹配Agent */}
          <div className="mb-4">
            <PersonnelMatchAgentStreamPanel
              regions={matchRegions}
              title={formData.orderTitle || indicatorName}
              indicatorLabel={indicatorName}
              urgencyLevel={formData.urgencyLevel}
              dispatchKind="strategy"
              businessScenario={sceneName}
              enabled
              onResultsChange={handleMatchResultsChange}
              onStreamingChange={setMatchStreaming}
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full min-w-[1400px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-center font-medium w-12">序号</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[140px]">问题（子）指标</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[120px]">潜在风险客群</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[200px]">策略描述</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[100px]">圈选标签</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[160px]">派发区域</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[140px]">推荐执行人</th>
                  <th className="px-4 py-3 text-left font-medium w-28">匹配方式</th>
                  <th className="px-4 py-3 text-center font-medium w-20">综合分</th>
                  <th className="px-4 py-3 text-left font-medium min-w-[180px]">匹配原因</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {taskList.map((task) =>
                  task.rows.map((row, rowIdx) => {
                    const matchInfo = getRowMatchInfo(row.dispatchAreas);
                    // 该行各派发区域 → 对应推荐执行人
                    const areaAssignees = row.dispatchAreas
                      .split(/[,，、]\s*/)
                      .map((name) => name.trim())
                      .filter(Boolean)
                      .map((name) => {
                        const result = orderMatchResults[name];
                        return result?.assignee ? `${name}·${result.assignee.name}` : null;
                      })
                      .filter(Boolean);
                    return (
                      <tr key={`${task.id}-${rowIdx}`} className="hover:bg-muted/30">
                        {rowIdx === 0 ? (
                          <td
                            className="px-4 py-3 text-center align-top border-r"
                            rowSpan={task.rows.length}
                          >
                            {task.id}
                          </td>
                        ) : null}
                        {rowIdx === 0 ? (
                          <td
                            className="px-4 py-3 text-left align-top border-r font-medium"
                            rowSpan={task.rows.length}
                          >
                            {task.subIndicator}
                          </td>
                        ) : null}
                        <td className="px-4 py-3 text-left">
                          <Badge variant={row.riskCustomerGroup === '兜底规则' ? 'secondary' : 'outline'} className="text-xs">
                            {row.riskCustomerGroup}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <button
                            type="button"
                            className="line-clamp-2 text-left text-primary hover:underline"
                            title="点击查看策略详情"
                            onClick={() => setStrategyDetail(row)}
                          >
                            {row.strategy}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <button className="text-primary text-xs hover:underline">
                            {row.selectionTag}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-left text-muted-foreground">
                          {row.dispatchAreas}
                        </td>
                        <td className="px-4 py-3">
                          {areaAssignees.length > 0 ? (
                            <div className="space-y-1 text-xs text-gray-700">
                              {areaAssignees.map((area, i) => (
                                <div key={i} className="whitespace-nowrap">{area}</div>
                              ))}
                            </div>
                          ) : matchStreaming ? (
                            <span className="text-xs text-gray-400">匹配中…</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {matchInfo ? (matchInfo.methodTags.map(t => t.label).join('、') || '—') : '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {matchInfo ? (matchInfo.score != null ? matchInfo.score.toFixed(4) : '—') : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs leading-relaxed text-gray-600">
                          {matchInfo ? (matchInfo.reason || '—') : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 派发配置 */}
        <div className="bg-card rounded-lg border p-6 mb-4">
          <h3 className="text-base font-semibold mb-4">派发配置</h3>
          <div className="space-y-4">
            {/* 派发系统 */}
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">
                <span className="text-red-500">*</span> 派发系统
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dispatchSystem"
                    value="IOP"
                    checked={formData.dispatchSystem === 'IOP'}
                    onChange={() => {
                      updateField('dispatchSystem', 'IOP');
                      updateField('executionRole', '');
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm">IOP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dispatchSystem"
                    value="网格通"
                    checked={formData.dispatchSystem === '网格通'}
                    onChange={() => {
                      updateField('dispatchSystem', '网格通');
                      setIopHandler(null);
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm">网格通</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dispatchSystem"
                    value="剧本营销"
                    checked={formData.dispatchSystem === '剧本营销'}
                    onChange={() => {
                      updateField('dispatchSystem', '剧本营销');
                      setIopHandler(null);
                      updateField('executionRole', '');
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm">剧本营销</span>
                </label>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  {formData.dispatchSystem === '剧本营销'
                    ? '工单提交后将进入审批流程，审批通过后需在待办工单中发起剧本营销，客群将自动带入IOP剧本营销页面'
                    : '工单提交后将进入审批流程，审批通过后派发至相关系统，并可在工作台进行跟踪'}
                </span>
              </div>
            </div>

            {/* 关联活动配置 */}
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">关联活动配置</Label>
              <Select value={linkedActivity} onValueChange={setLinkedActivity}>
                <SelectTrigger className="w-[360px]">
                  <SelectValue placeholder="选择已审批通过的活动（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">不关联</SelectItem>
                  <SelectItem value="ACT-2026-0821-007">乌鲁木齐存量客户套餐升档专项活动</SelectItem>
                  <SelectItem value="ACT-2026-0826-003">高价值客户离网挽留权益活动</SelectItem>
                  <SelectItem value="ACT-2026-0820-004">家庭宽带融合升档专项活动</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">关联后，策略调度与活动配置形成闭环追踪</span>
              </div>
            </div>

            {/* IOP：建议执行渠道 + IOP处理人 / 执行角色 */}
            {formData.dispatchSystem === 'IOP' && (
              <div className="space-y-4">
                {/* 建议执行渠道 */}
                <div className="flex items-start gap-3">
                  <Label className="w-28 shrink-0 text-sm text-right pt-0.5"><span className="text-red-500 mr-0.5">*</span>建议执行渠道</Label>
                  <div className="flex flex-wrap gap-2">
                    {['营业厅', '5G消息', '短信', '手厅', '企微'].map((ch) => {
                      const isSelected = suggestedChannels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            setSuggestedChannels((prev) =>
                              isSelected ? prev.filter((c) => c !== ch) : [...prev, ch]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-border hover:bg-muted/50'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                    {suggestedChannels.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSuggestedChannels([])}
                        className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        清空
                      </button>
                    )}
                  </div>
                </div>
                {/* IOP处理人 */}
                <div className="flex items-center gap-3">
                  <Label className="w-28 shrink-0 text-sm text-right">
                    <span className="text-red-500">*</span> IOP处理人
                  </Label>
                  {iopHandler ? (
                    <div className="flex items-center gap-2 bg-muted/50 border rounded-md px-3 py-1.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{iopHandler.name}</span>
                      <button
                        onClick={() => setIopHandler(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowIopUserDialog(true)}
                      className="flex items-center gap-1 text-primary text-sm hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      选择人员
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* 网格通：执行角色 */}
            {formData.dispatchSystem === '网格通' && (
              <div className="flex items-center gap-3">
                <Label className="w-28 shrink-0 text-sm text-right">
                  <span className="text-red-500">*</span> 执行角色
                </Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="executionRole"
                      value="地市集运"
                      checked={formData.executionRole === '地市集运'}
                      onChange={() => updateField('executionRole', '地市集运')}
                      className="accent-primary"
                    />
                    <span className="text-sm">地市集运</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="executionRole"
                      value="网格经理"
                      checked={formData.executionRole === '网格经理'}
                      onChange={() => updateField('executionRole', '网格经理')}
                      className="accent-primary"
                    />
                    <span className="text-sm">网格经理</span>
                  </label>
                </div>
              </div>
            )}
            {/* 剧本营销：极简提示 */}
            {formData.dispatchSystem === '剧本营销' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  审批通过后，系统将为发起人生成待办工单，发起人可在待办工单中点击"发起剧本营销"进入IOP剧本营销页面完成配置并提交执行。上游客群信息将自动带入剧本营销页面。
                </div>
              </div>
            )}

            {/* 审批人 */}
            <div className="flex items-center gap-3">
              <Label className="w-28 shrink-0 text-sm text-right">
                <span className="text-red-500">*</span> 审批人
              </Label>
              {approver ? (
                <div className="flex items-center gap-2 bg-muted/50 border rounded-md px-3 py-1.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{approver.name}</span>
                  <button
                    onClick={() => setApprover(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowApproverDialog(true)}
                  className="flex items-center gap-1 text-primary text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  选择人员
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => { if (onBack) { onBack(); return; } router.back(); }}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <Button variant="outline" onClick={() => { if (onBack) { onBack(); return; } router.back(); }}>
            ← 上一步
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-1" />
            提交审核
          </Button>
        </div>
      </div>

      {/* IOP处理人选择弹窗 */}
      <Dialog open={showIopUserDialog} onOpenChange={setShowIopUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择IOP处理人</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="max-h-[400px] overflow-y-auto border border-border rounded-lg">
              {IOP_USER_LIST.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.department} · {user.phone}</div>
                    </div>
                  </div>
                  {iopHandler?.id === user.id ? (
                    <span className="text-xs text-muted-foreground">已选择</span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIopHandler({ id: user.id, name: user.name });
                        setShowIopUserDialog(false);
                      }}
                      className="text-primary hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      选择
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 审批人选择弹窗 */}
      <Dialog open={showApproverDialog} onOpenChange={setShowApproverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择审批人</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="max-h-[400px] overflow-y-auto border border-border rounded-lg">
              {APPROVER_LIST.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.department}</div>
                    </div>
                  </div>
                  {approver?.id === a.id ? (
                    <span className="text-xs text-muted-foreground">已添加</span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setApprover({ id: a.id, name: a.name });
                        setShowApproverDialog(false);
                      }}
                      className="text-primary hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      添加
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 策略详情弹窗 */}
      <Dialog open={!!strategyDetail} onOpenChange={(open) => !open && setStrategyDetail(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>策略详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">潜在风险客群</div>
              <Badge variant={strategyDetail?.riskCustomerGroup === '兜底规则' ? 'secondary' : 'outline'}>
                {strategyDetail?.riskCustomerGroup}
              </Badge>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">策略描述</div>
              <p className="text-foreground leading-relaxed">{strategyDetail?.strategy}</p>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">圈选标签</div>
              <p className="text-foreground">{strategyDetail?.selectionTag}</p>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">派发区域</div>
              <p className="text-foreground">{strategyDetail?.dispatchAreas}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 新增策略弹窗 */}
      <Dialog open={showAddStrategy} onOpenChange={setShowAddStrategy}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>新增策略</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>潜在风险客群</Label>
              <Input
                value={addStrategyForm.riskCustomerGroup}
                onChange={(e) => setAddStrategyForm((prev) => ({ ...prev, riskCustomerGroup: e.target.value }))}
                placeholder="如：潜在降档客户"
              />
            </div>
            <div>
              <Label>策略描述</Label>
              <Textarea
                value={addStrategyForm.strategy}
                onChange={(e) => setAddStrategyForm((prev) => ({ ...prev, strategy: e.target.value }))}
                rows={3}
                placeholder="请输入策略描述"
              />
            </div>
            <div>
              <Label>圈选标签</Label>
              <Input
                value={addStrategyForm.selectionTag}
                onChange={(e) => setAddStrategyForm((prev) => ({ ...prev, selectionTag: e.target.value }))}
              />
            </div>
            <div>
              <Label>派发区域</Label>
              <Input
                value={addStrategyForm.dispatchAreas}
                onChange={(e) => setAddStrategyForm((prev) => ({ ...prev, dispatchAreas: e.target.value }))}
                placeholder="如：乌鲁木齐、昌吉、伊犁"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStrategy(false)}>取消</Button>
            <Button onClick={() => {
              if (!addStrategyForm.strategy.trim()) return;
              setTaskList((prev) => {
                const last = prev[prev.length - 1];
                return [...prev, { id: (last?.id ?? 0) + 1, subIndicator: indicatorName, rows: [{ ...addStrategyForm }] }];
              });
              setShowAddStrategy(false);
              setAddStrategyForm({ riskCustomerGroup: '', strategy: '', selectionTag: '圈选所有标签', dispatchAreas: '' });
            }}>确认新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StrategyDispatchContent;
