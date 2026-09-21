'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, SendHorizonal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ==================== 常量（与 new/page.tsx 保持一致） ====================

const CITIES = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];

const ALERT_CATEGORIES = [
  { code: 'task', name: '任务类', enabled: true },
  { code: 'indicator', name: '指标类', enabled: false },
  { code: 'composite', name: '复合类', enabled: false },
];

const BUSINESS_SCENES = [
  { code: 'PORT_OUT', name: '携转预警', theme: '存量运营' },
  { code: 'BROADBAND_CHURN', name: '宽带离网预警', theme: '存量运营' },
  { code: 'GOTONE_CHURN', name: '全球通离网预警', theme: '存量运营' },
  { code: 'HOTLINE_OPP', name: '热线商机预警', theme: '存量运营' },
  { code: 'COMPLAINT', name: '投诉工单预警', theme: '存量运营' },
  { code: 'ABNORMAL', name: '异动客户预警', theme: '存量运营' },
  { code: 'GOTONE_TRACE', name: '全球通离网追溯', theme: '存量运营' },
  { code: 'SUSPEND_WIN', name: '停机赢回预警', theme: '存量运营' },
  { code: 'GOTONE_TIELONG', name: '铁通预警', theme: '存量运营' },
];

const EXECUTION_MODES = [
  { code: 'online', name: '在线执行' },
  { code: 'subcontract', name: '分包看管执行' },
  { code: 'online_subcontract', name: '在线+分包看管' },
  { code: 'custom', name: '自定义' },
];

const EXECUTION_ROLES = [
  { code: '10086', name: '10086' },
  { code: '10088', name: '10088' },
  { code: 'grid_manager', name: '网格经理' },
  { code: 'grid_staff', name: '网格人员' },
  { code: 'city_ops', name: '地市集运' },
  { code: 'tietong', name: '铁通随销-网格通' },
];

// ==================== 类型定义 ====================

type TaskAlertStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'disabled' | 'expired';

interface RuleCondition {
  name: string;
  operator: string;
  value: string;
}

interface TaskWarning {
  id: string;
  name: string;
  alertType: string;
  alertTypeName: string;
  customerType: string;
  businessTheme: string;
  businessSceneName: string;
  updateCycle: string;
  executionChannel: string;
  executionMode: string;
  executionRoles: string;
  approvalStatus: TaskAlertStatus;
  region: string;
  createTime: string;
  startDate: string;
  endDate: string;
  description: string;
  rejectReason?: string;
  rules: {
    intersection: RuleCondition[];
    union: RuleCondition[];
  };
  cityConfig?: {
    city: string;
    mode: string;
    roles: string[];
  }[];
}

// ==================== 状态配置 ====================

const statusConfig: Record<TaskAlertStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  pending: { label: '审批中', color: 'bg-blue-100 text-blue-600' },
  active: { label: '已生效', color: 'bg-green-100 text-green-600' },
  rejected: { label: '已驳回', color: 'bg-red-100 text-red-600' },
  disabled: { label: '已停用', color: 'bg-amber-100 text-amber-600' },
  expired: { label: '已失效', color: 'bg-gray-100 text-gray-400' },
};

// ==================== 模拟数据 ====================

const MOCK_DATA: Record<string, TaskWarning> = {
  WRN20260701001: {
    id: 'WRN20260701001', name: '乌鲁木齐携转预警-线上挽留', alertType: 'PORT_OUT', alertTypeName: '携转预警',
    customerType: '全量客户', businessTheme: '存量运营', businessSceneName: '携转预警', updateCycle: '实时', executionChannel: '10088/网格经理',
    executionMode: '在线+分包看管执行', executionRoles: '网格经理、10088', approvalStatus: 'active', region: '新疆',
    createTime: '2026-06-28 10:30:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '乌鲁木齐地区携转预警，通过线上挽留方式执行',
    rules: {
      intersection: [{ name: '携转意愿评分', operator: '≥', value: '80' }, { name: 'ARPU值', operator: '≥', value: '58' }],
      union: [{ name: '合约到期天数', operator: '≤', value: '30' }, { name: '近30天投诉次数', operator: '≥', value: '2' }],
    },
  },
  WRN20260701002: {
    id: 'WRN20260701002', name: '全疆宽带离网预警-分包看管', alertType: 'BROADBAND_CHURN', alertTypeName: '宽带离网预警',
    customerType: '全量客户', businessTheme: '存量运营', businessSceneName: '宽带离网预警', updateCycle: '日 09:00', executionChannel: '地市集运',
    executionMode: '分包看管执行', executionRoles: '地市集运', approvalStatus: 'active', region: '新疆',
    createTime: '2026-06-25 14:00:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '全疆宽带离网预警，分包看管模式执行',
    rules: { intersection: [{ name: '宽带续费概率', operator: '≤', value: '0.3' }, { name: '宽带到期天数', operator: '≤', value: '15' }], union: [] },
  },
  WRN20260701003: {
    id: 'WRN20260701003', name: '全球通离网预警-分包看管', alertType: 'GOTONE_CHURN', alertTypeName: '全球通离网预警',
    customerType: '全球通客户', businessTheme: '存量运营', businessSceneName: '全球通离网预警', updateCycle: '日 09:00', executionChannel: '网格经理',
    executionMode: '分包看管执行', executionRoles: '网格经理', approvalStatus: 'pending', region: '新疆',
    createTime: '2026-07-01 09:00:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '全球通客户离网预警',
    rules: { intersection: [{ name: '全球通离网概率', operator: '≥', value: '0.6' }, { name: '月均消费降幅', operator: '≥', value: '20%' }], union: [{ name: '是否政企客户关键人', operator: '=', value: '否' }] },
  },
  WRN20260701004: {
    id: 'WRN20260701004', name: '热线商机预警-分包看管', alertType: 'HOTLINE_OPP', alertTypeName: '热线商机预警',
    customerType: '全量客户', businessTheme: '存量运营', businessSceneName: '热线商机预警', updateCycle: '日 10:00', executionChannel: '10086',
    executionMode: '在线执行', executionRoles: '10086', approvalStatus: 'draft', region: '新疆',
    createTime: '2026-07-02 10:00:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '热线商机预警规则，待提交审批',
    rules: { intersection: [{ name: '热线商机评分', operator: '≥', value: '70' }], union: [] },
  },
  WRN20260701005: {
    id: 'WRN20260701005', name: '投诉工单预警-在线跟进', alertType: 'COMPLAINT', alertTypeName: '投诉工单预警',
    customerType: '全球通客户', businessTheme: '存量运营', businessSceneName: '投诉工单预警', updateCycle: '实时', executionChannel: '网格经理',
    executionMode: '分包看管执行', executionRoles: '网格经理', approvalStatus: 'rejected', region: '新疆',
    createTime: '2026-06-20 08:00:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '投诉工单预警规则，已被驳回',
    rejectReason: '规则条件过于宽泛，建议缩小客户范围后重新提交。',
    rules: { intersection: [{ name: '近30天投诉次数', operator: '≥', value: '3' }], union: [{ name: '投诉级别', operator: '=', value: '严重' }] },
  },
  WRN20260701006: {
    id: 'WRN20260701006', name: '异动客户预警-自定义模式', alertType: 'ABNORMAL', alertTypeName: '异动客户预警',
    customerType: '全量客户', businessTheme: '存量运营', businessSceneName: '异动客户预警', updateCycle: '周 09:00', executionChannel: '网格通',
    executionMode: '自定义', executionRoles: '各地市独立配置', approvalStatus: 'active', region: '新疆',
    createTime: '2026-06-15 16:00:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '异动客户预警，各地市自定义执行模式',
    rules: { intersection: [{ name: '消费异动评分', operator: '≥', value: '60' }], union: [] },
    cityConfig: [
      { city: '乌鲁木齐', mode: '在线执行', roles: ['10086'] },
      { city: '克拉玛依', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '吐鲁番', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '哈密', mode: '在线+分包看管', roles: ['10086', '网格经理'] },
      { city: '昌吉', mode: '在线执行', roles: ['10086'] },
      { city: '博州', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '巴州', mode: '分包看管执行', roles: ['网格经理', '10088'] },
      { city: '阿克苏', mode: '在线+分包看管', roles: ['10086', '网格经理'] },
      { city: '克州', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '喀什', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '和田', mode: '在线执行', roles: ['10086'] },
      { city: '伊犁', mode: '在线+分包看管', roles: ['10086', '网格经理'] },
      { city: '塔城', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '阿勒泰', mode: '分包看管执行', roles: ['网格经理'] },
      { city: '奎屯', mode: '在线执行', roles: ['10086'] },
      { city: '石河子', mode: '分包看管执行', roles: ['网格经理', '10088'] },
    ],
  },
  WRN20260701007: {
    id: 'WRN20260701007', name: '全球通离网追溯-分包看管', alertType: 'GOTONE_TRACE', alertTypeName: '全球通离网追溯',
    customerType: '全球通客户', businessTheme: '存量运营', businessSceneName: '全球通离网追溯', updateCycle: '月 01日', executionChannel: '10088/网格经理',
    executionMode: '分包看管执行', executionRoles: '10088、网格经理', approvalStatus: 'disabled', region: '新疆',
    createTime: '2026-05-10 09:00:00', startDate: '2026-05-01', endDate: '2026-10-31', description: '全球通离网追溯规则，已停用',
    rules: { intersection: [{ name: '全球通离网追溯天数', operator: '≥', value: '90' }, { name: 'ARPU值', operator: '≥', value: '100' }], union: [] },
  },
  WRN20260701008: {
    id: 'WRN20260701008', name: '停机赢回预警-在线执行', alertType: 'SUSPEND_WIN', alertTypeName: '停机赢回预警',
    customerType: '腰部客户', businessTheme: '存量运营', businessSceneName: '停机赢回预警', updateCycle: '日 08:00', executionChannel: '10086',
    executionMode: '在线执行', executionRoles: '10086', approvalStatus: 'expired', region: '新疆',
    createTime: '2026-03-01 08:00:00', startDate: '2026-03-01', endDate: '2026-06-30', description: '停机赢回预警，已失效',
    rules: { intersection: [{ name: '停机天数', operator: '≤', value: '7' }, { name: '历史月均消费', operator: '≥', value: '30' }], union: [] },
  },
  WRN20260701009: {
    id: 'WRN20260701009', name: '铁通预警-分包看管', alertType: 'TIETONG', alertTypeName: '铁通预警',
    customerType: '其他客户', businessTheme: '存量运营', businessSceneName: '铁通预警', updateCycle: '日 09:00', executionChannel: '铁通随销-网格通',
    executionMode: '--', executionRoles: '铁通随销-网格通', approvalStatus: 'pending', region: '新疆',
    createTime: '2026-07-03 09:00:00', startDate: '2026-07-01', endDate: '2026-12-31', description: '铁通预警规则，待审批',
    rules: { intersection: [{ name: '铁通宽带到期天数', operator: '≤', value: '30' }], union: [] },
  },
};

// ==================== 组件 ====================

export default function AlertDetailPage() {
  return <Suspense><AlertDetailContent /></Suspense>;
}

function AlertDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = (params.id as string) || '';
  const [data, setData] = useState<TaskWarning | null>(null);

  useEffect(() => {
    if (id && MOCK_DATA[id]) {
      setData(MOCK_DATA[id]);
    }
  }, [id]);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到预警规则数据</p>
          <Button variant="outline" onClick={() => router.push('/workspace/insight/alert/config?tab=task')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = data.approvalStatus === 'draft' || data.approvalStatus === 'rejected' || data.approvalStatus === 'disabled';
  const canSubmit = data.approvalStatus === 'draft' || data.approvalStatus === 'rejected';
  const canStop = data.approvalStatus === 'active';
  const canDelete = data.approvalStatus === 'draft' || data.approvalStatus === 'rejected' || data.approvalStatus === 'disabled' || data.approvalStatus === 'expired';
  const canWithdraw = data.approvalStatus === 'pending';
  const isTietongScene = data.alertType === 'TIETONG';

  // 解析更新周期
  const parseUpdateCycle = (cycle: string) => {
    if (cycle === '实时') return { type: 'realtime', hour: '', minute: '', weekDay: '', monthDay: '' };
    if (cycle.startsWith('日')) { const parts = cycle.split(' '); return { type: 'daily', hour: parts[1]?.split(':')[0] || '09', minute: parts[1]?.split(':')[1] || '00', weekDay: '', monthDay: '' }; }
    if (cycle.startsWith('周')) { const parts = cycle.split(' '); return { type: 'weekly', hour: parts[1]?.split(':')[0] || '09', minute: parts[1]?.split(':')[1] || '00', weekDay: '1', monthDay: '' }; }
    if (cycle.startsWith('月')) { const m = cycle.match(/月\s*(\d+)/); return { type: 'monthly', hour: '09', minute: '00', weekDay: '', monthDay: m?.[1] || '1' }; }
    return { type: 'daily', hour: '09', minute: '00', weekDay: '', monthDay: '' };
  };
  const cycle = parseUpdateCycle(data.updateCycle);

  // 解析执行模式code
  const executionModeCode = EXECUTION_MODES.find(m => data.executionMode === m.name)?.code ?? '';

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* 顶部栏 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/workspace/insight/alert/config?tab=task')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> 返回
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">预警规则详情</h1>
            <Badge variant="secondary" className={cn('text-xs', statusConfig[data.approvalStatus].color)}>
              {statusConfig[data.approvalStatus].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {canWithdraw && (
              <Button variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">撤回</Button>
            )}
            {canStop && (
              <Button variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">停用</Button>
            )}
            {canEdit && (
              <Button className="bg-[#0085D0] hover:bg-[#006BB0]" onClick={() => router.push(`/workspace/insight/alert/config/new?id=${data.id}&type=task`)}>
                编辑
              </Button>
            )}
            {canSubmit && (
              <Button className="bg-[#0085D0] hover:bg-[#006BB0]" onClick={() => {
                setData(prev => prev ? { ...prev, approvalStatus: 'pending' } : prev);
                try {
                  const stored = localStorage.getItem('pendingWorkOrders');
                  const existing = stored ? JSON.parse(stored) : [];
                  const newOrder = {
                    id: `ALR${Date.now()}${Math.floor(Math.random() * 1000)}`,
                    title: `${data.name}-提交审批`,
                    type: '预警规则审批',
                    description: `预警规则"${data.name}"提交审批，审批通过后规则即生效。`,
                    orderStatus: 'processing', flowStatus: 'inProgress', timeoutStatus: 'normal', processResult: null,
                    customerPhone: '--',
                    alertType: '任务类',
                    businessScene: data.businessSceneName || '--',
                    executionMode: data.executionMode || '--',
                    currentStep: '三级经理审批', currentHandler: '新疆区公司三级经理',
                    city: '新疆', district: '--', grid: '--',
                    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                    creator: '新疆运营人员', createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                  };
                  localStorage.setItem('pendingWorkOrders', JSON.stringify([newOrder, ...existing]));
                } catch { /* ignore */ }
                toast.success('提交审批成功，已生成审批工单');
              }}>
                <SendHorizonal className="w-4 h-4 mr-1" />提交审批
              </Button>
            )}
            {canDelete && (
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />删除
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* ===== 模块一：预警信息（与新增页一致，全部disabled） ===== */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
            <h2 className="text-base font-semibold text-gray-900">预警信息</h2>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">预警名称</Label>
                <div className="relative mt-1.5">
                  <Input value={data.name} disabled className="h-9 pr-14 bg-gray-50" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{data.name.length}/20</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">预警类型</Label>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {ALERT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.code}
                      className={cn(
                        'px-4 py-1.5 rounded-md text-sm border',
                        cat.code === 'task'
                          ? 'bg-[#0085D0] text-white border-[#0085D0]'
                          : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                      )}
                      disabled
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">业务专题</Label>
                <Select value={data.businessTheme} disabled>
                  <SelectTrigger className="mt-1.5 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="存量运营">存量运营</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">业务类型</Label>
                <Select value={data.alertType} disabled>
                  <SelectTrigger className="mt-1.5 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SCENES.map((s) => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">客户类型</Label>
                <Input value={data.customerType} disabled className="mt-1.5 h-9 bg-gray-50" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">执行周期</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input type="date" value={data.startDate} disabled className="h-9 flex-1 bg-gray-50" />
                  <span className="text-sm text-gray-500">至</span>
                  <Input type="date" value={data.endDate} disabled className="h-9 flex-1 bg-gray-50" />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-700">描述</Label>
                <Textarea value={data.description} disabled className="mt-1.5 min-h-24 bg-gray-50" />
              </div>
            </div>
          </Card>
        </div>

        {/* ===== 模块二：预警规则（只读展示） ===== */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
            <h2 className="text-base font-semibold text-gray-900">预警规则</h2>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="p-4" style={{ minHeight: 200 }}>
              {data.rules.intersection.length === 0 && data.rules.union.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">暂无规则配置</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">规则编排</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>分支间=<Badge variant="secondary" className="text-xs">OR 并集</Badge></span>
                      <span>分支内=<Badge variant="secondary" className="text-xs">AND 交集</Badge></span>
                    </div>
                  </div>
                  {/* 交集条件 */}
                  {data.rules.intersection.length > 0 && (
                    <div className="border rounded-lg p-3 bg-blue-50/50 border-[#0085D0]">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-white text-xs bg-[#0085D0]">分支 1</Badge>
                        <span className="text-xs text-gray-500">以下条件同时满足(AND)</span>
                      </div>
                      <div className="space-y-2">
                        {data.rules.intersection.map((rule, idx) => (
                          <div key={idx} className="bg-white rounded px-3 py-2 border">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs shrink-0">指标</Badge>
                              <span className="text-sm text-gray-800 shrink-0">{rule.name}</span>
                              <span className="text-sm text-gray-500 font-mono">{rule.operator}</span>
                              <span className="text-sm text-gray-900 font-semibold">{rule.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 并集条件 */}
                  {data.rules.union.length > 0 && (
                    <>
                      <div className="flex items-center justify-center my-2">
                        <div className="px-3 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded">OR</div>
                      </div>
                      <div className="border rounded-lg p-3 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-white text-xs bg-gray-400">分支 2</Badge>
                          <span className="text-xs text-gray-500">以下条件同时满足(AND)</span>
                        </div>
                        <div className="space-y-2">
                          {data.rules.union.map((rule, idx) => (
                            <div key={idx} className="bg-white rounded px-3 py-2 border">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs shrink-0">指标</Badge>
                                <span className="text-sm text-gray-800 shrink-0">{rule.name}</span>
                                <span className="text-sm text-gray-500 font-mono">{rule.operator}</span>
                                <span className="text-sm text-gray-900 font-semibold">{rule.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {/* 更新周期 */}
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium text-gray-700">更新周期</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Select value={cycle.type} disabled>
                        <SelectTrigger className="w-28 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">实时</SelectItem>
                          <SelectItem value="daily">日</SelectItem>
                          <SelectItem value="weekly">周</SelectItem>
                          <SelectItem value="monthly">月</SelectItem>
                        </SelectContent>
                      </Select>
                      {cycle.type === 'daily' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">每日</span>
                          <Select value={cycle.hour} disabled>
                            <SelectTrigger className="w-16 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-gray-600">:</span>
                          <Select value={cycle.minute} disabled>
                            <SelectTrigger className="w-16 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['00', '15', '30', '45'].map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {cycle.type === 'weekly' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">每周</span>
                          <Select value={cycle.weekDay} disabled>
                            <SelectTrigger className="w-20 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['一', '二', '三', '四', '五', '六', '日'].map((d, i) => (
                                <SelectItem key={String(i + 1)} value={String(i + 1)}>周{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {cycle.type === 'monthly' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">每月</span>
                          <Select value={cycle.monthDay} disabled>
                            <SelectTrigger className="w-20 h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => String(i + 1)).map((d) => (
                                <SelectItem key={d} value={d}>{d}号</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ===== 模块三：执行配置（只读展示） ===== */}
        {!isTietongScene && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
              <h2 className="text-base font-semibold text-gray-900">执行配置</h2>
            </div>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">执行模式</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {EXECUTION_MODES.map((mode) => (
                      <button
                        key={mode.code}
                        className={cn(
                          'px-4 py-2 rounded-md text-sm border',
                          executionModeCode === mode.code
                            ? 'bg-[#0085D0] text-white border-[#0085D0]'
                            : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                        )}
                        disabled
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>
                {executionModeCode && executionModeCode !== 'custom' && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">执行角色</Label>
                    <div className="mt-2 space-y-2">
                      {data.executionRoles.split(/[,、]/).map((role) => {
                        const roleCode = EXECUTION_ROLES.find(r => r.name === role.trim())?.code;
                        return (
                          <label key={role.trim()} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-gray-50 border-gray-200 cursor-not-allowed">
                            <input type="checkbox" checked disabled className="w-4 h-4 rounded text-[#0085D0]" />
                            <span className="text-sm text-gray-400">{role.trim()}</span>
                            <span className="text-xs text-gray-400 ml-auto">(强制选中)</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 铁通特殊：仅一个执行角色 */}
        {isTietongScene && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
              <h2 className="text-base font-semibold text-gray-900">执行角色</h2>
            </div>
            <Card className="p-6">
              <Label className="text-sm font-medium text-gray-700">执行角色</Label>
              <div className="mt-2">
                <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-gray-50 border-gray-200 cursor-not-allowed">
                  <input type="checkbox" checked disabled className="w-4 h-4 rounded text-[#0085D0]" />
                  <span className="text-sm text-gray-400">铁通随销-网格通</span>
                  <span className="text-xs text-gray-400 ml-auto">(强制选中)</span>
                </label>
              </div>
            </Card>
          </div>
        )}

        {/* ===== 模块四：工单执行预览（只读） ===== */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
            <h2 className="text-base font-semibold text-gray-900">工单执行预览</h2>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">地市</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">执行模式</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">执行角色</th>
                </tr>
              </thead>
              <tbody>
                {CITIES.map((city, idx) => {
                  const cityConfig = data.cityConfig?.find(c => c.city === city);
                  const cityMode = cityConfig?.mode ?? (executionModeCode !== 'custom' ? data.executionMode : '—');
                  const cityRoles = cityConfig?.roles ?? data.executionRoles.split(/[,、]/).map(r => r.trim());
                  return (
                    <tr key={city} className={cn(idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}>
                      <td className="px-4 py-2.5 text-gray-900">{city}</td>
                      <td className="px-4 py-2.5 text-gray-600">{cityMode}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {cityRoles.map((role) => {
                            const isOn = true;
                            return (
                              <label key={role} className="flex items-center gap-1.5 text-sm text-gray-400">
                                <input type="checkbox" checked={isOn} disabled className="rounded border-gray-300" />
                                {role}
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        {/* ===== 驳回原因 ===== */}
        {data.rejectReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-600 font-medium text-sm">驳回原因：</span>
            <span className="text-red-600 text-sm">{data.rejectReason}</span>
          </div>
        )}

        {/* ===== 底部操作按钮 ===== */}
        <div className="py-4 flex justify-between items-center">
          <Button variant="outline" className="h-9" onClick={() => router.push('/workspace/insight/alert/config?tab=task')}>
            <ArrowLeft className="w-4 h-4 mr-1" />返回
          </Button>
          <div className="flex items-center gap-3">
            {canSubmit && (
              <Button className="bg-[#0085D0] hover:bg-[#006BB0] h-9" onClick={() => {
                setData(prev => prev ? { ...prev, approvalStatus: 'pending' } : prev);
                try {
                  const stored = localStorage.getItem('pendingWorkOrders');
                  const existing = stored ? JSON.parse(stored) : [];
                  const newOrder = {
                    id: `ALR${Date.now()}${Math.floor(Math.random() * 1000)}`,
                    title: `${data.name}-提交审批`,
                    type: '预警规则审批',
                    description: `预警规则"${data.name}"提交审批，审批通过后规则即生效。`,
                    orderStatus: 'processing', flowStatus: 'inProgress', timeoutStatus: 'normal', processResult: null,
                    customerPhone: '--',
                    alertType: '任务类',
                    businessScene: data.businessSceneName || '--',
                    executionMode: data.executionMode || '--',
                    currentStep: '三级经理审批', currentHandler: '新疆区公司三级经理',
                    city: '新疆', district: '--', grid: '--',
                    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                    creator: '新疆运营人员', createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                  };
                  localStorage.setItem('pendingWorkOrders', JSON.stringify([newOrder, ...existing]));
                } catch { /* ignore */ }
                toast.success('提交审批成功，已生成审批工单');
              }}>
                <SendHorizonal className="w-4 h-4 mr-1" />提交审批
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
