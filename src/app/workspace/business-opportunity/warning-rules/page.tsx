'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertTriangle, Clock, Edit3, ChevronDown, ChevronRight, Plus, Trash2,
} from 'lucide-react';

// ==================== 统计维度选项（省/市/区/网格/执行人员，不深入到具体省名市名） ====================

const statDimensionOptions = [
  { value: '省', label: '省' },
  { value: '市', label: '市' },
  { value: '区', label: '区' },
  { value: '网格', label: '网格' },
  { value: '执行人员', label: '执行人员' },
];

// ==================== 类型定义 ====================

interface ParamMeta {
  key: string;
  label: string;
  type: 'number' | 'select' | 'multiselect' | 'text';
  unit?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

/** 一条维度配置——预警类型下的独立规则实体 */
interface DimensionRule {
  id: string;
  warningTypeId: string;
  statDimension: string;     // 统计维度：省/市/区/网格/执行人员（单选）
  level: 'high' | 'medium' | 'low';
  params: Record<string, string>;
  duration: string;           // 持续时长（分钟）
  checkFrequency: string;     // 检查频率（分钟）
  alertMethods: string[];
  receivers: string;
  enabled: boolean;
  updatedAt: string;
}

/** 预警类型（固定6种） */
interface WarningType {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  paramMeta: ParamMeta[];
  rules: DimensionRule[];
}

// ==================== 辅助函数 ====================

let ruleIdCounter = 100;
function genRuleId() {
  ruleIdCounter += 1;
  return `DR${String(ruleIdCounter).padStart(4, '0')}`;
}

function getParamsSummary(typeId: string, params: Record<string, string>): string {
  switch (typeId) {
    case 'WT001':
      return `${params.status || '-'}商机 > ${params.threshold || '-'}条`;
    case 'WT002':
      return `超过${params.overtimeHours || '-'}h未转化${params.scope && params.scope !== '全部类型' ? `（${params.scope}）` : ''}`;
    default:
      return '';
  }
}

// ==================== 预警类型模板 ====================

const levelConfig: Record<string, { label: string; variant: string }> = {
  high: { label: '高', variant: 'bg-red-100 text-red-600' },
  medium: { label: '中', variant: 'bg-orange-100 text-orange-600' },
  low: { label: '低', variant: 'bg-green-100 text-green-600' },
};

const alertMethodOptions = ['首页消息', '短信'];

function now() {
  return new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');
}

const initialWarningTypes: WarningType[] = [
  {
    id: 'WT001', code: 'PENDING_OVERFLOW', name: '待处理商机积压',
    description: '监控待处理/处理中商机数量，当积压超过阈值并持续一定时长时触发预警',
    icon: Clock, iconColor: 'text-orange-500',
    paramMeta: [
      { key: 'status', label: '监控状态', type: 'multiselect', options: [{ value: '待处理', label: '待处理' }, { value: '处理中', label: '处理中' }, { value: '待派发', label: '待派发' }, { value: '待抢单', label: '待抢单' }] },
      { key: 'threshold', label: '数量阈值', type: 'number', unit: '条', placeholder: '如 5000' },
    ],
    rules: [
      { id: 'DR0001', warningTypeId: 'WT001', statDimension: '市', level: 'high', params: { status: '待处理,处理中', threshold: '5000' }, duration: '10', checkFrequency: '5', alertMethods: ['首页消息', '短信'], receivers: '运营主管、区域经理', enabled: true, updatedAt: '2024-01-15 10:30' },
      { id: 'DR0002', warningTypeId: 'WT001', statDimension: '区', level: 'medium', params: { status: '待处理', threshold: '3000' }, duration: '15', checkFrequency: '10', alertMethods: ['首页消息'], receivers: '区域经理', enabled: true, updatedAt: '2024-01-14 16:20' },
      { id: 'DR0003', warningTypeId: 'WT001', statDimension: '执行人员', level: 'medium', params: { status: '待处理,处理中', threshold: '2000' }, duration: '20', checkFrequency: '10', alertMethods: ['首页消息'], receivers: '运营组长', enabled: false, updatedAt: '2024-01-13 09:15' },
    ],
  },
  {
    id: 'WT002', code: 'OVERTIME', name: '商机逾期',
    description: '监控处理中商机，当超过指定时长未转化时标记为逾期并触发预警',
    icon: AlertTriangle, iconColor: 'text-red-500',
    paramMeta: [
      { key: 'overtimeHours', label: '逾期时长', type: 'number', unit: '小时', placeholder: '如 24' },
      { key: 'scope', label: '商机类型范围', type: 'select', options: [{ value: '全部类型', label: '全部类型' }, { value: '单客户商机', label: '单客户商机' }, { value: '客群商机', label: '客群商机' }] },
    ],
    rules: [
      { id: 'DR0004', warningTypeId: 'WT002', statDimension: '省', level: 'high', params: { overtimeHours: '24', scope: '全部类型' }, duration: '60', checkFrequency: '30', alertMethods: ['首页消息', '短信'], receivers: '运营主管', enabled: true, updatedAt: '2024-01-12 14:00' },
      { id: 'DR0008', warningTypeId: 'WT002', statDimension: '网格', level: 'medium', params: { overtimeHours: '48', scope: '单客户商机' }, duration: '120', checkFrequency: '60', alertMethods: ['首页消息'], receivers: '地市经理', enabled: true, updatedAt: '2024-01-12 15:00' },
    ],
  },
];

// ==================== 主组件 ====================

export default function WarningRulesPage() {
  const [warningTypes, setWarningTypes] = useState<WarningType[]>(initialWarningTypes);

  // 展开的预警类型
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['WT001']));

  // 筛选
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 编辑维度规则弹窗
  const [editOpen, setEditOpen] = useState(false);
  const [editWarningType, setEditWarningType] = useState<WarningType | null>(null);
  const [editRuleId, setEditRuleId] = useState<string | null>(null); // null=新增
  const [editStatDim, setEditStatDim] = useState<string>('');
  const [editLevel, setEditLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [editParams, setEditParams] = useState<Record<string, string>>({});
  const [editDuration, setEditDuration] = useState('');
  const [editCheckFrequency, setEditCheckFrequency] = useState('');
  const [editAlertMethods, setEditAlertMethods] = useState<string[]>([]);
  const [editReceivers, setEditReceivers] = useState('');
  const [editEnabled, setEditEnabled] = useState(true);

  // 停用确认
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; wtId: string; ruleId: string; ruleName: string }>({ open: false, wtId: '', ruleId: '', ruleName: '' });

  // 删除确认
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; wtId: string; ruleId: string }>({ open: false, wtId: '', ruleId: '' });

  // ---- 筛选 ----
  const filteredTypes = warningTypes.filter(wt => {
    if (filterType !== 'all' && wt.id !== filterType) return false;
    return true;
  }).map(wt => {
    const filteredRules = wt.rules.filter(r => {
      if (filterLevel !== 'all' && r.level !== filterLevel) return false;
      if (filterStatus === 'enabled' && !r.enabled) return false;
      if (filterStatus === 'disabled' && r.enabled) return false;
      return true;
    });
    return { ...wt, rules: filteredRules };
  });

  const handleReset = () => {
    setFilterType('all');
    setFilterLevel('all');
    setFilterStatus('all');
  };

  // ---- 展开/收起预警类型 ----
  const toggleType = (id: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ---- 打开新增维度规则 ----
  const openAddRule = (wt: WarningType) => {
    setEditWarningType(wt);
    setEditRuleId(null);
    setEditStatDim('');
    setEditLevel('medium');
    const defaultParams: Record<string, string> = {};
    wt.paramMeta.forEach(m => { defaultParams[m.key] = ''; });
    setEditParams(defaultParams);
    setEditDuration('');
    setEditCheckFrequency('');
    setEditAlertMethods(['首页消息']);
    setEditReceivers('');
    setEditEnabled(true);
    setEditOpen(true);
  };

  // ---- 打开编辑维度规则 ----
  const openEditRule = (wt: WarningType, rule: DimensionRule) => {
    setEditWarningType(wt);
    setEditRuleId(rule.id);
    setEditStatDim(rule.statDimension);
    setEditLevel(rule.level);
    setEditParams({ ...rule.params });
    setEditDuration(rule.duration);
    setEditCheckFrequency(rule.checkFrequency);
    setEditAlertMethods([...rule.alertMethods]);
    setEditReceivers(rule.receivers);
    setEditEnabled(rule.enabled);
    setEditOpen(true);
  };

  // ---- 保存维度规则 ----
  const handleSaveRule = () => {
    if (!editWarningType) return;
    const wtId = editWarningType.id;
    setWarningTypes(prev => prev.map(wt => {
      if (wt.id !== wtId) return wt;
      if (editRuleId) {
        return { ...wt, rules: wt.rules.map(r => r.id === editRuleId ? {
          ...r,
          statDimension: editStatDim,
          level: editLevel,
          params: { ...editParams },
          duration: editDuration,
          checkFrequency: editCheckFrequency,
          alertMethods: [...editAlertMethods],
          receivers: editReceivers,
          enabled: editEnabled,
          updatedAt: now(),
        } : r) };
      } else {
        const newRule: DimensionRule = {
          id: genRuleId(),
          warningTypeId: wtId,
          statDimension: editStatDim,
          level: editLevel,
          params: { ...editParams },
          duration: editDuration,
          checkFrequency: editCheckFrequency,
          alertMethods: [...editAlertMethods],
          receivers: editReceivers,
          enabled: editEnabled,
          updatedAt: now(),
        };
        return { ...wt, rules: [...wt.rules, newRule] };
      }
    }));
    setEditOpen(false);
  };

  // ---- 启停维度规则 ----
  const handleToggleRule = (wtId: string, ruleId: string, enabled: boolean) => {
    setWarningTypes(prev => prev.map(wt => {
      if (wt.id !== wtId) return wt;
      return { ...wt, rules: wt.rules.map(r => r.id === ruleId ? { ...r, enabled } : r) };
    }));
    setConfirmDialog({ open: false, wtId: '', ruleId: '', ruleName: '' });
  };

  // ---- 删除维度规则 ----
  const handleDeleteRule = (wtId: string, ruleId: string) => {
    setWarningTypes(prev => prev.map(wt => {
      if (wt.id !== wtId) return wt;
      return { ...wt, rules: wt.rules.filter(r => r.id !== ruleId) };
    }));
    setDeleteDialog({ open: false, wtId: '', ruleId: '' });
  };

  // ---- 统计 ----
  const totalRules = warningTypes.reduce((s, wt) => s + wt.rules.length, 0);
  const enabledRules = warningTypes.reduce((s, wt) => s + wt.rules.filter(r => r.enabled).length, 0);

  return (
    <div className="p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">商机预警规则配置</h1>
        <div className="text-sm text-gray-500">
          共 <span className="font-medium text-gray-700">{totalRules}</span> 条维度规则，
          <span className="font-medium text-green-600">{enabledRules}</span> 条已启用
        </div>
      </div>

      {/* 筛选 */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">预警类型：</span>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {warningTypes.map(wt => <SelectItem key={wt.id} value={wt.id}>{wt.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">预警级别：</span>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[100px]"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">状态：</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[100px]"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="enabled">启用</SelectItem>
                <SelectItem value="disabled">停用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleReset}>重置</Button>
        </div>
      </Card>

      {/* 预警类型列表 */}
      <div className="flex flex-col gap-3">
        {filteredTypes.map(wt => {
          const Icon = wt.icon;
          const isExpanded = expandedTypes.has(wt.id);
          const ruleCount = wt.rules.length;
          const enabledCount = wt.rules.filter(r => r.enabled).length;

          return (
            <Card key={wt.id} className="overflow-hidden">
              {/* 预警类型标题行 */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
                onClick={() => toggleType(wt.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-orange-50`}>
                    <Icon className={`w-[18px] h-[18px] ${wt.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-[15px]">{wt.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{wt.code}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{wt.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">
                      已配置 <span className="font-medium text-gray-700">{ruleCount}</span> 条
                    </span>
                    {ruleCount > 0 && (
                      <span className="text-green-500">{enabledCount} 启用</span>
                    )}
                    {ruleCount > enabledCount && enabledCount < ruleCount && (
                      <span className="text-gray-400">{ruleCount - enabledCount} 停用</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openAddRule(wt); }}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    添加维度配置
                  </Button>
                </div>
              </div>

              {/* 展开的维度规则列表 */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {ruleCount === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      暂无维度配置，点击上方"添加维度配置"创建规则
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80 text-gray-500 text-xs">
                            <th className="px-4 py-2.5 text-left font-medium">统计维度</th>
                            <th className="px-4 py-2.5 text-left font-medium">预警级别</th>
                            <th className="px-4 py-2.5 text-left font-medium">阈值参数</th>
                            <th className="px-4 py-2.5 text-left font-medium">持续时长</th>
                            <th className="px-4 py-2.5 text-left font-medium">检查频率</th>
                            <th className="px-4 py-2.5 text-left font-medium">告警方式</th>
                            <th className="px-4 py-2.5 text-left font-medium">接收人</th>
                            <th className="px-4 py-2.5 text-center font-medium">状态</th>
                            <th className="px-4 py-2.5 text-center font-medium">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wt.rules.map(rule => (
                            <tr key={rule.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${!rule.enabled ? 'opacity-50' : ''}`}>
                              {/* 统计维度 */}
                              <td className="px-4 py-3">
                                {rule.statDimension ? (
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600 border border-blue-100 font-medium">
                                    {rule.statDimension}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">未设置</span>
                                )}
                              </td>
                              {/* 预警级别 */}
                              <td className="px-4 py-3">
                                <Badge className={levelConfig[rule.level].variant}>{levelConfig[rule.level].label}</Badge>
                              </td>
                              {/* 阈值参数 */}
                              <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                                <span className="truncate block" title={getParamsSummary(wt.id, rule.params)}>
                                  {getParamsSummary(wt.id, rule.params)}
                                </span>
                              </td>
                              {/* 持续时长 */}
                              <td className="px-4 py-3 text-gray-600">{rule.duration ? `${rule.duration}分钟` : '-'}</td>
                              {/* 检查频率 */}
                              <td className="px-4 py-3 text-gray-600">{rule.checkFrequency ? `${rule.checkFrequency}分钟` : '-'}</td>
                              {/* 告警方式 */}
                              <td className="px-4 py-3 text-gray-500 text-xs">{rule.alertMethods.join('、')}</td>
                              {/* 接收人 */}
                              <td className="px-4 py-3 text-gray-500 text-xs">{rule.receivers || '-'}</td>
                              {/* 状态 */}
                              <td className="px-4 py-3 text-center">
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={(checked) => {
                                    if (!checked) {
                                      setConfirmDialog({ open: true, wtId: wt.id, ruleId: rule.id, ruleName: `${wt.name} - ${rule.statDimension}` });
                                    } else {
                                      handleToggleRule(wt.id, rule.id, true);
                                    }
                                  }}
                                />
                              </td>
                              {/* 操作 */}
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditRule(wt, rule)}>
                                    <Edit3 className="w-3 h-3 mr-1" />编辑
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-400 hover:text-red-600" onClick={() => setDeleteDialog({ open: true, wtId: wt.id, ruleId: rule.id })}>
                                    <Trash2 className="w-3 h-3 mr-1" />删除
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <Card className="p-12 text-center text-gray-400">暂无匹配的预警规则</Card>
      )}

      {/* ==================== 新增/编辑维度规则弹窗 ==================== */}
      {editOpen && editWarningType && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <editWarningType.icon className={`w-5 h-5 ${editWarningType.iconColor}`} />
                {editRuleId ? '编辑' : '新增'}维度配置 - {editWarningType.name}
              </DialogTitle>
              <DialogDescription>
                {editWarningType.description}
                {!editRuleId && ' · 同一预警类型下可按不同维度配置独立的规则'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 py-2">
              {/* ---- 统计维度（省/市/区/网格/执行人员，单选） ---- */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">统计维度</div>
                <div className="text-xs text-gray-400 mb-2">选择该预警规则的统计粒度，同一预警类型下可添加多条不同维度的规则</div>
                <div className="flex flex-wrap gap-2">
                  {statDimensionOptions.map(opt => {
                    const isSel = editStatDim === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setEditStatDim(opt.value)}
                        className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                          isSel
                            ? 'border-[#0085D0] bg-blue-50 text-[#0085D0] font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {editStatDim && (
                  <div className="mt-2 text-xs text-gray-400">
                    已选择：{editStatDim}
                  </div>
                )}
              </div>

              <div className="border-t" />

              {/* ---- 预警级别 ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">预警级别</label>
                <div className="flex gap-3">
                  {(['high', 'medium', 'low'] as const).map(lv => (
                    <button key={lv} onClick={() => setEditLevel(lv)} className={`px-4 py-2 rounded-md text-sm border transition-colors ${editLevel === lv ? 'border-[#0085D0] bg-blue-50 text-[#0085D0] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {levelConfig[lv].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---- 阈值参数（按预警类型不同） ---- */}
              {editWarningType.paramMeta.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">阈值参数</div>
                  <div className="flex flex-col gap-4">
                    {editWarningType.paramMeta.map(meta => (
                      <div key={meta.key} className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-28 shrink-0 text-right">{meta.label}</label>
                        {meta.type === 'number' && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input type="number" value={editParams[meta.key] || ''} onChange={e => setEditParams(prev => ({ ...prev, [meta.key]: e.target.value }))} placeholder={meta.placeholder} className="flex-1" />
                            {meta.unit && <span className="text-sm text-gray-400 shrink-0">{meta.unit}</span>}
                          </div>
                        )}
                        {meta.type === 'select' && (
                          <Select value={editParams[meta.key] || ''} onValueChange={v => setEditParams(prev => ({ ...prev, [meta.key]: v }))}>
                            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {meta.options?.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        {meta.type === 'multiselect' && (
                          <div className="flex flex-wrap gap-2 flex-1">
                            {meta.options?.map(opt => {
                              const selected = (editParams[meta.key] || '').split(',').filter(Boolean);
                              const isSel = selected.includes(opt.value);
                              return (
                                <button key={opt.value} onClick={() => {
                                  const cur = (editParams[meta.key] || '').split(',').filter(Boolean);
                                  const next = isSel ? cur.filter(v => v !== opt.value) : [...cur, opt.value];
                                  setEditParams(prev => ({ ...prev, [meta.key]: next.join(',') }));
                                }} className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${isSel ? 'border-[#0085D0] bg-blue-50 text-[#0085D0]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {meta.type === 'text' && (
                          <Input value={editParams[meta.key] || ''} onChange={e => setEditParams(prev => ({ ...prev, [meta.key]: e.target.value }))} placeholder={meta.placeholder} className="flex-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t" />

              {/* ---- 持续时长 / 检查频率 ---- */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">持续时长</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="如 10" className="flex-1" />
                    <span className="text-sm text-gray-400 shrink-0">分钟</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">超过阈值持续此时长后触发预警</div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">检查频率</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={editCheckFrequency} onChange={e => setEditCheckFrequency(e.target.value)} placeholder="如 5" className="flex-1" />
                    <span className="text-sm text-gray-400 shrink-0">分钟</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">系统每隔此时长检查一次</div>
                </div>
              </div>

              <div className="border-t" />

              {/* ---- 告警方式 ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">告警方式</label>
                <div className="flex flex-wrap gap-2">
                  {alertMethodOptions.map(method => {
                    const isSel = editAlertMethods.includes(method);
                    return (
                      <button key={method} onClick={() => setEditAlertMethods(prev => isSel ? prev.filter(m => m !== method) : [...prev, method])} className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${isSel ? 'border-[#0085D0] bg-blue-50 text-[#0085D0]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ---- 接收人 ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">接收人</label>
                <Input value={editReceivers} onChange={e => setEditReceivers(e.target.value)} placeholder="请输入接收人，多人用顿号分隔" />
              </div>

              {/* ---- 启用状态 ---- */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-700">启用状态</div>
                  <div className="text-xs text-gray-400">关闭后该规则将不再触发</div>
                </div>
                <Switch checked={editEnabled} onCheckedChange={setEditEnabled} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
              <Button className="bg-[#0085D0] hover:bg-[#0070B8]" onClick={handleSaveRule}>保存配置</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ==================== 停用确认弹窗 ==================== */}
      <Dialog open={confirmDialog.open} onOpenChange={open => !open && setConfirmDialog({ open: false, wtId: '', ruleId: '', ruleName: '' })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              确认停用规则
            </DialogTitle>
            <DialogDescription>
              停用「{confirmDialog.ruleName}」后，该规则将不再触发新预警。已有预警不受影响。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, wtId: '', ruleId: '', ruleName: '' })}>取消</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => handleToggleRule(confirmDialog.wtId, confirmDialog.ruleId, false)}>确认停用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== 删除确认弹窗 ==================== */}
      <Dialog open={deleteDialog.open} onOpenChange={open => !open && setDeleteDialog({ open: false, wtId: '', ruleId: '' })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              确认删除规则
            </DialogTitle>
            <DialogDescription>
              删除后该维度配置将不可恢复，确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, wtId: '', ruleId: '' })}>取消</Button>
            <Button className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteRule(deleteDialog.wtId, deleteDialog.ruleId)}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
