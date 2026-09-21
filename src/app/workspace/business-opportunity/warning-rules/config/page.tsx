'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// 条件接口
interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  unit?: string;
}

// 规则类型选项
const ruleTypes = [
  { value: 'time', label: '时效类', color: 'text-blue-500' },
  { value: 'convert', label: '转化类', color: 'text-green-500' },
  { value: 'behavior', label: '行为类', color: 'text-purple-500' },
  { value: 'abnormal', label: '异常类', color: 'text-red-500' },
  { value: 'system', label: '系统类', color: 'text-gray-500' },
];

// 指标库
const metricsOptions = [
  { value: 'status', label: '商机状态', category: '商机状态' },
  { value: 'unassigned_time', label: '未派发时长', category: '商机状态' },
  { value: 'processing_time', label: '处理时长', category: '商机状态' },
  { value: 'level', label: '商机等级', category: '商机属性' },
  { value: 'type', label: '商机类型', category: '商机属性' },
  { value: 'convert_rate', label: '转化率', category: '转化指标' },
  { value: 'churn_rate', label: '流失率', category: '转化指标' },
  { value: 'active_days', label: '客户活跃天数', category: '行为指标' },
  { value: 'view_count', label: '浏览次数', category: '行为指标' },
  { value: 'fail_rate', label: '派发失败率', category: '系统指标' },
  { value: 'response_time', label: '系统响应时间', category: '系统指标' },
];

// 操作符选项
const operatorOptions = [
  { value: 'gt', label: '大于' },
  { value: 'lt', label: '小于' },
  { value: 'eq', label: '等于' },
  { value: 'ne', label: '不等于' },
  { value: 'contains', label: '包含' },
];

// 模拟人员数据
const users = [
  { value: 'zhangsan', label: '张三' },
  { value: 'lisi', label: '李四' },
  { value: 'wangwu', label: '王五' },
  { value: 'zhaoliu', label: '赵六' },
];

// 模块标题组件
function ModuleTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-blue-500 rounded">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
    </div>
  );
}

// AI建议面板
function AISuggestionPanel() {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <div className="p-1.5 bg-purple-100 rounded">
          <Bot className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span className="font-medium text-sm text-purple-700">AI智能建议</span>
          </div>
          <div className="space-y-1 text-xs text-purple-600">
            <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-purple-400" />当前条件预计触发频率：<span className="font-medium">12次/天</span></div>
            <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-purple-400" />同类规则平均触发：<span className="font-medium">8次/天</span></div>
            <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-purple-400" />建议：阈值调整为 <span className="font-medium">&gt; 6小时</span>，可减少30%干扰预警</div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="outline" className="h-6 text-xs bg-white border-purple-200 hover:bg-purple-100">应用AI建议</Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-purple-600">查看详细分析</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RuleConfigPage() {
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('time');
  const [ruleLevel, setRuleLevel] = useState('medium');
  const [ruleStatus, setRuleStatus] = useState(true);
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'status', operator: 'eq', value: 'pending' },
    { id: '2', field: 'unassigned_time', operator: 'gt', value: '4', unit: 'hour' },
  ]);
  const [notifySystem, setNotifySystem] = useState(true);
  const [notifyWechat, setNotifyWechat] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [responsible, setResponsible] = useState('');
  const [autoProcess, setAutoProcess] = useState(true);
  const [effectiveTime, setEffectiveTime] = useState('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedOrg, setExpandedOrg] = useState<string[]>(['beijing']);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // 从sessionStorage获取编辑的规则数据
  useEffect(() => {
    const editRuleData = sessionStorage.getItem('editRule');
    if (editRuleData) {
      const rule = JSON.parse(editRuleData);
      setRuleName(rule.name);
      setRuleType(rule.type);
      setRuleLevel(rule.level);
      setRuleStatus(rule.status === 'enabled');
      setIsEditing(true);
    }
  }, []);

  // 判断是否需要时间单位
  const needsUnit = (field: string) => ['unassigned_time', 'processing_time', 'active_days'].includes(field);

  // 组织架构数据
  const orgTree = [
    {
      id: 'beijing',
      name: '北京移动',
      children: [
        { id: 'leader', name: '公司领导', children: [] },
        { id: 'ops', name: '运营部', children: [] },
      ],
    },
  ];

  // 员工数据
  const allUsers = [
    { id: 'admin', name: '超级管理员', role: '超级管理员', org: 'beijing' },
    { id: 'user1', name: '阚盖兰', role: '阚盖兰', org: 'beijing' },
    { id: 'user2', name: '市二', role: '北京市运营人员', org: 'beijing' },
    { id: 'user3', name: '市一', role: '北京市管理员', org: 'beijing' },
    { id: 'user4', name: '呃呃呃', role: '1', org: 'beijing' },
    { id: 'user5', name: '超级王', role: 'admin', org: 'beijing' },
  ];

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleConfirmUsers = () => {
    if (selectedUsers.length > 0) {
      setResponsible(selectedUsers[0]);
    }
    setShowUserDialog(false);
    setSelectedUsers([]);
    setUserSearchQuery('');
  };

  const handleAddCondition = () => {
    if (conditions.length >= 5) return;
    setConditions([
      ...conditions,
      { id: Date.now().toString(), field: 'level', operator: 'eq', value: 'high' },
    ]);
  };

  const handleConditionChange = (index: number, condition: Condition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    setConditions(newConditions);
  };

  const handleDeleteCondition = (index: number) => {
    if (conditions.length <= 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setShowSaveDialog(false);
    // 保存成功后清除sessionStorage并跳转
    sessionStorage.removeItem('editRule');
    router.push('/business-insights/rules');
  };

  const handleCancel = () => {
    sessionStorage.removeItem('editRule');
    router.push('/business-insights/rules');
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? '编辑规则' : '新建规则'}
          </h1>
          <p className="text-muted-foreground text-sm">配置预警规则的条件与通知方式</p>
        </div>
      </div>

      {/* 模块一：基础信息 */}
      <Card>
        <CardHeader className="pb-2">
          <ModuleTitle icon={Settings} title="基础信息" />
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 规则名称 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">规则名称 <span className="text-red-500">*</span></Label>
            <Input placeholder="如：高价值商机4小时未派发" value={ruleName} onChange={(e) => setRuleName(e.target.value)} className="col-span-4 h-8 w-96" />
          </div>
          {/* 规则类型 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">规则类型 <span className="text-red-500">*</span></Label>
            <Select value={ruleType} onValueChange={setRuleType}>
              <SelectTrigger className="col-span-4 h-8 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ruleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}><span className={type.color}>{type.label}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 预警级别 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">预警级别 <span className="text-red-500">*</span></Label>
            <RadioGroup value={ruleLevel} onValueChange={setRuleLevel} className="col-span-4 flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="level-high" />
                <Label htmlFor="level-high" className="flex items-center gap-1 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-red-600 font-medium text-sm">高</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="level-medium" />
                <Label htmlFor="level-medium" className="flex items-center gap-1 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-orange-600 font-medium text-sm">中</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="level-low" />
                <Label htmlFor="level-low" className="flex items-center gap-1 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="text-yellow-600 font-medium text-sm">低</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          {/* 规则状态 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">规则状态</Label>
            <div className="col-span-4 flex items-center gap-2">
              <Switch checked={ruleStatus} onCheckedChange={setRuleStatus} />
              <span className={ruleStatus ? 'text-green-600 text-sm' : 'text-gray-500 text-sm'}>{ruleStatus ? '启用' : '停用'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模块二：触发条件配置 */}
      <Card>
        <CardHeader className="pb-2">
          <ModuleTitle icon={AlertTriangle} title="触发条件配置" />
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 条件说明 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">触发说明</Label>
            <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>满足以下全部条件时触发预警</span>
              <Badge variant="secondary" className="text-xs">且 AND</Badge>
            </div>
          </div>
          {/* 条件行 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-start pt-2">条件配置</Label>
            <div className="col-span-4 space-y-2">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs shrink-0">条件{index + 1}</Badge>
                  <Select value={condition.field} onValueChange={(v) => handleConditionChange(index, { ...condition, field: v })}>
                    <SelectTrigger className="w-36 h-7 text-xs"><SelectValue placeholder="指标" /></SelectTrigger>
                    <SelectContent>
                      {metricsOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={condition.operator} onValueChange={(v) => handleConditionChange(index, { ...condition, operator: v })}>
                    <SelectTrigger className="w-24 h-7 text-xs"><SelectValue placeholder="符号" /></SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-20 h-7 text-xs"
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, { ...condition, value: e.target.value })}
                    placeholder="值"
                  />
                  {needsUnit(condition.field) && (
                    <Select value={condition.unit || 'hour'} onValueChange={(v) => handleConditionChange(index, { ...condition, unit: v })}>
                      <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute" className="text-xs">分钟</SelectItem>
                        <SelectItem value="hour" className="text-xs">小时</SelectItem>
                        <SelectItem value="day" className="text-xs">天</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-600 text-xs shrink-0" onClick={() => handleDeleteCondition(index)} disabled={conditions.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddCondition} disabled={conditions.length >= 5} className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />添加条件
              </Button>
            </div>
          </div>
          <AISuggestionPanel />
        </CardContent>
      </Card>

      {/* 模块三：通知与处理配置 */}
      <Card>
        <CardHeader className="pb-2">
          <ModuleTitle icon={Bell} title="通知与处理配置" />
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 通知方式 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">通知方式（多选）</Label>
            <div className="col-span-4 flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-system" checked={notifySystem} onCheckedChange={(checked) => setNotifySystem(checked as boolean)} />
                <Label htmlFor="notify-system" className="text-sm cursor-pointer">系统消息</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-wechat" checked={notifyWechat} onCheckedChange={(checked) => setNotifyWechat(checked as boolean)} />
                <Label htmlFor="notify-wechat" className="text-sm cursor-pointer">企微通知</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-sms" checked={notifySms} onCheckedChange={(checked) => setNotifySms(checked as boolean)} />
                <Label htmlFor="notify-sms" className="text-sm cursor-pointer">短信通知</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-email" checked={notifyEmail} onCheckedChange={(checked) => setNotifyEmail(checked as boolean)} />
                <Label htmlFor="notify-email" className="text-sm cursor-pointer">邮件通知</Label>
              </div>
            </div>
          </div>
          {/* 责任人 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">责任人 <span className="text-red-500">*</span></Label>
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-sm px-3 py-1.5 bg-gray-50 rounded border border-gray-200 min-w-24">
                {responsible ? users.find(u => u.value === responsible)?.label : '请选择'}
              </span>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setShowUserDialog(true)}>选择</Button>
            </div>
          </div>
          {/* 自动处理 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">自动处理</Label>
            <div className="col-span-4 flex items-center gap-2">
              <Switch checked={autoProcess} onCheckedChange={setAutoProcess} />
              <span className={autoProcess ? 'text-green-600 text-sm' : 'text-gray-500 text-sm'}>{autoProcess ? '开启' : '关闭'}</span>
              <span className="text-xs text-muted-foreground ml-2">开启后，预警触发后将自动标记优先级并推荐处理方案</span>
            </div>
          </div>
          {/* 生效时间 */}
          <div className="grid grid-cols-5 gap-4">
            <Label className="text-sm text-right self-center">生效时间</Label>
            <div className="col-span-4 flex items-center gap-2">
              <Select value={effectiveTime} onValueChange={setEffectiveTime}>
                <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全天生效</SelectItem>
                  <SelectItem value="workday">工作时间</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
              {effectiveTime === 'custom' && (
                <>
                  <Input type="time" className="w-24 h-8" defaultValue="00:00" />
                  <span className="text-muted-foreground">至</span>
                  <Input type="time" className="w-24 h-8" defaultValue="23:59" />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部操作区 */}
      <div className="flex items-center justify-center gap-3 py-4 border-t">
        <Button variant="outline" onClick={() => setShowCancelDialog(true)} className="px-6">取消</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 px-6" onClick={() => setShowSaveDialog(true)}>
          <Save className="h-4 w-4 mr-1.5" />保存规则
        </Button>
      </div>

      {/* 保存确认弹窗 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-500" />
              保存确认
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">规则名称：</span>
              <span className="font-medium">{ruleName || '高价值商机4小时未派发'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">规则类型：</span>
              <span>{ruleTypes.find(t => t.value === ruleType)?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">预警级别：</span>
              <span className={ruleLevel === 'high' ? 'text-red-600' : ruleLevel === 'medium' ? 'text-orange-600' : 'text-yellow-600'}>
                {ruleLevel === 'high' ? '🔴 高' : ruleLevel === 'medium' ? '🟠 中' : '🟡 低'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">触发条件：</span>
              <span>{conditions.length}个条件组合</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">预计触发：</span>
              <span className="text-orange-600">12次/天</span>
            </div>
          </div>
          <DialogDescription className="text-sm">
            保存后规则立即生效，是否确认？
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>取消</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSave}>确认保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 取消确认弹窗 */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              确认取消
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            当前有未保存的修改，确定要取消吗？
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>继续编辑</Button>
            <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleCancel}>
              放弃修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 选择员工弹窗 */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="p-4 border-b">
            <DialogTitle className="text-base font-semibold">选择员工</DialogTitle>
          </div>
          <div className="flex" style={{ height: '360px' }}>
            {/* 左侧：组织架构 */}
            <div className="w-48 border-r bg-gray-50 p-3 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                组织架构
              </div>
              <div className="space-y-0.5">
                {orgTree.map(org => (
                  <div key={org.id}>
                    <button
                      className="w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-blue-50 bg-blue-100"
                      onClick={() => setExpandedOrg(prev => prev.includes(org.id) ? prev.filter(id => id !== org.id) : [...prev, org.id])}
                    >
                      <svg className={cn('h-3 w-3 transition-transform', expandedOrg.includes(org.id) && 'rotate-90')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      <span>{org.name}</span>
                    </button>
                    {expandedOrg.includes(org.id) && org.children.map(child => (
                      <button key={child.id} className="w-full text-left px-2 py-1 rounded text-sm text-muted-foreground hover:bg-gray-100 ml-3">
                        {child.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* 右侧：员工列表 */}
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b">
                <Input
                  placeholder="输入员工名称"
                  className="h-8 text-sm"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => handleUserToggle(user.id)} />
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">- {user.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 border-t flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUserDialog(false)}>取消</Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={handleConfirmUsers}>确定</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
