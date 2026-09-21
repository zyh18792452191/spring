'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Edit, Eye, Trash2, Search, RotateCcw, ChevronLeft, Upload, Download,
  X, AlertCircle, Layers, ChevronDown, ChevronRight,
} from 'lucide-react';

// ==================== 类型定义 ====================

interface CleaningRule {
  id: string;
  name: string;
  description: string;
  configuredBusinesses: string[];
  creator: string;
  createdAt: string;
  status: '草稿' | '生效';
  // 启用的规则类型
  enabledRules: string[];
  // 符合办理条件
  conditions: RuleCondition[];
  // 重复商机（两个子规则可独立启用）
  duplicateHandling: { 
    enableShortTerm: boolean;  // 启用短时效重复商机处理
    hours: number;             // 小时数
    enableCrossPeriod: boolean; // 启用跨时段重复商机处理
    compareDays: number;       // 天数
  };
  // 已办理本产品
  purchasedProduct: { file?: string };
  // 存在互斥产品
  mutexProduct: { file?: string };
  // 降收降档
  downgradeProduct: { file?: string };
  // 已办理升档产品
  upgradeProduct: { file?: string };
  // 黑名单
  blacklist: BlacklistEntry[];
  // 关联商机业务
  businessTypes: BusinessTypeRef[];
}

interface RuleCondition {
  id: string;
  tagName: string;
  operator: string;
  value: string;
}

interface BlacklistEntry {
  id: string;
  phone: string;
  reason: string;
  addedAt: string;
}

interface BusinessTypeRef {
  id: string;
  businessId: string;
  businessName: string;
  source: string;
  categoryPath: string;
  customerCategory: string;
}

// ==================== 规则类型定义 ====================

const RULE_TYPES = [
  { id: 'condition', name: '符合办理条件' },
  { id: 'duplicate', name: '重复商机' },
  { id: 'purchased', name: '已办理本产品' },
  { id: 'mutex', name: '存在互斥产品' },
  { id: 'downgrade', name: '降收降档' },
  { id: 'upgrade', name: '已办理升档产品' },
  { id: 'blacklist', name: '黑名单' },
];

// ==================== 商机业务类型和标签选项 ====================

interface BusinessTypeOption {
  id: string;
  name: string;
  source: string;
  category: string;  // 商机分类（完整三级分类）
  categoryPath: string;  // 完整的三级分类路径，如 "风险预警类 > 流量预警 > 流量达量预警"
  customerCategory: string;  // 客户类别
  scenario: string;  // 运营场景
  status: 'active' | 'inactive';  // 状态
  createTime: string;
  creator: string;
}

const businessTypeOptions: BusinessTypeOption[] = [
  { id: 'BT001', name: '流量达量预警-全球通客户-CRM系统', source: 'CRM系统', category: '风险预警类', categoryPath: '风险预警类/流量预警/流量达量预警', customerCategory: '全球通客户', scenario: '流量运营', status: 'active', createTime: '2024-01-15 10:30', creator: '张三' },
  { id: 'BT002', name: '特定内容高频访问-全球通客户-营销活动平台', source: '营销活动平台', category: '风险预警类', categoryPath: '风险预警类/流量预警/特定内容高频访问', customerCategory: '全球通客户', scenario: '流量运营', status: 'active', createTime: '2024-01-15 09:45', creator: '李四' },
  { id: 'BT003', name: '高价值套餐推荐-中高端客户-外呼系统', source: '外呼系统', category: '价值提升类', categoryPath: '价值提升类/套餐升级/高价值套餐推荐', customerCategory: '中高端客户', scenario: '中高端保有', status: 'active', createTime: '2024-01-15 08:20', creator: '王五' },
  { id: 'BT004', name: '流量包智能推荐-中高端客户-线上渠道', source: '线上渠道', category: '价值提升类', categoryPath: '价值提升类/套餐升级/流量包智能推荐', customerCategory: '中高端客户', scenario: '离网维系', status: 'inactive', createTime: '2024-01-14 18:00', creator: '赵六' },
  { id: 'BT005', name: '合约到期提醒-潜力客户-线下营业厅', source: '线下营业厅', category: '生命周期类', categoryPath: '生命周期类/老客户/合约到期提醒', customerCategory: '潜力客户', scenario: '家庭运营', status: 'active', createTime: '2024-01-15 10:00', creator: '钱七' },
  { id: 'BT006', name: '新客户关怀-普通客户-微信小程序', source: '微信小程序', category: '生命周期类', categoryPath: '生命周期类/新客户/新客户关怀', customerCategory: '普通客户', scenario: '校园运营', status: 'active', createTime: '2024-01-13 14:20', creator: '孙八' },
];

const tagOptions = [
  '已派单至挽留专席',
  '主卡套餐',
  '主卡业务',
  '绑定副卡张数',
  '宽带装机在途客户',
  '前三个月实际出账平均值',
  '用户状态',
  '套餐月租',
  '在网时长',
  'ARPU值',
  '流量使用率',
];

const operatorOptions = ['=', '!=', '>', '>=', '<', '<=', '包含', '不包含'];

// ==================== 辅助函数 ====================

let ruleIdCounter = 100;
function genRuleId() {
  ruleIdCounter += 1;
  return `CR${String(ruleIdCounter).padStart(4, '0')}`;
}

function now() {
  return new Date().toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }).replace(/\//g, '-');
}

// ==================== 初始数据 ====================

const initialRules: CleaningRule[] = [
  {
    id: 'CR0001',
    name: '测试清洗规则',
    description: '测试用的清洗规则配置',
    configuredBusinesses: ['流量达量预警-全球通客户-CRM系统', '特定内容高频访问-全球通客户-CRM系统'],
    creator: 'admin01',
    createdAt: '2026-05-08 10:43:36',
    status: '草稿',
    enabledRules: ['condition', 'duplicate', 'blacklist'],
    conditions: [
      { id: 'c1', tagName: '主卡套餐', operator: '=', value: '199元套餐' },
    ],
    duplicateHandling: { enableShortTerm: true, hours: 1, enableCrossPeriod: true, compareDays: 7 },
    purchasedProduct: {},
    mutexProduct: {},
    downgradeProduct: {},
    upgradeProduct: {},
    blacklist: [
      { id: 'b1', phone: '138****5521', reason: '恶意投诉', addedAt: '2024-10-15' },
      { id: 'b2', phone: '159****8834', reason: '频繁退单', addedAt: '2024-10-18' },
    ],
    businessTypes: [
      { id: 'bt1', businessId: 'BT001', businessName: '流量达量预警-全球通客户-CRM系统', source: 'CRM系统', categoryPath: '风险预警类/流量达量预警', customerCategory: '全球通客户' },
    ],
  },
  {
    id: 'CR0002',
    name: '测试-ch',
    description: '',
    configuredBusinesses: ['商机业务名称02'],
    creator: 'admin01',
    createdAt: '2026-04-16 14:54:01',
    status: '生效',
    enabledRules: ['duplicate', 'mutex'],
    conditions: [],
    duplicateHandling: { enableShortTerm: true, hours: 2, enableCrossPeriod: true, compareDays: 14 },
    purchasedProduct: {},
    mutexProduct: { file: '互斥产品.xlsx' },
    downgradeProduct: {},
    upgradeProduct: {},
    blacklist: [],
    businessTypes: [
      { id: 'bt2', businessId: 'BT002', businessName: '商机业务名称02', source: '线上渠道', categoryPath: '价值提升类/套餐升档', customerCategory: '中高端客户' },
    ],
  },
];

// ==================== 主组件 ====================

export default function CleaningRulesPage() {
  const [rules, setRules] = useState<CleaningRule[]>(initialRules);
  
  // 筛选
  const [filterName, setFilterName] = useState('');
  const [filterBusiness, setFilterBusiness] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 详情页
  const [showDetail, setShowDetail] = useState(false);
  const [detailMode, setDetailMode] = useState<'view' | 'edit' | 'add'>('view');
  const [currentRule, setCurrentRule] = useState<CleaningRule | null>(null);
  
  // 规则配置弹窗
  const [ruleConfigOpen, setRuleConfigOpen] = useState(false);
  const [tempEnabledRules, setTempEnabledRules] = useState<string[]>([]);
  
  // 展开的规则配置
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  
  // 黑名单弹窗
  const [blacklistOpen, setBlacklistOpen] = useState(false);
  
  // 商机业务选择弹窗
  const [businessSelectOpen, setBusinessSelectOpen] = useState(false);
  const [businessSearchText, setBusinessSearchText] = useState('');
  const [tempSelectedBusinesses, setTempSelectedBusinesses] = useState<BusinessTypeOption[]>([]);
  const [businessListPage, setBusinessListPage] = useState(1);
  const [businessListPageSize, setBusinessListPageSize] = useState(10);

  // 删除确认
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ruleId: string; ruleName: string }>({ 
    open: false, ruleId: '', ruleName: '' 
  });

  // ---- 筛选逻辑 ----
  const filteredRules = rules.filter(rule => {
    if (filterName && !rule.name.includes(filterName)) return false;
    if (filterBusiness && !rule.configuredBusinesses.some(b => b.includes(filterBusiness))) return false;
    if (filterStatus && rule.status !== filterStatus) return false;
    return true;
  });
  
  const totalPages = Math.ceil(filteredRules.length / pageSize);
  const paginatedRules = filteredRules.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const handleReset = () => {
    setFilterName('');
    setFilterBusiness('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  // ---- 新增 ----
  const openAdd = () => {
    setCurrentRule({
      id: genRuleId(),
      name: '',
      description: '',
      configuredBusinesses: [],
      creator: 'admin01',
      createdAt: now(),
      status: '草稿',
      enabledRules: [],
      conditions: [],
      duplicateHandling: { enableShortTerm: true, hours: 1, enableCrossPeriod: true, compareDays: 7 },
      purchasedProduct: {},
      mutexProduct: {},
      downgradeProduct: {},
      upgradeProduct: {},
      blacklist: [],
      businessTypes: [],
    });
    setDetailMode('add');
    setShowDetail(true);
  };

  // ---- 编辑 ----
  const openEdit = (rule: CleaningRule) => {
    setCurrentRule({ ...rule });
    setDetailMode('edit');
    setShowDetail(true);
  };

  // ---- 查看 ----
  const openView = (rule: CleaningRule) => {
    setCurrentRule({ ...rule });
    setDetailMode('view');
    setShowDetail(true);
  };

  // ---- 生效/失效 ----
  const toggleStatus = (rule: CleaningRule) => {
    setRules(prev => prev.map(r => 
      r.id === rule.id 
        ? { ...r, status: r.status === '草稿' ? '生效' : '草稿' } 
        : r
    ));
  };

  // ---- 删除 ----
  const handleDelete = () => {
    setRules(prev => prev.filter(r => r.id !== deleteDialog.ruleId));
    setDeleteDialog({ open: false, ruleId: '', ruleName: '' });
  };

  // ---- 保存 ----
  const handleSave = () => {
    if (!currentRule || !currentRule.name.trim()) {
      alert('请填写清洗规则名称');
      return;
    }
    
    const businessNames = currentRule.businessTypes.map(bt => bt.businessName);
    
    if (detailMode === 'add') {
      setRules(prev => [...prev, { ...currentRule, configuredBusinesses: businessNames }]);
    } else {
      setRules(prev => prev.map(r => 
        r.id === currentRule.id ? { ...currentRule, configuredBusinesses: businessNames } : r
      ));
    }
    setShowDetail(false);
  };

  // ---- 打开规则配置弹窗 ----
  const openRuleConfig = () => {
    if (!currentRule) return;
    setTempEnabledRules([...currentRule.enabledRules]);
    setRuleConfigOpen(true);
  };

  // ---- 保存规则配置 ----
  const saveRuleConfig = () => {
    if (!currentRule) return;
    setCurrentRule({ ...currentRule, enabledRules: [...tempEnabledRules] });
    setRuleConfigOpen(false);
  };

  // ---- 切换规则启用 ----
  const toggleRuleEnabled = (ruleId: string) => {
    setTempEnabledRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(r => r !== ruleId) 
        : [...prev, ruleId]
    );
  };

  // ---- 全选/取消全选规则 ----
  const toggleAllRules = (checked: boolean) => {
    if (checked) {
      setTempEnabledRules(RULE_TYPES.map(r => r.id));
    } else {
      setTempEnabledRules([]);
    }
  };

  // ---- 展开/收起规则配置 ----
  const toggleExpandRule = (ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  // ---- 删除已启用的清洗规则 ----
  const removeEnabledRule = (ruleId: string) => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      enabledRules: currentRule.enabledRules.filter(r => r !== ruleId),
    });
    // 收起已删除规则的展开状态
    setExpandedRules(prev => {
      const next = new Set(prev);
      next.delete(ruleId);
      return next;
    });
  };

  // ---- 添加条件 ----
  const addCondition = () => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      conditions: [
        ...currentRule.conditions,
        { id: `c${Date.now()}`, tagName: '', operator: '=', value: '' }
      ]
    });
  };

  const removeCondition = (id: string) => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      conditions: currentRule.conditions.filter(c => c.id !== id)
    });
  };

  const updateCondition = (id: string, field: 'tagName' | 'operator' | 'value', value: string) => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      conditions: currentRule.conditions.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    });
  };

  // ---- 商机业务选择弹窗 ----
  const openBusinessSelect = () => {
    if (!currentRule) return;
    // 初始化已选商机业务
    const selectedIds = currentRule.businessTypes.map(bt => bt.businessId);
    const selected = businessTypeOptions.filter(opt => selectedIds.includes(opt.id));
    setTempSelectedBusinesses(selected);
    setBusinessSearchText('');
    setBusinessListPage(1);
    setBusinessSelectOpen(true);
  };
  
  // 从已选列表移除
  const removeFromTempSelected = (id: string) => {
    setTempSelectedBusinesses(prev => prev.filter(bt => bt.id !== id));
  };
  
  // 添加到已选列表
  const addToTempSelected = (item: BusinessTypeOption) => {
    if (!tempSelectedBusinesses.find(bt => bt.id === item.id)) {
      setTempSelectedBusinesses(prev => [...prev, item]);
    }
  };
  
  // 确认选择
  const confirmBusinessSelect = () => {
    if (!currentRule) return;
    const newBusinessTypes: BusinessTypeRef[] = tempSelectedBusinesses.map(bt => ({
      id: `bt${Date.now()}_${bt.id}`,
      businessId: bt.id,
      businessName: bt.name,
      source: bt.source,
      categoryPath: bt.categoryPath,
      customerCategory: bt.customerCategory,
    }));
    setCurrentRule({ ...currentRule, businessTypes: newBusinessTypes });
    setBusinessSelectOpen(false);
  };
  
  // 筛选商机业务列表
  const filteredBusinessOptions = businessTypeOptions.filter(opt => 
    opt.id.toLowerCase().includes(businessSearchText.toLowerCase()) ||
    opt.name.toLowerCase().includes(businessSearchText.toLowerCase())
  );
  
  // 分页后的商机业务列表
  const businessTotalPages = Math.ceil(filteredBusinessOptions.length / businessListPageSize);
  const paginatedBusinessOptions = filteredBusinessOptions.slice(
    (businessListPage - 1) * businessListPageSize, 
    businessListPage * businessListPageSize
  );

  // ---- 添加商机业务 ----
  const addBusinessType = () => {
    if (!currentRule) return;
    const newBt: BusinessTypeRef = {
      id: `bt${Date.now()}`,
      businessId: '',
      businessName: '',
      source: '',
      categoryPath: '',
      customerCategory: '',
    };
    setCurrentRule({
      ...currentRule,
      businessTypes: [...currentRule.businessTypes, newBt]
    });
  };

  const removeBusinessType = (id: string) => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      businessTypes: currentRule.businessTypes.filter(bt => bt.id !== id)
    });
  };

  const updateBusinessType = (id: string, businessId: string) => {
    if (!currentRule) return;
    const selected = businessTypeOptions.find(bt => bt.id === businessId);
    if (!selected) return;
    
    setCurrentRule({
      ...currentRule,
      businessTypes: currentRule.businessTypes.map(bt =>
        bt.id === id
          ? { ...bt, businessId: selected.id, businessName: selected.name, source: selected.source, categoryPath: selected.categoryPath, customerCategory: selected.customerCategory }
          : bt
      )
    });
  };

  // ---- 黑名单管理 ----
  const addBlacklistEntry = () => {
    if (!currentRule) return;
    const newEntry: BlacklistEntry = {
      id: `bl${Date.now()}`,
      phone: '',
      reason: '',
      addedAt: now().split(' ')[0],
    };
    setCurrentRule({
      ...currentRule,
      blacklist: [...currentRule.blacklist, newEntry]
    });
  };

  const removeBlacklistEntry = (id: string) => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      blacklist: currentRule.blacklist.filter(b => b.id !== id)
    });
  };

  const updateBlacklistEntry = (id: string, field: 'phone' | 'reason', value: string) => {
    if (!currentRule) return;
    setCurrentRule({
      ...currentRule,
      blacklist: currentRule.blacklist.map(b => 
        b.id === id ? { ...b, [field]: value } : b
      )
    });
  };

  // ==================== 渲染 ====================

  if (showDetail && currentRule) {
    return (
      <div className="p-6 bg-muted/30 min-h-screen">
        {/* 返回按钮 */}
        <button
          onClick={() => setShowDetail(false)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>

        <div className="space-y-6 max-w-5xl">
          {/* 基本信息 */}
          <Card className="p-6">
            <h3 className="font-medium mb-4">基本信息</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                <Label className="text-sm pt-2">
                  <span className="text-red-500">*</span> 清洗规则名称:
                </Label>
                <Input
                  value={currentRule.name}
                  onChange={e => setCurrentRule({ ...currentRule, name: e.target.value })}
                  placeholder="请输入清洗规则名称"
                  disabled={detailMode === 'view'}
                />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                <Label className="text-sm pt-2">清洗规则描述:</Label>
                <Textarea
                  value={currentRule.description}
                  onChange={e => setCurrentRule({ ...currentRule, description: e.target.value })}
                  placeholder="请输入清洗规则描述"
                  maxLength={250}
                  disabled={detailMode === 'view'}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </Card>

          {/* 清洗规则配置 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">清洗规则配置</h3>
              {detailMode !== 'view' && (
                <Button size="sm" onClick={openRuleConfig}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* 已选择的规则列表 */}
            {currentRule.enabledRules.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 border rounded-md">
                暂未配置清洗规则，请点击右上角"+"按钮添加
              </div>
            ) : (
              <div className="space-y-3">
                {currentRule.enabledRules.map(ruleId => {
                  const ruleType = RULE_TYPES.find(r => r.id === ruleId);
                  if (!ruleType) return null;
                  const isExpanded = expandedRules.has(ruleId);
                  
                  return (
                    <div key={ruleId} className="border rounded-md">
                      {/* 规则标题行 */}
                      <div 
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpandRule(ruleId)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{ruleType.name}</span>
                        </div>
                        {detailMode !== 'view' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEnabledRule(ruleId);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                            title="删除该规则"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* 规则配置内容 */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t">
                          {/* 符合办理条件 */}
                          {ruleId === 'condition' && (
                            <div className="mt-4">
                              <div className="border rounded-md">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="w-16 text-center">序号</TableHead>
                                      <TableHead>标签名称</TableHead>
                                      <TableHead className="w-24">运算符</TableHead>
                                      <TableHead>值</TableHead>
                                      {detailMode !== 'view' && (
                                        <TableHead className="w-16 text-center">操作</TableHead>
                                      )}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {currentRule.conditions.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={detailMode === 'view' ? 4 : 5} className="text-center text-muted-foreground py-6">
                                          暂无数据
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      currentRule.conditions.map((cond, idx) => (
                                        <TableRow key={cond.id}>
                                          <TableCell className="text-center">{idx + 1}</TableCell>
                                          <TableCell>
                                            {detailMode !== 'view' ? (
                                              <Select
                                                value={cond.tagName}
                                                onValueChange={v => updateCondition(cond.id, 'tagName', v)}
                                              >
                                                <SelectTrigger className="h-8">
                                                  <SelectValue placeholder="请选择" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {tagOptions.map(tag => (
                                                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              cond.tagName || '-'
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {detailMode !== 'view' ? (
                                              <Select
                                                value={cond.operator}
                                                onValueChange={v => updateCondition(cond.id, 'operator', v)}
                                              >
                                                <SelectTrigger className="h-8">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {operatorOptions.map(op => (
                                                    <SelectItem key={op} value={op}>{op}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              cond.operator
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {detailMode !== 'view' ? (
                                              <Input
                                                value={cond.value}
                                                onChange={e => updateCondition(cond.id, 'value', e.target.value)}
                                                placeholder="请输入"
                                                className="h-8"
                                              />
                                            ) : (
                                              cond.value || '-'
                                            )}
                                          </TableCell>
                                          {detailMode !== 'view' && (
                                            <TableCell className="text-center">
                                              <button
                                                onClick={() => removeCondition(cond.id)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </TableCell>
                                          )}
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              {detailMode !== 'view' && (
                                <Button variant="outline" size="sm" className="mt-2" onClick={addCondition}>
                                  <Plus className="w-4 h-4 mr-1" />
                                  添加条件
                                </Button>
                              )}
                            </div>
                          )}

                          {/* 重复商机 */}
                          {ruleId === 'duplicate' && (
                            <div className="mt-4 space-y-4">
                              {/* 规则1：短时效重复商机处理 */}
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="enableShortTerm"
                                  checked={currentRule.duplicateHandling.enableShortTerm}
                                  onCheckedChange={(checked) => setCurrentRule({
                                    ...currentRule,
                                    duplicateHandling: { 
                                      ...currentRule.duplicateHandling, 
                                      enableShortTerm: !!checked 
                                    }
                                  })}
                                  disabled={detailMode === 'view'}
                                />
                                <label htmlFor="enableShortTerm" className="text-sm cursor-pointer">
                                  {detailMode !== 'view' ? (
                                    <>
                                      <Input
                                        type="number"
                                        value={currentRule.duplicateHandling.hours}
                                        onChange={e => setCurrentRule({
                                          ...currentRule,
                                          duplicateHandling: { 
                                            ...currentRule.duplicateHandling, 
                                            hours: Number(e.target.value) 
                                          }
                                        })}
                                        className="w-16 h-8 inline-block text-center"
                                        disabled={!currentRule.duplicateHandling.enableShortTerm}
                                      />
                                      <span className="ml-1">小时内重复保留最后一条</span>
                                    </>
                                  ) : (
                                    <span className={currentRule.duplicateHandling.enableShortTerm ? '' : 'text-muted-foreground'}>
                                      {currentRule.duplicateHandling.hours}小时内重复保留最后一条
                                      {!currentRule.duplicateHandling.enableShortTerm && '（未启用）'}
                                    </span>
                                  )}
                                </label>
                              </div>
                              
                              {/* 规则2：跨时段重复商机处理 */}
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="enableCrossPeriod"
                                  checked={currentRule.duplicateHandling.enableCrossPeriod}
                                  onCheckedChange={(checked) => setCurrentRule({
                                    ...currentRule,
                                    duplicateHandling: { 
                                      ...currentRule.duplicateHandling, 
                                      enableCrossPeriod: !!checked 
                                    }
                                  })}
                                  disabled={detailMode === 'view'}
                                />
                                <label htmlFor="enableCrossPeriod" className="text-sm cursor-pointer">
                                  {detailMode !== 'view' ? (
                                    <>
                                      与近
                                      <Select
                                        value={String(currentRule.duplicateHandling.compareDays)}
                                        onValueChange={v => setCurrentRule({
                                          ...currentRule,
                                          duplicateHandling: { 
                                            ...currentRule.duplicateHandling, 
                                            compareDays: Number(v) 
                                          }
                                        })}
                                        disabled={!currentRule.duplicateHandling.enableCrossPeriod}
                                      >
                                        <SelectTrigger className="w-20 h-8 inline-block mx-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[7, 14, 30, 60, 90].map(d => (
                                            <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      天已推送商机对比剔重
                                    </>
                                  ) : (
                                    <span className={currentRule.duplicateHandling.enableCrossPeriod ? '' : 'text-muted-foreground'}>
                                      与近{currentRule.duplicateHandling.compareDays}天已推送商机对比剔重
                                      {!currentRule.duplicateHandling.enableCrossPeriod && '（未启用）'}
                                    </span>
                                  )}
                                </label>
                              </div>
                            </div>
                          )}

                          {/* 已办理本产品 */}
                          {ruleId === 'purchased' && (
                            <div className="mt-4 flex items-center gap-2">
                              {detailMode !== 'view' ? (
                                <>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Upload className="w-3 h-3 mr-1" />
                                    导入
                                  </Button>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Download className="w-3 h-3 mr-1" />
                                    下载模板
                                  </Button>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {currentRule.purchasedProduct.file || '未配置文件'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 存在互斥产品 */}
                          {ruleId === 'mutex' && (
                            <div className="mt-4 flex items-center gap-2">
                              {detailMode !== 'view' ? (
                                <>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Upload className="w-3 h-3 mr-1" />
                                    导入
                                  </Button>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Download className="w-3 h-3 mr-1" />
                                    下载模板
                                  </Button>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {currentRule.mutexProduct.file || '未配置文件'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 降收降档 */}
                          {ruleId === 'downgrade' && (
                            <div className="mt-4 flex items-center gap-2">
                              {detailMode !== 'view' ? (
                                <>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Upload className="w-3 h-3 mr-1" />
                                    导入
                                  </Button>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Download className="w-3 h-3 mr-1" />
                                    下载模板
                                  </Button>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {currentRule.downgradeProduct.file || '未配置文件'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 已办理升档产品 */}
                          {ruleId === 'upgrade' && (
                            <div className="mt-4 flex items-center gap-2">
                              {detailMode !== 'view' ? (
                                <>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Upload className="w-3 h-3 mr-1" />
                                    导入
                                  </Button>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                                    <Download className="w-3 h-3 mr-1" />
                                    下载模板
                                  </Button>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {currentRule.upgradeProduct.file || '未配置文件'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 黑名单 */}
                          {ruleId === 'blacklist' && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-3">
                                {detailMode !== 'view' && (
                                  <>
                                    <Button variant="outline" size="sm">
                                      <Upload className="w-3 h-3 mr-1" />
                                      导入
                                    </Button>
                                    <Button size="sm" onClick={addBlacklistEntry}>
                                      <Plus className="w-3 h-3 mr-1" />
                                      添加
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="border rounded-md">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="w-16 text-center">序号</TableHead>
                                      <TableHead>手机号</TableHead>
                                      <TableHead>原因</TableHead>
                                      <TableHead>添加日期</TableHead>
                                      {detailMode !== 'view' && (
                                        <TableHead className="w-16 text-center">操作</TableHead>
                                      )}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {currentRule.blacklist.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={detailMode === 'view' ? 4 : 5} className="text-center text-muted-foreground py-6">
                                          暂无数据
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      currentRule.blacklist.map((entry, idx) => (
                                        <TableRow key={entry.id}>
                                          <TableCell className="text-center">{idx + 1}</TableCell>
                                          <TableCell>
                                            {detailMode !== 'view' ? (
                                              <Input
                                                value={entry.phone}
                                                onChange={e => updateBlacklistEntry(entry.id, 'phone', e.target.value)}
                                                placeholder="请输入手机号"
                                                className="h-8"
                                              />
                                            ) : (
                                              entry.phone
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {detailMode !== 'view' ? (
                                              <Input
                                                value={entry.reason}
                                                onChange={e => updateBlacklistEntry(entry.id, 'reason', e.target.value)}
                                                placeholder="请输入原因"
                                                className="h-8"
                                              />
                                            ) : (
                                              entry.reason
                                            )}
                                          </TableCell>
                                          <TableCell>{entry.addedAt}</TableCell>
                                          {detailMode !== 'view' && (
                                            <TableCell className="text-center">
                                              <button
                                                onClick={() => removeBlacklistEntry(entry.id)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </TableCell>
                                          )}
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                                <span>共 {currentRule.blacklist.length} 条</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 商机业务配置 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" />
                商机业务配置
              </h3>
              {detailMode !== 'view' && (
                <Button size="sm" onClick={openBusinessSelect}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              )}
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16 text-center">序号</TableHead>
                    <TableHead>商机业务ID</TableHead>
                    <TableHead>商机业务名称</TableHead>
                    <TableHead>商机源</TableHead>
                    <TableHead>客户类别</TableHead>
                    <TableHead>商机分类</TableHead>
                    {detailMode !== 'view' && (
                      <TableHead className="w-16 text-center">操作</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRule.businessTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={detailMode === 'view' ? 6 : 7} className="text-center text-muted-foreground py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRule.businessTypes.map((bt, idx) => {
                      return (
                        <TableRow key={bt.id}>
                          <TableCell className="text-center">{idx + 1}</TableCell>
                          <TableCell>{bt.businessId}</TableCell>
                          <TableCell>{bt.businessName || '-'}</TableCell>
                          <TableCell>{bt.source || '-'}</TableCell>
                          <TableCell>{bt.customerCategory || '-'}</TableCell>
                          <TableCell>
                            <span className="text-sm">{bt.categoryPath || '-'}</span>
                          </TableCell>
                          {detailMode !== 'view' && (
                            <TableCell className="text-center">
                              <button
                                onClick={() => removeBusinessType(bt.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>共 {currentRule.businessTypes.length} 条</span>
            </div>
          </Card>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDetail(false)}>
              返回
            </Button>
            {detailMode !== 'view' && (
              <Button onClick={handleSave}>
                保存
              </Button>
            )}
          </div>
        </div>

        {/* 清洗规则配置弹窗 */}
        <Dialog open={ruleConfigOpen} onOpenChange={setRuleConfigOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>清洗规则配置</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 全选 */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  checked={tempEnabledRules.length === RULE_TYPES.length}
                  onCheckedChange={toggleAllRules}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="font-medium cursor-pointer">
                  全选
                </Label>
              </div>
              {/* 规则选项 */}
              <div className="space-y-3">
                {RULE_TYPES.map(rule => (
                  <div key={rule.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={tempEnabledRules.includes(rule.id)}
                      onCheckedChange={() => toggleRuleEnabled(rule.id)}
                      id={rule.id}
                    />
                    <Label htmlFor={rule.id} className="cursor-pointer">
                      {rule.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRuleConfigOpen(false)}>
                取消
              </Button>
              <Button onClick={saveRuleConfig}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 商机业务选择弹窗 */}
        <Dialog open={businessSelectOpen} onOpenChange={setBusinessSelectOpen}>
          <DialogContent className="max-w-[1600px] w-[99vw] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>商机业务</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-hidden">
              {/* 已选商机业务标签 */}
              {tempSelectedBusinesses.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-md max-h-[120px] overflow-y-auto">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                    <Layers className="w-4 h-4" />
                    <span>已选商机</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {tempSelectedBusinesses.map(bt => (
                      <Badge 
                        key={bt.id} 
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        <span className="max-w-[200px] truncate">{bt.name}</span>
                        <span className="text-xs opacity-70 ml-1">({bt.id})</span>
                        <button
                          onClick={() => removeFromTempSelected(bt.id)}
                          className="ml-1 hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 搜索栏 */}
              <div className="flex items-center gap-2">
                <Input
                  value={businessSearchText}
                  onChange={e => { setBusinessSearchText(e.target.value); setBusinessListPage(1); }}
                  placeholder="请输入内容编号/名称"
                  className="flex-1"
                />
                <Button size="icon" variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 商机业务列表 */}
              <div className="border rounded-md overflow-x-auto">
                <Table className="min-w-[1400px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16 text-center">序号</TableHead>
                      <TableHead className="w-[100px]">业务类型ID</TableHead>
                      <TableHead className="w-[260px]">业务类型名称</TableHead>
                      <TableHead className="min-w-[220px]">商机分类</TableHead>
                      <TableHead className="w-[110px]">客户类别</TableHead>
                      <TableHead className="w-[110px]">商机源</TableHead>
                      <TableHead className="w-[110px]">运营场景</TableHead>
                      <TableHead className="w-[80px] text-center">状态</TableHead>
                      <TableHead className="w-[140px]">创建时间</TableHead>
                      <TableHead className="w-[80px]">创建人</TableHead>
                      <TableHead className="w-24 text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBusinessOptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBusinessOptions.map((item, idx) => {
                        const isSelected = tempSelectedBusinesses.some(bt => bt.id === item.id);
                        return (
                          <TableRow
                            key={item.id}
                            className={isSelected ? 'bg-muted/50' : ''}
                          >
                            <TableCell className="text-center">
                              {(businessListPage - 1) * businessListPageSize + idx + 1}
                            </TableCell>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <span className="text-sm">{item.categoryPath}</span>
                            </TableCell>
                            <TableCell>{item.customerCategory}</TableCell>
                            <TableCell>{item.source}</TableCell>
                            <TableCell>{item.scenario}</TableCell>
                            <TableCell className="text-center">
                              {item.status === 'active'
                                ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">启用</Badge>
                                : <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">停用</Badge>}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.createTime}</TableCell>
                            <TableCell className="text-sm">{item.creator}</TableCell>
                            <TableCell className="text-center">
                              {isSelected ? (
                                <span className="text-muted-foreground text-sm">已添加</span>
                              ) : (
                                <button
                                  onClick={() => addToTempSelected(item)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  添加
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* 分页 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">共 {filteredBusinessOptions.length} 条</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>每页</span>
                    <Select 
                      value={String(businessListPageSize)} 
                      onValueChange={v => { setBusinessListPageSize(Number(v)); setBusinessListPage(1); }}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>条</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={businessListPage <= 1}
                      onClick={() => setBusinessListPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, businessTotalPages) }, (_, i) => {
                      let pageNum;
                      if (businessTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (businessListPage <= 3) {
                        pageNum = i + 1;
                      } else if (businessListPage >= businessTotalPages - 2) {
                        pageNum = businessTotalPages - 4 + i;
                      } else {
                        pageNum = businessListPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={businessListPage === pageNum ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setBusinessListPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={businessListPage >= businessTotalPages}
                      onClick={() => setBusinessListPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={confirmBusinessSelect}>
                确定
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // 列表页
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">商机清洗规则管理</h1>
      </div>

      {/* 查询栏 */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">清洗规则名称:</Label>
            <Input
              value={filterName}
              onChange={e => { setFilterName(e.target.value); setCurrentPage(1); }}
              placeholder="模糊查询"
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">商机业务名称:</Label>
            <Input
              value={filterBusiness}
              onChange={e => { setFilterBusiness(e.target.value); setCurrentPage(1); }}
              placeholder="模糊查询"
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">状态:</Label>
            <Select value={filterStatus || 'all'} onValueChange={v => { setFilterStatus(v === 'all' ? '' : v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="草稿">草稿</SelectItem>
                <SelectItem value="生效">生效</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCurrentPage(1)}>
              <Search className="w-4 h-4 mr-1" />
              查询
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              重置
            </Button>
          </div>
          <div className="ml-auto">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-1" />
              新增
            </Button>
          </div>
        </div>
      </Card>

      {/* 列表 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 text-center">序号</TableHead>
              <TableHead>清洗规则名称</TableHead>
              <TableHead>配置商机业务</TableHead>
              <TableHead>创建人</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-20 text-center">状态</TableHead>
              <TableHead className="w-48 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedRules.map((rule, idx) => (
                <TableRow key={rule.id}>
                  <TableCell className="text-center">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {rule.configuredBusinesses.length > 0 
                        ? (rule.configuredBusinesses.length > 2 
                          ? `${rule.configuredBusinesses.slice(0, 2).join('、')}...`
                          : rule.configuredBusinesses.join('、'))
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>{rule.creator}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rule.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={rule.status === '生效' 
                      ? 'bg-green-50 text-green-700 hover:bg-green-50' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-50'
                    }>
                      {rule.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {rule.status === '草稿' ? (
                        <>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600"
                            onClick={() => toggleStatus(rule)}
                          >
                            生效
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600"
                            onClick={() => openEdit(rule)}
                          >
                            编辑
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600"
                            onClick={() => openView(rule)}
                          >
                            查看
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-red-600"
                            onClick={() => setDeleteDialog({ open: true, ruleId: rule.id, ruleName: rule.name })}
                          >
                            删除
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600"
                            onClick={() => toggleStatus(rule)}
                          >
                            失效
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600"
                            onClick={() => openView(rule)}
                          >
                            查看
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            共 {filteredRules.length} 条
          </div>
          <div className="flex items-center gap-4">
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                {'<'}
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {'>'}
              </Button>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span>跳至</span>
              <Input
                type="number"
                value={currentPage}
                onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages || 1, Number(e.target.value))))}
                className="w-14 h-8 text-center"
              />
              <span>页</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialog.open} onOpenChange={o => setDeleteDialog(prev => ({ ...prev, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            确定要删除清洗规则「{deleteDialog.ruleName}」吗？此操作不可恢复。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, ruleId: '', ruleName: '' })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
