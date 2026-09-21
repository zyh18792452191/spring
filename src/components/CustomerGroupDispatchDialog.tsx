'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ChevronRight, X, Search, User, Send, ArrowLeft, AlertTriangle, Users, UserCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ==================== 数据定义 ====================

/** 客群标签分组（圈选标签） */
interface TagRange {
  id: string;
  range: string;
  percentage: string;
}

interface TagGroup {
  id: string;
  name: string;
  tags: TagRange[];
}

const CUSTOMER_TAG_GROUPS: TagGroup[] = [
  {
    id: 'tag-01',
    name: '近三个月月均超套流量',
    tags: [
      { id: 'tag-01-01', range: '66.44-997.27MB', percentage: '92.63%' },
      { id: 'tag-01-02', range: '11.63-51.38MB', percentage: '3.68%' },
      { id: 'tag-01-03', range: '51.38-66.44MB', percentage: '2.27%' },
      { id: 'tag-01-04', range: '997.27MB以上', percentage: '0.85%' },
      { id: 'tag-01-05', range: '<=11.63MB', percentage: '0.57%' },
    ],
  },
  {
    id: 'tag-02',
    name: '理财类应用使用流量(MB)',
    tags: [
      { id: 'tag-02-01', range: '72.46-990.88MB', percentage: '94.62%' },
      { id: 'tag-02-02', range: '<=72.46MB', percentage: '5.38%' },
      { id: 'tag-02-03', range: '990.88MB以上', percentage: '0.00%' },
    ],
  },
  {
    id: 'tag-03',
    name: '影院购票类应用使用流量(MB)',
    tags: [
      { id: 'tag-03-01', range: '<=779.77MB', percentage: '76.20%' },
      { id: 'tag-03-02', range: '798.46MB以上', percentage: '20.68%' },
      { id: 'tag-03-03', range: '779.77-798.46MB', percentage: '3.12%' },
    ],
  },
];

/** 新疆16地市分公司（含客群规模和占比） */
interface RegionItem {
  id: string;
  name: string;
  customerScale: number;
  percentage: string;
}

const REGION_LIST: RegionItem[] = [
  { id: 'R01', name: '乌鲁木齐分公司', customerScale: 43, percentage: '12.18%' },
  { id: 'R02', name: '昌吉分公司', customerScale: 38, percentage: '10.76%' },
  { id: 'R03', name: '伊犁分公司', customerScale: 35, percentage: '9.92%' },
  { id: 'R04', name: '喀什分公司', customerScale: 31, percentage: '8.78%' },
  { id: 'R05', name: '阿克苏分公司', customerScale: 27, percentage: '7.65%' },
  { id: 'R06', name: '巴州分公司', customerScale: 27, percentage: '7.65%' },
  { id: 'R07', name: '克拉玛依分公司', customerScale: 25, percentage: '7.08%' },
  { id: 'R08', name: '哈密分公司', customerScale: 24, percentage: '6.80%' },
  { id: 'R09', name: '吐鲁番分公司', customerScale: 23, percentage: '6.52%' },
  { id: 'R10', name: '塔城分公司', customerScale: 22, percentage: '6.23%' },
  { id: 'R11', name: '和田分公司', customerScale: 20, percentage: '5.67%' },
  { id: 'R12', name: '博州分公司', customerScale: 16, percentage: '4.53%' },
  { id: 'R13', name: '阿勒泰分公司', customerScale: 15, percentage: '4.25%' },
  { id: 'R14', name: '奎屯分公司', customerScale: 12, percentage: '3.40%' },
  { id: 'R15', name: '石河子分公司', customerScale: 8, percentage: '2.27%' },
  { id: 'R16', name: '克州分公司', customerScale: 7, percentage: '1.98%' },
];

/** 审批人列表 */
const APPROVER_LIST = [
  { id: 'A01', name: '张建国', department: '市场运营部', role: '部门经理' },
  { id: 'A02', name: '李明辉', department: '客户运营中心', role: '中心主任' },
  { id: 'A03', name: '王志远', department: '省公司市场部', role: '副总经理' },
];

/** IOP处理人列表 */
const IOP_HANDLER_LIST = [
  { id: 'I01', name: '陈思远', department: 'IOP运营组', role: '运营专员' },
  { id: 'I02', name: '刘佳琪', department: 'IOP运营组', role: '运营主管' },
  { id: 'I03', name: '赵文博', department: 'IOP策划组', role: '策划专员' },
];

// ==================== 类型定义 ====================

interface TagItem {
  id: string;
  name: string;
  subTags?: TagItem[];
}

interface CustomerGroupDispatchDialogProps {
  open: boolean;
  onClose: () => void;
  indicatorName?: string;
  indicatorValue?: string;
  businessScenario?: string;
}

// ==================== 组件 ====================

const CustomerGroupDispatchDialog: React.FC<CustomerGroupDispatchDialogProps> = ({
  open,
  onClose,
  indicatorName = '当月全球通异网主卡率',
  indicatorValue = '6.99%',
  businessScenario = '公众市场/客户运营/全球通',
}) => {
  // 步骤控制
  const [step, setStep] = useState(1);

  // Step1 客群圈选
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Step2 调度派发
  const [orderTitle, setOrderTitle] = useState(`${indicatorName}未达标`);
  const [completionTime, setCompletionTime] = useState('');
  const [description, setDescription] = useState(
    `2026年05月新疆区${indicatorName}达${indicatorValue}、环比上升4.53pp，请各分公司参照相应策略对客户进行营销推荐。`
  );
  const [engagementStrategy, setEngagementStrategy] = useState('');
  const [dispatchSystem, setDispatchSystem] = useState<'IOP' | '网格通' | '剧本营销'>('IOP');
  const [iopHandler, setIopHandler] = useState<{ id: string; name: string } | null>(null);
  const [suggestedChannels, setSuggestedChannels] = useState<string[]>([]);
  const [executionRole, setExecutionRole] = useState<'地市集运' | '网格经理'>('地市集运');
  const [approver, setApprover] = useState<{ id: string; name: string; department?: string } | null>(null);

  // 重要级别 + 后评估
  const [importantLevel, setImportantLevel] = useState('');
  const [postEvaluation, setPostEvaluation] = useState(true);
  const [postEvaluationCycle, setPostEvaluationCycle] = useState('7');
  const [targetValue, setTargetValue] = useState('');

  // 弹窗控制
  const [showApproverDialog, setShowApproverDialog] = useState(false);
  const [showIopHandlerDialog, setShowIopHandlerDialog] = useState(false);

  // 客群规模计算
  const calculatedScale = useMemo(() => {
    const tagFactor = Math.max(selectedTags.length, 1) * 1250;
    const regionFactor = Math.max(selectedRegions.length, 1) * 800;
    return (tagFactor + regionFactor).toLocaleString();
  }, [selectedTags, selectedRegions]);

  // 圈选区域名称
  const selectedRegionNames = useMemo(() => {
    return REGION_LIST
      .filter(r => selectedRegions.includes(r.id))
      .map(r => r.name);
  }, [selectedRegions]);

  // 标签选择
  const handleTagSelection = (tag: TagItem) => {
    setSelectedTags(prev => {
      const exists = prev.some(t => t.id === tag.id);
      if (exists) {
        return prev.filter(t => t.id !== tag.id);
      }
      return [...prev, tag];
    });
  };

  // 区域选择
  const handleRegionToggle = (regionId: string) => {
    setSelectedRegions(prev =>
      prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]
    );
  };

  // 全选/取消全选区域
  const handleSelectAllRegions = () => {
    if (selectedRegions.length === REGION_LIST.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions(REGION_LIST.map(r => r.id));
    }
  };

  // 下一步
  const handleNextStep = () => setStep(2);

  // 上一步
  const handlePreviousStep = () => setStep(1);

  // 提交
  const handleDispatch = () => {
    alert('客群调度工单已提交！');
    handleClose();
  };

  // 关闭并重置
  const handleClose = () => {
    setStep(1);
    setSelectedTags([]);
    setSelectedRegions([]);
    setOrderTitle(`${indicatorName}未达标`);
    setCompletionTime('');
    setDescription(
      `2026年05月新疆区${indicatorName}达${indicatorValue}、环比上升4.53pp，请各分公司参照相应策略对客户进行营销推荐。`
    );
    setEngagementStrategy('');
    setDispatchSystem('IOP');
    setIopHandler(null);
    setExecutionRole('地市集运');
    setApprover(null);
    onClose();
  };

  // ==================== 渲染 ====================

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        disableMaxWidth
        className="w-[1000px] h-[800px] max-h-[800px] flex flex-col p-0 gap-0 overflow-hidden"
      >
        {/* ====== 顶部流程导航 ====== */}
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-700' : 'text-gray-500'}`}>
              客群圈选
            </span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-3" />
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-700' : 'text-gray-500'}`}>
              调度派发
            </span>
          </div>
        </div>

        {/* ====== 内容区域 ====== */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 ? (
            /* ====== Step1: 客群圈选（左右分栏） ====== */
            <div className="flex gap-5 h-full">
              {/* 左侧：圈选标签 */}
              <div className="w-[45%] border rounded-lg flex flex-col overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b shrink-0">
                  <h4 className="text-sm font-semibold text-gray-800">圈选标签</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {CUSTOMER_TAG_GROUPS.map((group) => {
                    const allTagIds = group.tags.map(t => t.id);
                    const selectedCount = allTagIds.filter(id => selectedTags.some(t => t.id === id)).length;
                    const isAllSelected = selectedCount === allTagIds.length;
                    return (
                      <div key={group.id}>
                        {/* 分组标题 + 全选 */}
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTags(prev => {
                                  const otherTags = prev.filter(t => !allTagIds.includes(t.id));
                                  return [...otherTags, ...group.tags.map(t => ({ id: t.id, name: `${group.name}: ${t.range}` }))];
                                });
                              } else {
                                setSelectedTags(prev => prev.filter(t => !allTagIds.includes(t.id)));
                              }
                            }}
                          />
                          <span className="text-sm font-medium text-gray-800">{group.name}</span>
                          <span className="text-xs text-gray-400">可全选</span>
                        </div>
                        {/* 标签卡片网格 */}
                        <div className="grid grid-cols-2 gap-2">
                          {group.tags.map((tag) => {
                            const isSelected = selectedTags.some(t => t.id === tag.id);
                            return (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  const tagItem: TagItem = { id: tag.id, name: `${group.name}: ${tag.range}` };
                                  handleTagSelection(tagItem);
                                }}
                                className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-200'
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                  {tag.range}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">占比: {tag.percentage}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 右侧：圈选区域表格 */}
              <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b shrink-0 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">圈选区域</h4>
                  <Button variant="outline" size="sm" onClick={handleSelectAllRegions}>
                    {selectedRegions.length === REGION_LIST.length ? '取消全选' : '全选'}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="w-10 px-3 py-2 text-center">
                          <Checkbox
                            checked={selectedRegions.length === REGION_LIST.length}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedRegions(REGION_LIST.map(r => r.id));
                              else setSelectedRegions([]);
                            }}
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">区域</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">圈选客群规模</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">占比</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {REGION_LIST.map((region) => {
                        const isSelected = selectedRegions.includes(region.id);
                        return (
                          <tr
                            key={region.id}
                            onClick={() => handleRegionToggle(region.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-3 py-2.5 text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleRegionToggle(region.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className={`px-3 py-2.5 font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                              {region.name}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{region.customerScale}户</td>
                            <td className="px-3 py-2.5 text-right text-gray-500">{region.percentage}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ====== Step2: 调度派发 ====== */
            <div className="space-y-5">
              {/* 第一行：业务场景 + 工单类型 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-500">业务场景</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-800 border">
                    {businessScenario}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-500">工单类型</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-800 border">
                    客群调度
                  </div>
                </div>
              </div>

              {/* 第二行：工单标题 + 要求完成时间 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    <span className="text-red-500 mr-0.5">*</span>工单标题
                  </label>
                  <Input
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    placeholder="请输入工单标题"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    <span className="text-red-500 mr-0.5">*</span>要求完成时间
                  </label>
                  <Input
                    type="date"
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    placeholder="请选择"
                  />
                </div>
              </div>

              {/* 工单描述 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-0.5">*</span>工单描述
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请输入工单描述"
                  rows={3}
                />
              </div>

              {/* 触客策略 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-0.5">*</span>触客策略
                </label>
                <Textarea
                  value={engagementStrategy}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setEngagementStrategy(e.target.value);
                    }
                  }}
                  placeholder="请输入"
                  rows={3}
                />
                <div className="text-right text-xs text-gray-400">
                  {engagementStrategy.length} / 500
                </div>
              </div>

              {/* 圈选标签（只读） */}
              <div className="space-y-1.5">
                <label className="text-sm text-gray-500">圈选标签</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-800 border min-h-[38px]">
                  {selectedTags.length > 0
                    ? selectedTags.map(t => t.name).join('、')
                    : '圈选全部标签'}
                </div>
              </div>

              {/* 圈选区域（只读） */}
              <div className="space-y-1.5">
                <label className="text-sm text-gray-500">圈选区域</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-800 border min-h-[38px]">
                  {selectedRegionNames.length > 0
                    ? selectedRegionNames.join('、')
                    : '未选择区域'}
                </div>
              </div>

              {/* 重要级别 */}
              <div>
                <Label className="text-sm font-medium text-gray-900">重要级别</Label>
                <Select value={importantLevel || 'none'} onValueChange={(value) => {
                  const level = value === 'none' ? '' : value;
                  const mustEnable = level === '公司领导调度' || level === '公司部门调度';
                  setImportantLevel(level);
                  if (mustEnable) setPostEvaluation(true);
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
                <Select value={postEvaluation ? 'yes' : 'no'} onValueChange={(value) => {
                  const mustEnable = importantLevel === '公司领导调度' || importantLevel === '公司部门调度';
                  if (mustEnable && value === 'no') return;
                  setPostEvaluation(value === 'yes');
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">是</SelectItem>
                    <SelectItem value="no" disabled={importantLevel === '公司领导调度' || importantLevel === '公司部门调度'}>否</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 后评估周期（仅在选择"是"时显示，客群调度均为月指标） */}
              {postEvaluation && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-900">月指标后评估周期</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">1 个月指标</span>
                  </div>
                  <div className="flex gap-2">
                    <Select value="月" onValueChange={() => {}}>
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
                      value={postEvaluationCycle}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                          setPostEvaluationCycle(value);
                        }
                      }}
                      className="w-24"
                      placeholder="数值"
                    />
                    <span className="text-sm text-gray-500 self-center">个月后评估</span>
                  </div>
                </div>
              )}

              {/* 指标设置（目标值） */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-[#F9FAFB] px-4 py-3 border-b">
                  <span className="text-sm font-medium text-gray-900">指标设置</span>
                  <p className="text-xs text-gray-500 mt-0.5">为关联指标设置全疆级目标值</p>
                </div>
                <table className="w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">指标名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">目标值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">{indicatorName}</td>
                      <td className="px-4 py-3">
                        <Input
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          placeholder="请输入目标值"
                          className="h-9"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 派发系统 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-0.5">*</span>派发系统
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dispatchSystem"
                        checked={dispatchSystem === 'IOP'}
                        onChange={() => { setDispatchSystem('IOP'); setExecutionRole('地市集运'); }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">IOP</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dispatchSystem"
                        checked={dispatchSystem === '网格通'}
                        onChange={() => { setDispatchSystem('网格通'); setIopHandler(null); }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">网格通</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dispatchSystem"
                        checked={dispatchSystem === '剧本营销'}
                        onChange={() => { setDispatchSystem('剧本营销'); setIopHandler(null); setExecutionRole('地市集运'); }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">剧本营销</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      {dispatchSystem === '剧本营销'
                        ? '审批通过后需在待办工单中发起剧本营销，客群将自动带入IOP剧本营销页面'
                        : '派发后可在工作台跟踪已派发的调度工单'}
                    </span>
                  </div>
                </div>
              </div>

              {/* IOP时：建议执行渠道 + IOP处理人 */}
              {dispatchSystem === 'IOP' && (
                <>
                  {/* 建议执行渠道 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700"><span className="text-red-500 mr-0.5">*</span>建议执行渠道</label>
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
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500 mr-0.5">*</span>IOP处理人
                    </label>
                    {iopHandler ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700 font-medium">{iopHandler.name}</span>
                          <button
                            onClick={() => setIopHandler(null)}
                            className="p-0.5 hover:bg-blue-100 rounded"
                          >
                            <X className="w-3 h-3 text-blue-400" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowIopHandlerDialog(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <User className="w-4 h-4" />
                        + 选择人员
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* 执行角色（选网格通时显示） */}
              {dispatchSystem === '网格通' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    <span className="text-red-500 mr-0.5">*</span>执行角色
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="executionRole"
                        checked={executionRole === '地市集运'}
                        onChange={() => setExecutionRole('地市集运')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">地市集运</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="executionRole"
                        checked={executionRole === '网格经理'}
                        onChange={() => setExecutionRole('网格经理')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">网格经理</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 剧本营销：极简提示 */}
              {dispatchSystem === '剧本营销' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700">
                    审批通过后，系统将为发起人生成待办工单，发起人可在待办工单中点击"发起剧本营销"进入IOP剧本营销页面完成配置并提交执行。上游客群信息将自动带入剧本营销页面。
                  </div>
                </div>
              )}

              {/* 审批人 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-0.5">*</span>审批人
                </label>
                {approver ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">{approver.name}</span>
                      <span className="text-xs text-blue-500">{approver.department}</span>
                      <button
                        onClick={() => setApprover(null)}
                        className="p-0.5 hover:bg-blue-100 rounded"
                      >
                        <X className="w-3 h-3 text-blue-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApproverDialog(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <User className="w-4 h-4" />
                    + 选择人员
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ====== 底部操作栏 ====== */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white shrink-0">
          {step === 1 ? (
            <>
              <div className="text-sm text-gray-600">
                客群规模 <span className="font-semibold text-blue-600">{calculatedScale}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700">
                  下一步
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button variant="outline" onClick={handlePreviousStep}>
                上一步
              </Button>
              <Button onClick={handleDispatch} className="bg-blue-600 hover:bg-blue-700">
                派发
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* ====== 审批人选择弹窗 ====== */}
        {showApproverDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl w-[500px] p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">选择审批人</h3>
                <button onClick={() => setShowApproverDialog(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-2">
                {APPROVER_LIST.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      approver?.id === a.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{a.name}</div>
                        <div className="text-xs text-gray-500">{APPROVER_LIST.find(x => x.id === a.id)?.department} · {APPROVER_LIST.find(x => x.id === a.id)?.role}</div>
                      </div>
                    </div>
                    <Button
                      variant={approver?.id === a.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (approver?.id === a.id) {
                          setApprover(null);
                        } else {
                          setApprover({ id: a.id, name: a.name, department: a.department });
                        }
                        setShowApproverDialog(false);
                      }}
                    >
                      {approver?.id === a.id ? '已选' : '选择'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====== IOP处理人选择弹窗 ====== */}
        {showIopHandlerDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl w-[500px] p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">选择IOP处理人</h3>
                <button onClick={() => setShowIopHandlerDialog(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-2">
                {IOP_HANDLER_LIST.map((h) => (
                  <div
                    key={h.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      iopHandler?.id === h.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{h.name}</div>
                        <div className="text-xs text-gray-500">{h.department} · {h.role}</div>
                      </div>
                    </div>
                    <Button
                      variant={iopHandler?.id === h.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (iopHandler?.id === h.id) {
                          setIopHandler(null);
                        } else {
                          setIopHandler({ id: h.id, name: h.name });
                        }
                        setShowIopHandlerDialog(false);
                      }}
                    >
                      {iopHandler?.id === h.id ? '已选' : '选择'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerGroupDispatchDialog;
