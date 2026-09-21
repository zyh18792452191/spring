'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Calendar, Send, AlertCircle, Plus, Search, User, ChevronDown, ChevronUp, CheckCircle2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PersonnelMatchAgentStreamPanel from '@/components/dispatch-agent/PersonnelMatchAgentStreamPanel';
import type { MatchRegionItem, RegionMatchResult } from '@/hooks/usePersonnelMatchBatchStream';
import { XINJIANG_PROVINCE_PERSONNEL } from '@/data/xinjiangDispatchPersonnel';
import { formatMatchMethodTags } from '@/lib/dispatch-agent/formatMatchReason';

interface IndicatorDispatchDialogProps {
  open: boolean;
  onClose: () => void;
  indicatorName?: string; // 兼容旧的单指标方式
  indicators?: Array<{id: string, name: string, period: string}>; // 多指标数组
  containerMode?: boolean; // 是否为容器模式（用于Drawer等场景）
  source?: string; // 来源标识，如 'overview' 表示从洞察总览发起
  scenario?: string; // 业务场景
}

// 区域数据（新疆16地市）
const regions = [
  { id: 1, name: '乌鲁木齐', scale: '185518户', ratio: '0.95' },
  { id: 2, name: '克拉玛依', scale: '205518户', ratio: '0.95' },
  { id: 3, name: '阿克苏', scale: '167741户', ratio: '3.82' },
  { id: 4, name: '喀什', scale: '152410户', ratio: '2.15' },
  { id: 5, name: '伊犁', scale: '141205户', ratio: '1.76' },
  { id: 6, name: '昌吉', scale: '72550户', ratio: '2.58' },
  { id: 7, name: '巴州', scale: '88320户', ratio: '4.12' },
  { id: 8, name: '吐鲁番', scale: '38970户', ratio: '1.23' },
  { id: 9, name: '哈密', scale: '41031户', ratio: '0.51' },
  { id: 10, name: '博州', scale: '29850户', ratio: '0.87' },
  { id: 11, name: '和田', scale: '56230户', ratio: '5.98' },
  { id: 12, name: '塔城', scale: '45120户', ratio: '1.45' },
  { id: 13, name: '阿勒泰', scale: '32100户', ratio: '0.62' },
  { id: 14, name: '克州', scale: '22350户', ratio: '3.27' },
  { id: 15, name: '奎屯', scale: '18700户', ratio: '2.03' },
  { id: 16, name: '石河子', scale: '35400户', ratio: '1.18' },
];

export default function IndicatorDispatchDialog({
  open,
  onClose,
  indicatorName,
  indicators,
  containerMode,
  source,
  scenario,
}: IndicatorDispatchDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // 当前有效的指标列表
  const effectiveIndicators = useMemo(() => {
    if (indicators && indicators.length > 0) return indicators;
    if (indicatorName) return [{ id: 'single', name: indicatorName, period: '日' }];
    return [];
  }, [indicators, indicatorName]);

  // Step1: 区域选择
  const [selectedRegions, setSelectedRegions] = useState<Set<number>>(new Set([1, 3]));
  const [selectAllRegions, setSelectAllRegions] = useState(false);

  // Step2: 表单数据
  const [formData, setFormData] = useState({
    businessScenario: scenario || '公众市场/客户运营/全球通',
    orderType: '指标调度',
    orderTitle: effectiveIndicators.length === 1 ? `${effectiveIndicators[0].name}未达标` : '',
    completionTime: '',
    description: '',
    dispatchSystem: '市场运营平台',
    importanceLevel: '', // 重要级别：公司领导调度、公司部门调度
    enablePostEvaluation: false, // 是否开启后评估
    urgencyLevel: '重要', // 紧急程度：重要/紧急（人员匹配Agent输入维度）
    // 日指标后评估周期（支持"日"、"周"）
    dayIndicatorPostEvaluationPeriodType: '周',
    dayIndicatorPostEvaluationPeriodValue: '2',
    // 月指标后评估周期（只支持"月"）
    monthIndicatorPostEvaluationPeriodType: '月',
    monthIndicatorPostEvaluationPeriodValue: '3',
  });

  // 任务列表数据（每行对应一个选中区域×指标）
  const [taskList, setTaskList] = useState<Array<{
    id: string;
    region: string;
    indicatorName: string;
    indicatorValue: string;
    indicatorChange: string;
    changeDirection: 'up' | 'down';
    recipient: string | null;
    recipientId: string | null;
    taskRequirement: string;
  }>>([]);

  // 指标设置数据（全疆级目标值，从 effectiveIndicators 生成）
  const getIndicatorUnit = (indicatorName: string): string => {
    const percentIndicators = ['保有率', '完成率', '达成率', '渗透率', '占比', '增长率', '提升率', '环比', '同比', '百分比', '率', 'pp'];
    const scaleIndicators = ['规模', '客户数', '户数', '人数', '数量'];
    const revenueIndicators = ['收入', '收益', '金额', '费用'];
    if (percentIndicators.some(keyword => indicatorName.includes(keyword))) return '%';
    if (scaleIndicators.some(keyword => indicatorName.includes(keyword))) return '万户';
    if (revenueIndicators.some(keyword => indicatorName.includes(keyword))) return '万元';
    return '';
  };

  const [indicatorTargets, setIndicatorTargets] = useState<Array<{id: string, name: string, period: string, targetValue: string, unit?: string}>>([]);

  // 统计日/月指标数量
  const periodInfo = useMemo(() => {
    const dayCount = indicatorTargets.filter(i => i.period === '日').length;
    const monthCount = indicatorTargets.filter(i => i.period === '月').length;
    return { dayCount, monthCount };
  }, [indicatorTargets]);

  // 当 effectiveIndicators 变化时初始化指标设置数据
  useEffect(() => {
    setIndicatorTargets(
      effectiveIndicators.map(ind => ({
        ...ind,
        targetValue: '',
        unit: getIndicatorUnit(ind.name),
      }))
    );
  }, [JSON.stringify(effectiveIndicators)]);

  // 审批人列表
  const APPROVER_LIST: Array<{ id: string; name: string; department: string }> = [
    { id: 'approver-1', name: '王总', department: '总部领导' },
    { id: 'approver-2', name: '李总', department: '市场部' },
    { id: 'approver-3', name: '张总', department: '运营部' },
  ];

  // 人员数据（按区域）
  const REGION_PERSONNEL: Record<string, Array<{ id: string; name: string; department: string }>> = {
    '乌鲁木齐': [
      { id: 'wlmq-1', name: '张三', department: '存量运营中心' },
      { id: 'wlmq-2', name: '李四', department: '客户运营中心' },
    ],
    '克拉玛依': [
      { id: 'klmy-1', name: '赵六', department: '存量运营中心' },
      { id: 'klmy-2', name: '钱七', department: '客户运营中心' },
    ],
    '吐鲁番': [
      { id: 'tlf-1', name: '华三十二', department: '存量运营中心' },
    ],
    '哈密': [
      { id: 'hm-1', name: '韩十九', department: '产品运营中心' },
    ],
    '昌吉': [
      { id: 'cj-1', name: '陈十四', department: '存量运营中心' },
    ],
    '博州': [
      { id: 'bz-1', name: '王十二', department: '产品运营中心' },
    ],
    '巴州': [
      { id: 'baz-1', name: '张二十八', department: '存量运营中心' },
    ],
    '阿克苏': [
      { id: 'aks-1', name: '孙八', department: '客户运营中心' },
    ],
    '克州': [
      { id: 'kz-1', name: '褚十五', department: '存量运营中心' },
    ],
    '喀什': [
      { id: 'ks-1', name: '卫十六', department: '产品运营中心' },
    ],
    '和田': [
      { id: 'ht-1', name: '尤二十三', department: '产品运营中心' },
    ],
    '伊犁': [
      { id: 'yl-1', name: '严三十一', department: '客户运营中心' },
    ],
    '塔城': [
      { id: 'tc-1', name: '秦二十二', department: '存量运营中心' },
    ],
    '阿勒泰': [
      { id: 'alt-1', name: '何二十五', department: '客户运营中心' },
    ],
    '奎屯': [
      { id: 'kt-1', name: '许二十四', department: '存量运营中心' },
    ],
    '石河子': [
      { id: 'shz-1', name: '姜三十六', department: '产品运营中心' },
    ],
  };

  // 审批人状态
  const [approver, setApprover] = useState<{ id: string; name: string; department: string } | null>(null);
  const [showApproverDialog, setShowApproverDialog] = useState(false);

  // 任务行接收人选择弹窗
  const [showTaskRecipientDialog, setShowTaskRecipientDialog] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string>('');

  // 初始化任务列表数据（当 selectedRegions 或 effectiveIndicators 变化时）
  useEffect(() => {
    const selectedRegionIds = Array.from(selectedRegions);
    const newTaskList: Array<{
      id: string;
      region: string;
      indicatorName: string;
      indicatorValue: string;
      indicatorChange: string;
      changeDirection: 'up' | 'down';
      recipient: string | null;
      recipientId: string | null;
      taskRequirement: string;
    }> = [];

    selectedRegionIds.forEach(regionId => {
      const region = regions.find(r => r.id === regionId);
      if (region) {
        effectiveIndicators.forEach(indicator => {
          const baseValue = (80 + Math.random() * 20).toFixed(2);
          const changeValue = (Math.random() * 10 - 3).toFixed(2);
          newTaskList.push({
            id: `${regionId}-${indicator.id}`,
            region: region.name,
            indicatorName: indicator.name,
            indicatorValue: `${baseValue}%`,
            indicatorChange: `${Math.abs(parseFloat(changeValue)).toFixed(2)}pp`,
            changeDirection: parseFloat(changeValue) >= 0 ? 'up' : 'down',
            recipient: null,
            recipientId: null,
            taskRequirement: '',
          });
        });
      }
    });

    setTaskList(newTaskList);
  }, [selectedRegions, effectiveIndicators]);

  // 更新任务列表中的接收人
  const handleTaskRecipientChange = (taskId: string, name: string, id: string) => {
    setTaskList(prev => prev.map(task =>
      task.id === taskId ? { ...task, recipient: name, recipientId: id } : task
    ));
  };

  // 更新任务列表中的任务要求
  const handleTaskRequirementChange = (taskId: string, requirement: string) => {
    setTaskList(prev => prev.map(task =>
      task.id === taskId ? { ...task, taskRequirement: requirement } : task
    ));
  };

  // 区域选择操作
  const handleRegionToggle = (regionId: number) => {
    setSelectedRegions(prev => {
      const next = new Set(prev);
      if (next.has(regionId)) {
        next.delete(regionId);
      } else {
        next.add(regionId);
      }
      setSelectAllRegions(next.size === regions.length);
      return next;
    });
  };

  const handleSelectAllRegions = (checked: boolean) => {
    setSelectAllRegions(checked);
    if (checked) {
      setSelectedRegions(new Set(regions.map(r => r.id)));
    } else {
      setSelectedRegions(new Set());
    }
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleDispatch = () => {
    handleClose();
    router.push('/workspace');
  };

  // ===== 人员匹配Agent =====
  // 匹配结果缓存：key = 区域ID
  const [regionMatchResults, setRegionMatchResults] = useState<Record<string | number, RegionMatchResult>>({});
  const [matchStreaming, setMatchStreaming] = useState(false);

  // 选中区域 → Agent 匹配区域列表（人员来自新疆16地市调度人员池）
  const matchRegions: MatchRegionItem[] = useMemo(
    () =>
      regions
        .filter((r) => selectedRegions.has(r.id))
        .map((r) => ({
          regionId: r.id,
          regionName: r.name,
          personnel: XINJIANG_PROVINCE_PERSONNEL[r.name] || [],
        })),
    [selectedRegions]
  );

  // Agent 结果变化：缓存结果 + 自动回填任务接收人（用户已手动指定的不覆盖）
  // 用 useCallback 稳定引用 + 仅在接收人实际变化时更新，避免与 Panel 的 effect 形成无限循环
  const handleMatchResultsChange = useCallback(
    (results: Record<string | number, RegionMatchResult>) => {
      setRegionMatchResults(results);
      setTaskList((prev) => {
        let changed = false;
        const next = prev.map((task) => {
          const regionId = Number(task.id.split('-')[0]);
          const result = results[regionId];
          if (result?.ready && result.assignee && !task.recipient) {
            changed = true;
            return { ...task, recipient: result.assignee.name, recipientId: result.assignee.id };
          }
          return task;
        });
        return changed ? next : prev;
      });
    },
    []
  );

  // 单个区域的匹配展示数据（供任务列表扩展列使用）
  const getRegionMatchInfo = (regionId: number) => {
    const result = regionMatchResults[regionId];
    if (!result?.ready) return null;
    return {
      assignee: result.assignee,
      methodTags: formatMatchMethodTags(result.basis),
      score: result.basis?.candidate_scores?.[0]?.combined_score ?? null,
      reason: result.reason,
      loading: false,
    };
  };

  // 添加审批人
  const handleAddApprover = (approverId: string) => {
    const approverData = APPROVER_LIST.find(p => p.id === approverId);
    if (approverData) {
      setApprover(approverData);
      setShowApproverDialog(false);
    }
  };

  // 移除审批人
  const handleRemoveApprover = () => {
    setApprover(null);
  };

  // 选中区域汇总
  const selectedRegionList = regions.filter(r => selectedRegions.has(r.id));
  const totalScale = selectedRegionList.reduce((sum, r) => sum + parseInt(r.scale), 0);
  const totalRatio = selectedRegionList.length > 0
    ? (selectedRegionList.reduce((sum, r) => sum + parseFloat(r.ratio), 0) / selectedRegionList.length).toFixed(2)
    : '0';

  // 渲染内容部分
  const renderContent = () => {
    return (
      <>
        {/* 标题栏 */}
        {!containerMode && (
          <div className="flex items-center justify-between px-6 py-4 border-b bg-[#EAF2FF] shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">调度派发</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-8 px-6 py-3 border-b bg-[#F5F7FF] shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${step === 1 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
              {step === 1 ? '1' : <Check className="w-4 h-4" />}
            </div>
            <span className={`text-sm ${step === 1 ? 'text-blue-600 font-medium' : 'text-green-600'}`}>选择区域</span>
          </div>
          <div className="w-16 h-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
              2
            </div>
            <span className={`text-sm ${step === 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>调度派发</span>
          </div>
        </div>

        {/* Step1: 选择区域 */}
        {step === 1 && (
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">选择派发区域</span>
                  <span className="text-xs text-gray-400">（已选 {selectedRegions.size} 个区域）</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <Checkbox
                    checked={selectAllRegions}
                    onCheckedChange={(checked) => handleSelectAllRegions(checked as boolean)}
                  />
                  全选
                </label>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="w-10 py-2.5 px-3 text-center"></th>
                    <th className="py-2.5 px-3 text-left font-medium text-gray-600">区域名称</th>
                    <th className="py-2.5 px-3 text-right font-medium text-gray-600">规模</th>
                    <th className="py-2.5 px-3 text-right font-medium text-gray-600">环比</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map(region => (
                    <tr key={region.id} className={`border-b last:border-b-0 hover:bg-gray-50 ${selectedRegions.has(region.id) ? 'bg-blue-50/50' : ''}`}>
                      <td className="py-2.5 px-3 text-center">
                        <Checkbox
                          checked={selectedRegions.has(region.id)}
                          onCheckedChange={() => handleRegionToggle(region.id)}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-gray-800">{region.name}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">{region.scale}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={parseFloat(region.ratio) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {parseFloat(region.ratio) >= 0 ? '↑' : '↓'} {region.ratio}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRegions.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                已选择 {selectedRegions.size} 个区域，合计规模 {totalScale.toLocaleString()}户，平均环比 {totalRatio}%
              </div>
            )}
          </div>
        )}

        {/* Step2: 调度派发 */}
        {step === 2 && (
          <div className="flex-1 overflow-auto p-6 space-y-5">
            {/* 基础信息 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 业务场景 */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-600">业务场景</Label>
                  <Input
                    value={formData.businessScenario}
                    readOnly
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  />
                </div>
                {/* 工单类型 */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-600">工单类型</Label>
                  <Input
                    value={formData.orderType}
                    readOnly
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  />
                </div>
              </div>

              {/* 工单标题 */}
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-600"><span className="text-red-500">*</span> 工单标题</Label>
                <Input
                  value={formData.orderTitle}
                  onChange={(e) => setFormData({ ...formData, orderTitle: e.target.value })}
                  placeholder="请输入工单标题"
                />
              </div>

              {/* 要求完成时间 */}
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-600"><span className="text-red-500">*</span> 要求完成时间</Label>
                <Input
                  type="datetime-local"
                  value={formData.completionTime}
                  onChange={(e) => setFormData({ ...formData, completionTime: e.target.value })}
                  placeholder="请选择要求完成时间"
                />
              </div>

              {/* 工单描述 */}
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-600"><span className="text-red-500">*</span> 工单描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入工单描述"
                  rows={4}
                />
              </div>

              {/* 重要级别 */}
              <div>
                <Label className="text-sm font-medium text-gray-900">重要级别</Label>
                <Select value={formData.importanceLevel || 'none'} onValueChange={(value) => {
                  const level = value === 'none' ? '' : value;
                  const mustEnable = level === '公司领导调度' || level === '公司部门调度';
                  setFormData({ ...formData, importanceLevel: level, ...(mustEnable ? { enablePostEvaluation: true } : {}) });
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
              <div>
                <Label className="text-sm font-medium text-gray-900">是否开启后评估</Label>
                <Select value={formData.enablePostEvaluation ? 'yes' : 'no'} onValueChange={(value) => {
                  const mustEnable = formData.importanceLevel === '公司领导调度' || formData.importanceLevel === '公司部门调度';
                  if (mustEnable && value === 'no') return;
                  setFormData({ ...formData, enablePostEvaluation: value === 'yes' });
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

              {/* 后评估周期（仅在选择"是"时显示，按指标类型分组） */}
              {formData.enablePostEvaluation && (
                <div className="space-y-4">
                  {/* 只有日指标 */}
                  {periodInfo.dayCount > 0 && periodInfo.monthCount === 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-900">日指标后评估周期</span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{periodInfo.dayCount} 个日指标</span>
                      </div>
                      <div className="flex gap-2">
                        <Select value={formData.dayIndicatorPostEvaluationPeriodType} onValueChange={(value) => setFormData({ ...formData, dayIndicatorPostEvaluationPeriodType: value as '日' | '周' })}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="日">日</SelectItem>
                            <SelectItem value="周">周</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={formData.dayIndicatorPostEvaluationPeriodValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                              setFormData({ ...formData, dayIndicatorPostEvaluationPeriodValue: value });
                            }
                          }}
                          className="w-24"
                          placeholder="数值"
                        />
                        <span className="text-sm text-gray-500 self-center">
                          {formData.dayIndicatorPostEvaluationPeriodType === '日' ? '天' : '周'}后评估
                        </span>
                      </div>
                    </div>
                  )}
                  {/* 只有月指标 */}
                  {periodInfo.monthCount > 0 && periodInfo.dayCount === 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-green-900">月指标后评估周期</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">{periodInfo.monthCount} 个月指标</span>
                      </div>
                      <div className="flex gap-2">
                        <Select value={formData.monthIndicatorPostEvaluationPeriodType} onValueChange={(value) => setFormData({ ...formData, monthIndicatorPostEvaluationPeriodType: value as '月' })}>
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
                          value={formData.monthIndicatorPostEvaluationPeriodValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                              setFormData({ ...formData, monthIndicatorPostEvaluationPeriodValue: value });
                            }
                          }}
                          className="w-24"
                          placeholder="数值"
                        />
                        <span className="text-sm text-gray-500 self-center">个月后评估</span>
                      </div>
                    </div>
                  )}
                  {/* 同时有日指标和月指标 */}
                  {periodInfo.dayCount > 0 && periodInfo.monthCount > 0 && (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-blue-900">日指标后评估周期</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{periodInfo.dayCount} 个日指标</span>
                        </div>
                        <div className="flex gap-2">
                          <Select value={formData.dayIndicatorPostEvaluationPeriodType} onValueChange={(value) => setFormData({ ...formData, dayIndicatorPostEvaluationPeriodType: value as '日' | '周' })}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="日">日</SelectItem>
                              <SelectItem value="周">周</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            value={formData.dayIndicatorPostEvaluationPeriodValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                                setFormData({ ...formData, dayIndicatorPostEvaluationPeriodValue: value });
                              }
                            }}
                            className="w-24"
                            placeholder="数值"
                          />
                          <span className="text-sm text-gray-500 self-center">
                            {formData.dayIndicatorPostEvaluationPeriodType === '日' ? '天' : '周'}后评估
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-green-900">月指标后评估周期</span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">{periodInfo.monthCount} 个月指标</span>
                        </div>
                        <div className="flex gap-2">
                          <Select value={formData.monthIndicatorPostEvaluationPeriodType} onValueChange={(value) => setFormData({ ...formData, monthIndicatorPostEvaluationPeriodType: value as '月' })}>
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
                            value={formData.monthIndicatorPostEvaluationPeriodValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                                setFormData({ ...formData, monthIndicatorPostEvaluationPeriodValue: value });
                              }
                            }}
                            className="w-24"
                            placeholder="数值"
                          />
                          <span className="text-sm text-gray-500 self-center">个月后评估</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 指标设置区域 - 按统计周期分组 */}
              {indicatorTargets.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#F9FAFB] px-4 py-3 border-b">
                    <Label className="text-sm font-medium text-gray-900">指标设置</Label>
                    <p className="text-xs text-gray-500 mt-1">为待改善指标设置全疆级目标值（按统计周期分组）</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {/* 日指标分组 */}
                    {indicatorTargets.filter(i => i.period === '日').length > 0 && (
                      <div>
                        <div className="bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                          日指标 ({indicatorTargets.filter(i => i.period === '日').length})
                        </div>
                        <table className="w-full">
                          <thead className="bg-[#F9FAFB]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">指标名称</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">目标值</th>
                            </tr>
                          </thead>
                          <tbody>
                            {indicatorTargets.filter(i => i.period === '日').map((indicator) => (
                              <tr key={indicator.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-sm text-gray-900">{indicator.name}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      value={indicator.targetValue}
                                      onChange={(e) => {
                                        setIndicatorTargets(prev =>
                                          prev.map(ind =>
                                            ind.id === indicator.id
                                              ? { ...ind, targetValue: e.target.value }
                                              : ind
                                          )
                                        );
                                      }}
                                      placeholder="请输入目标值"
                                      className="h-9"
                                    />
                                    {indicator.unit && (
                                      <span className="text-sm text-gray-500 whitespace-nowrap">{indicator.unit}</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* 月指标分组 */}
                    {indicatorTargets.filter(i => i.period === '月').length > 0 && (
                      <div>
                        <div className="bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                          月指标 ({indicatorTargets.filter(i => i.period === '月').length})
                        </div>
                        <table className="w-full">
                          <thead className="bg-[#F9FAFB]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">指标名称</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">目标值</th>
                            </tr>
                          </thead>
                          <tbody>
                            {indicatorTargets.filter(i => i.period === '月').map((indicator) => (
                              <tr key={indicator.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-sm text-gray-900">{indicator.name}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      value={indicator.targetValue}
                                      onChange={(e) => {
                                        setIndicatorTargets(prev =>
                                          prev.map(ind =>
                                            ind.id === indicator.id
                                              ? { ...ind, targetValue: e.target.value }
                                              : ind
                                          )
                                        );
                                      }}
                                      placeholder="请输入目标值"
                                      className="h-9"
                                    />
                                    {indicator.unit && (
                                      <span className="text-sm text-gray-500 whitespace-nowrap">{indicator.unit}</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 紧急程度 + 人员匹配Agent */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-gray-900">
                  <span className="text-red-500">*</span> 紧急程度
                </Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                >
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="重要">重要</SelectItem>
                    <SelectItem value="紧急">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <PersonnelMatchAgentStreamPanel
                regions={matchRegions}
                title={formData.orderTitle || effectiveIndicators[0]?.name || ''}
                indicatorLabel={effectiveIndicators[0]?.name || ''}
                urgencyLevel={formData.urgencyLevel}
                businessScenario={scenario || formData.businessScenario}
                enabled={open && step === 2}
                onResultsChange={handleMatchResultsChange}
                onStreamingChange={setMatchStreaming}
              />
            </div>

            {/* 任务列表 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">任务列表</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full min-w-[1200px] text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-2.5 px-3 text-center font-medium text-gray-600 w-12">序号</th>
                      <th className="py-2.5 px-3 text-left font-medium text-gray-600 w-24">派发区域</th>
                      <th className="py-2.5 px-3 text-left font-medium text-gray-600">问题指标</th>
                      <th className="py-2.5 px-3 text-center font-medium text-gray-600 w-32"><span className="text-red-500">*</span> 接收人</th>
                      <th className="py-2.5 px-3 text-left font-medium text-gray-600 w-28">推荐执行人</th>
                      <th className="py-2.5 px-3 text-left font-medium text-gray-600 w-28">匹配方式</th>
                      <th className="py-2.5 px-3 text-center font-medium text-gray-600 w-20">综合分</th>
                      <th className="py-2.5 px-3 text-left font-medium text-gray-600 min-w-[180px]">匹配原因</th>
                      <th className="py-2.5 px-3 text-center font-medium text-gray-600 w-48"><span className="text-red-500">*</span> 任务要求</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskList.map((task, index) => {
                      const regionId = Number(task.id.split('-')[0]);
                      const matchInfo = getRegionMatchInfo(regionId);
                      return (
                      <tr key={task.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-center text-gray-500">{index + 1}</td>
                        <td className="py-2.5 px-3 text-gray-800">{task.region}</td>
                        <td className="py-2.5 px-3">
                          <div className="text-gray-800">{task.indicatorName} {task.indicatorValue}</div>
                          <div className={task.changeDirection === 'up' ? 'text-green-600 text-xs' : 'text-red-600 text-xs'}>
                            环比 {task.indicatorChange} {task.changeDirection === 'up' ? '↑' : '↓'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {task.recipient ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm text-gray-800">{task.recipient}</span>
                              <button
                                onClick={() => handleTaskRecipientChange(task.id, '', '')}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setCurrentTaskId(task.id);
                                setShowTaskRecipientDialog(true);
                              }}
                              className="text-blue-500 hover:text-blue-600 text-sm flex items-center justify-center gap-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              选择人员
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {matchInfo ? (
                            <div>
                              <div className="text-sm text-gray-900">{matchInfo.assignee?.name ?? '—'}</div>
                              {matchInfo.assignee?.department && (
                                <div className="text-xs text-gray-500">{matchInfo.assignee.department}</div>
                              )}
                            </div>
                          ) : matchStreaming ? (
                            <span className="text-xs text-gray-400">匹配中…</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-600">
                          {matchInfo ? (matchInfo.methodTags.map(t => t.label).join('、') || '—') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-sm text-gray-900">
                          {matchInfo ? (matchInfo.score != null ? matchInfo.score.toFixed(4) : '—') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-xs leading-relaxed text-gray-600">
                          {matchInfo ? (matchInfo.reason || '—') : '—'}
                        </td>
                        <td className="py-2 px-3">
                          <Textarea
                            value={task.taskRequirement}
                            onChange={(e) => handleTaskRequirementChange(task.id, e.target.value)}
                            placeholder="请输入要求"
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 审批人 */}
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">审批人</Label>
              <div className="flex items-center gap-2">
                {approver ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">{approver.name}</span>
                    <span className="text-xs text-blue-400">({approver.department})</span>
                    <button onClick={handleRemoveApprover} className="text-blue-400 hover:text-red-500 ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApproverDialog(true)}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    选择人员
                  </button>
                )}
              </div>
            </div>

            {/* 派发系统 */}
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600"><span className="text-red-500">*</span> 派发系统</Label>
              <div className="flex items-center gap-3">
                <div className="w-48 h-9 flex items-center border rounded-md px-3 bg-muted/50 text-sm">
                  市场运营平台（本系统）
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Info className="w-3.5 h-3.5" />
                  <span>派发后可在工作台跟踪已派发的调度工单</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-white shrink-0">
          <Button variant="outline" onClick={handleClose}>取消</Button>
          {step === 2 && (
            <Button variant="outline" onClick={handlePreviousStep}>上一步</Button>
          )}
          {step === 1 ? (
            <Button
              onClick={handleNextStep}
              disabled={selectedRegions.size === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              下一步
            </Button>
          ) : (
            <Button
              onClick={handleDispatch}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              提交
            </Button>
          )}
        </div>

        {/* 审批人选择弹窗 */}
        {showApproverDialog && (
          <Dialog open={showApproverDialog} onOpenChange={setShowApproverDialog}>
            <DialogContent className="max-w-md">
              <DialogTitle>选择审批人</DialogTitle>
              <div className="space-y-2 mt-4">
                {APPROVER_LIST.map(person => (
                  <div
                    key={person.id}
                    onClick={() => handleAddApprover(person.id)}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{person.name}</div>
                      <div className="text-xs text-gray-500">{person.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 任务接收人选择弹窗 */}
        {showTaskRecipientDialog && (
          <Dialog open={showTaskRecipientDialog} onOpenChange={setShowTaskRecipientDialog}>
            <DialogContent className="max-w-md">
              <DialogTitle>选择接收人</DialogTitle>
              <div className="space-y-2 mt-4">
                {(() => {
                  const currentTask = taskList.find(t => t.id === currentTaskId);
                  const personnelList = currentTask ? (REGION_PERSONNEL[currentTask.region] || []) : [];
                  return personnelList.length > 0 ? personnelList.map(person => (
                    <div
                      key={person.id}
                      onClick={() => {
                        handleTaskRecipientChange(currentTaskId, person.name, person.id);
                        setShowTaskRecipientDialog(false);
                      }}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{person.name}</div>
                        <div className="text-xs text-gray-500">{person.department}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400 text-sm">该区域暂无可用人员</div>
                  );
                })()}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  // 容器模式直接渲染内容
  if (containerMode) {
    return <div className="flex flex-col h-full">{renderContent()}</div>;
  }

  // 弹窗模式
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent disableMaxWidth className="w-[1000px] max-h-[800px] flex flex-col p-0 overflow-hidden">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
