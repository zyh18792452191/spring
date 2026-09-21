'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, FileWarning, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Switch,
} from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ==================== 类型定义 ====================

type AlertMode = 'indicator' | 'task';

// 指标预警模拟数据
const indicatorMockData = [
  {
    id: '478091551351619585',
    name: '拍照中高端升档增收价值',
    level: '橙色预警',
    metricGroup: '拍照中高端升档增收价值',
    region: '新疆',
    granularity: '集团',
    scope: '全国',
    frequency: '周',
    effectiveTime: '2026-01-20 00:00:00',
    status: true,
  },
  {
    id: '478091551351619586',
    name: '客户离网风险预警',
    level: '红色预警',
    metricGroup: '客户离网风险预警',
    region: '新疆',
    granularity: '地州',
    scope: '全国',
    frequency: '日',
    effectiveTime: '2026-01-15 00:00:00',
    status: true,
  },
  {
    id: '478091551351619587',
    name: 'ARPU下降预警',
    level: '黄色预警',
    metricGroup: 'ARPU下降预警',
    region: '新疆',
    granularity: '地市',
    scope: '全国',
    frequency: '月',
    effectiveTime: '2026-01-10 00:00:00',
    status: false,
  },
];

// 5大预警类型一级分类
const ALERT_CATEGORY = [
  { code: 'retain', name: '保有类', enabled: false },
  { code: 'task', name: '任务类', enabled: true },
  { code: 'remind', name: '提醒类', enabled: false },
  { code: 'effect', name: '效果类', enabled: false },
  { code: 'expire', name: '到期类', enabled: false },
] as const;

// 业务类型（二级分类，从属于任务类）
const BUSINESS_SCENES = [
  { code: 'PORT_OUT', name: '携转预警' },
  { code: 'BROADBAND_CHURN', name: '宽带离网预警' },
  { code: 'GOTONE_CHURN', name: '全球通离网预警' },
  { code: 'COMPLAINT', name: '投诉工单预警' },
  { code: 'HOTLINE_OPP', name: '热线商机预警' },
  { code: 'ABNORMAL', name: '异动客户预警' },
  { code: 'GOTONE_TRACE', name: '全球通客户离网追溯' },
  { code: 'GOTONE_WINBACK', name: '全球通客户停机赢回预警' },
  { code: 'GOTONE_TIELONG', name: '全球通停机客户赢回-铁通预警' },
] as const;
type TaskAlertStatus = 'draft' | 'pending' | 'rejected' | 'active' | 'disabled' | 'expired';

// 规则条件接口
interface RuleCondition {
  name: string;
  operator: string;
  value: string;
}

// 任务预警模拟数据
const taskMockData = [
  {
    id: 'WRN20260701001',
    name: '乌鲁木齐携转预警-线上挽留',
    alertType: 'PORT_OUT',
    alertTypeName: '携转预警',
    customerType: '全量客户',
    businessTheme: '存量运营',
    updateCycle: '实时',
    executionChannel: '10088/网格经理',
    executionMode: '在线+分包看管执行',
    executionRoles: '网格经理、10088',
    approvalStatus: 'active' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-06-28 10:30:00',
    rules: {
      intersection: [
        { name: '携转意愿评分', operator: '≥', value: '80' },
        { name: 'ARPU值', operator: '≥', value: '58' },
      ] as RuleCondition[],
      union: [
        { name: '合约到期天数', operator: '≤', value: '30' },
        { name: '近30天投诉次数', operator: '≥', value: '2' },
      ] as RuleCondition[],
    },
  },
  {
    id: 'WRN20260701002',
    name: '全疆宽带离网预警-分包看管',
    alertType: 'BROADBAND_CHURN',
    alertTypeName: '宽带离网预警',
    customerType: '全量客户',
    businessTheme: '存量运营',
    updateCycle: '日 09:00',
    executionChannel: '地市集运',
    executionMode: '分包看管执行',
    executionRoles: '地市集运',
    approvalStatus: 'active' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-06-25 14:00:00',
    rules: {
      intersection: [
        { name: '宽带续费概率', operator: '≤', value: '0.3' },
        { name: '宽带到期天数', operator: '≤', value: '15' },
      ] as RuleCondition[],
      union: [] as RuleCondition[],
    },
  },
  {
    id: 'WRN20260701003',
    name: '全球通离网预警-分包看管',
    alertType: 'GOTONE_CHURN',
    alertTypeName: '全球通离网预警',
    customerType: '全球通客户',
    businessTheme: '存量运营',
    updateCycle: '日 09:00',
    executionChannel: '网格经理',
    executionMode: '分包看管执行',
    executionRoles: '网格经理',
    approvalStatus: 'pending' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-07-01 09:00:00',
    rules: {
      intersection: [
        { name: '全球通离网概率', operator: '≥', value: '0.6' },
        { name: '月均消费降幅', operator: '≥', value: '20%' },
      ] as RuleCondition[],
      union: [
        { name: '是否政企客户关键人', operator: '=', value: '否' },
      ] as RuleCondition[],
    },
  },
  {
    id: 'WRN20260701004',
    name: '热线商机预警-分包看管',
    alertType: 'HOTLINE_OPP',
    alertTypeName: '热线商机预警',
    customerType: '全量客户',
    businessTheme: '存量运营',
    updateCycle: '日 10:00',
    executionChannel: '地市集运',
    executionMode: '分包看管执行',
    executionRoles: '地市集运',
    approvalStatus: 'rejected' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-06-30 10:00:00',
    rejectReason: '执行角色配置不合理，热线商机应由网格经理负责，而非地市集运',
    rules: {
      intersection: [
        { name: '热线呼入次数', operator: '≥', value: '3' },
        { name: '意向标签', operator: '=', value: '升级套餐' },
      ] as RuleCondition[],
      union: [] as RuleCondition[],
    },
  },
  {
    id: 'WRN20260701005',
    name: '异动客户预警-分包看管',
    alertType: 'ABNORMAL',
    alertTypeName: '异动客户预警',
    customerType: '全量客户',
    businessTheme: '存量运营',
    updateCycle: '周 每周一',
    executionChannel: '网格经理',
    executionMode: '在线执行',
    executionRoles: '网格经理',
    approvalStatus: 'draft' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-07-01 16:00:00',
    rules: {
      intersection: [
        { name: '流量异动系数', operator: '≥', value: '2.0' },
        { name: '消费异动系数', operator: '≥', value: '1.5' },
      ] as RuleCondition[],
      union: [
        { name: '是否白金卡钻卡金卡', operator: '=', value: '是' },
      ] as RuleCondition[],
    },
  },
  {
    id: 'WRN20260701006',
    name: '全球通客户停机赢回预警',
    alertType: 'GOTONE_WINBACK',
    alertTypeName: '全球通客户停机赢回预警',
    customerType: '全球通客户',
    businessTheme: '存量运营',
    updateCycle: '月 每月1号',
    executionChannel: '地市集运',
    executionMode: '分包看管执行',
    executionRoles: '地市集运',
    approvalStatus: 'disabled' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-05-15 09:00:00',
    rules: {
      intersection: [
        { name: '停机天数', operator: '≤', value: '30' },
        { name: '历史ARPU', operator: '≥', value: '128' },
      ] as RuleCondition[],
      union: [] as RuleCondition[],
    },
  },
  {
    id: 'WRN20260701007',
    name: '投诉工单预警-在线执行',
    alertType: 'COMPLAINT',
    alertTypeName: '投诉工单预警',
    customerType: '全量客户',
    businessTheme: '存量运营',
    updateCycle: '实时',
    executionChannel: '10086',
    executionMode: '在线执行',
    executionRoles: '10086',
    approvalStatus: 'expired' as TaskAlertStatus,
    region: '新疆',
    createTime: '2026-04-01 08:00:00',
    rules: {
      intersection: [
        { name: '投诉工单数量', operator: '≥', value: '2' },
        { name: '投诉级别', operator: '=', value: '严重' },
      ] as RuleCondition[],
      union: [] as RuleCondition[],
    },
  },
];

// 审批状态配置
const statusConfig: Record<TaskAlertStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  pending: { label: '审批中', color: 'bg-amber-50 text-amber-600' },
  rejected: { label: '已驳回', color: 'bg-red-50 text-red-600' },
  active: { label: '已生效', color: 'bg-emerald-50 text-emerald-600' },
  disabled: { label: '已停用', color: 'bg-gray-100 text-gray-500' },
  expired: { label: '已失效', color: 'bg-gray-50 text-gray-400 line-through' },
};

export default function AlertConfigPage() {
  return <Suspense><AlertConfigContent /></Suspense>;
}

function AlertConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [alertMode, setAlertMode] = useState<AlertMode>((searchParams.get('tab') as AlertMode) || 'indicator');
  const [taskData, setTaskData] = useState(taskMockData);

  // 指标预警筛选
  const [region, setRegion] = useState('全国');
  const [alertLevel, setAlertLevel] = useState('');
  const [status, setStatus] = useState('');
  const [metricGroup, setMetricGroup] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');

  // 任务预警筛选
  const [alertCategory, setAlertCategory] = useState('');
  const [taskAlertType, setTaskAlertType] = useState('');
  const [taskChannel, setTaskChannel] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [taskRegion, setTaskRegion] = useState('');

  // 详情弹窗
  // 指标预警详情弹窗

  const getLevelColor = (level: string) => {
    switch (level) {
      case '红色预警':
        return 'text-red-600 bg-red-50';
      case '橙色预警':
        return 'text-orange-600 bg-orange-50';
      case '黄色预警':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-full">
      {/* Tab切换 */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
              alertMode === 'indicator'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setAlertMode('indicator')}
          >
            <AlertTriangle className="w-4 h-4" />
            指标预警
          </button>
          <button
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
              alertMode === 'task'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setAlertMode('task')}
          >
            <FileWarning className="w-4 h-4" />
            任务预警
          </button>
        </div>
      </div>

      {/* 顶部操作区 */}
      <div className="px-6 py-4 flex justify-between items-center">
        <div></div>
        <Button
          className="bg-[#0085D0] hover:bg-[#006BB0]"
          onClick={() => router.push(`/workspace/insight/alert/config/new?type=${alertMode}`)}
        >
          <Plus className="w-4 h-4 mr-2" />
          新增规则
        </Button>
      </div>

      {alertMode === 'indicator' ? (
        <>
          {/* 指标预警筛选搜索区域 - 保持原样 */}
          <Card className="mx-6 mb-4 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">归属区域</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="选择归属区域" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="新疆">新疆</SelectItem>
                    <SelectItem value="乌鲁木齐">乌鲁木齐</SelectItem>
                    <SelectItem value="克拉玛依">克拉玛依</SelectItem>
                    <SelectItem value="吐鲁番">吐鲁番</SelectItem>
                    <SelectItem value="哈密">哈密</SelectItem>
                    <SelectItem value="昌吉">昌吉</SelectItem>
                    <SelectItem value="博州">博州</SelectItem>
                    <SelectItem value="巴州">巴州</SelectItem>
                    <SelectItem value="阿克苏">阿克苏</SelectItem>
                    <SelectItem value="克州">克州</SelectItem>
                    <SelectItem value="喀什">喀什</SelectItem>
                    <SelectItem value="和田">和田</SelectItem>
                    <SelectItem value="伊犁">伊犁</SelectItem>
                    <SelectItem value="塔城">塔城</SelectItem>
                    <SelectItem value="阿勒泰">阿勒泰</SelectItem>
                    <SelectItem value="奎屯">奎屯</SelectItem>
                    <SelectItem value="石河子">石河子</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">预警等级</label>
                <Select value={alertLevel} onValueChange={setAlertLevel}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="选择预警等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="红色预警">红色预警</SelectItem>
                    <SelectItem value="橙色预警">橙色预警</SelectItem>
                    <SelectItem value="黄色预警">黄色预警</SelectItem>
                    <SelectItem value="蓝色预警">蓝色预警</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">状态</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">启用</SelectItem>
                    <SelectItem value="disabled">已停用</SelectItem>
                    <SelectItem value="expired">已失效</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">关联指标组</label>
                <div className="relative">
                  <Input
                    placeholder="输入关联指标组"
                    value={metricGroup}
                    onChange={(e) => setMetricGroup(e.target.value)}
                    className="w-64 h-9 pr-8"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" className="text-[#0085D0] hover:text-[#006BB0] p-0 h-9">
                  展开<ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                <Button variant="outline" className="h-9 border-gray-300">
                  <RotateCcw className="w-4 h-4 mr-1" />重置
                </Button>
                <Button className="bg-[#0085D0] hover:bg-[#006BB0] h-9">
                  <Search className="w-4 h-4 mr-1" />搜索
                </Button>
              </div>
            </div>
          </Card>

          {/* 指标预警表格 - 保持原样 */}
          <Card className="mx-6 mb-4 flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="font-semibold text-gray-900">预警编码</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警名称</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警等级</TableHead>
                  <TableHead className="font-semibold text-gray-900">关联指标组</TableHead>
                  <TableHead className="font-semibold text-gray-900">归属区域</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警粒度</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警范围</TableHead>
                  <TableHead className="font-semibold text-gray-900">提醒频率</TableHead>
                  <TableHead className="font-semibold text-gray-900">生效时间</TableHead>
                  <TableHead className="font-semibold text-gray-900">状态</TableHead>
                  <TableHead className="font-semibold text-gray-900">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicatorMockData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{item.id}</TableCell>
                    <TableCell className="text-gray-900">{item.name}</TableCell>
                    <TableCell>
                      <span className={cn('px-2 py-1 rounded text-xs', getLevelColor(item.level))}>
                        {item.level}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-900">{item.metricGroup}</TableCell>
                    <TableCell className="text-gray-900">{item.region}</TableCell>
                    <TableCell className="text-gray-900">{item.granularity}</TableCell>
                    <TableCell className="text-gray-900">{item.scope}</TableCell>
                    <TableCell className="text-gray-900">{item.frequency}</TableCell>
                    <TableCell className="text-gray-900">{item.effectiveTime}</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.status}
                        onCheckedChange={(checked) => console.log('切换状态:', item.id, checked)}
                        className="data-[state=checked]:bg-[#0085D0]"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" className="text-[#0085D0] hover:text-[#006BB0] p-0 h-auto" onClick={() => router.push(`/workspace/insight/alert/config/${item.id}`)}>详情</Button>
                        <Button variant="ghost" className="text-[#0085D0] hover:text-[#006BB0] p-0 h-auto" onClick={() => router.push(`/workspace/insight/alert/config/new?id=${item.id}&type=indicator`)}>编辑</Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-700 p-0 h-auto">删除</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <>
          {/* 任务预警筛选区域 */}
          <Card className="mx-6 mb-4 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">预警类型</label>
                <Select value={alertCategory} onValueChange={(v) => { setAlertCategory(v); setTaskAlertType(''); }}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="选择预警类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALERT_CATEGORY.map((c) => (
                      <SelectItem key={c.code} value={c.code} disabled={!c.enabled}>
                        {c.name}{!c.enabled ? '（未启用）' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {alertCategory && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">业务类型</label>
                  <Select value={taskAlertType} onValueChange={setTaskAlertType}>
                    <SelectTrigger className="w-48 h-9">
                      <SelectValue placeholder="选择业务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_SCENES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">执行渠道</label>
                <Select value={taskChannel} onValueChange={setTaskChannel}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="选择执行渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">网格经理</SelectItem>
                    <SelectItem value="central">地市集运</SelectItem>
                    <SelectItem value="10088">10088</SelectItem>
                    <SelectItem value="10086">10086</SelectItem>
                    <SelectItem value="enterprise">政企客户经理</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">审批状态</label>
                <Select value={taskStatus} onValueChange={setTaskStatus}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="选择审批状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="pending">审批中</SelectItem>
                    <SelectItem value="rejected">已驳回</SelectItem>
                    <SelectItem value="active">已生效</SelectItem>
                    <SelectItem value="disabled">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">归属区域</label>
                <Select value={taskRegion} onValueChange={setTaskRegion}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="选择归属区域" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="新疆">新疆</SelectItem>
                    <SelectItem value="乌鲁木齐">乌鲁木齐</SelectItem>
                    <SelectItem value="克拉玛依">克拉玛依</SelectItem>
                    <SelectItem value="吐鲁番">吐鲁番</SelectItem>
                    <SelectItem value="哈密">哈密</SelectItem>
                    <SelectItem value="昌吉">昌吉</SelectItem>
                    <SelectItem value="博州">博州</SelectItem>
                    <SelectItem value="巴州">巴州</SelectItem>
                    <SelectItem value="阿克苏">阿克苏</SelectItem>
                    <SelectItem value="克州">克州</SelectItem>
                    <SelectItem value="喀什">喀什</SelectItem>
                    <SelectItem value="和田">和田</SelectItem>
                    <SelectItem value="伊犁">伊犁</SelectItem>
                    <SelectItem value="塔城">塔城</SelectItem>
                    <SelectItem value="阿勒泰">阿勒泰</SelectItem>
                    <SelectItem value="奎屯">奎屯</SelectItem>
                    <SelectItem value="石河子">石河子</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" className="h-9 border-gray-300">
                  <RotateCcw className="w-4 h-4 mr-1" />重置
                </Button>
                <Button className="bg-[#0085D0] hover:bg-[#006BB0] h-9">
                  <Search className="w-4 h-4 mr-1" />搜索
                </Button>
              </div>
            </div>
          </Card>

          {/* 任务预警表格 */}
          <Card className="mx-6 mb-4 flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="font-semibold text-gray-900">预警编码</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警名称</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警类型</TableHead>
                  <TableHead className="font-semibold text-gray-900">业务类型</TableHead>
                  <TableHead className="font-semibold text-gray-900">客户类型</TableHead>
                  <TableHead className="font-semibold text-gray-900">更新周期</TableHead>
                  <TableHead className="font-semibold text-gray-900">执行渠道</TableHead>
                  <TableHead className="font-semibold text-gray-900">归属区域</TableHead>
                  <TableHead className="font-semibold text-gray-900">审批状态</TableHead>
                  <TableHead className="font-semibold text-gray-900">创建时间</TableHead>
                  <TableHead className="font-semibold text-gray-900">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskData.map((item) => {
                  const cfg = statusConfig[item.approvalStatus];
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="text-gray-900 font-mono text-sm">{item.id}</TableCell>
                      <TableCell className="text-gray-900 max-w-[200px] truncate" title={item.name}>{item.name}</TableCell>
                      <TableCell className="text-gray-900">任务类</TableCell>
                      <TableCell className="text-gray-900">{item.alertTypeName}</TableCell>
                      <TableCell className="text-gray-900">{item.customerType}</TableCell>
                      <TableCell className="text-gray-900">{item.updateCycle}</TableCell>
                      <TableCell className="text-gray-900">{item.executionChannel}</TableCell>
                      <TableCell className="text-gray-900">{item.region}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-xs', cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900 text-sm">{item.createTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" className="text-[#0085D0] hover:text-[#006BB0] p-0 h-auto" onClick={() => router.push(`/workspace/insight/alert/config/${item.id}`)}>详情</Button>
                          {item.approvalStatus === 'draft' || item.approvalStatus === 'rejected' || item.approvalStatus === 'disabled' ? (
                            <Button variant="ghost" className="text-[#0085D0] hover:text-[#006BB0] p-0 h-auto" onClick={() => router.push(`/workspace/insight/alert/config/new?id=${item.id}&type=task`)}>编辑</Button>
                          ) : null}
                          {item.approvalStatus === 'pending' ? (
                            <Button variant="ghost" className="text-amber-500 hover:text-amber-700 p-0 h-auto" onClick={() => { const updated = taskData.map(d => d.id === item.id ? { ...d, approvalStatus: 'draft' as TaskAlertStatus } : d); setTaskData(updated); }}>撤回</Button>
                          ) : null}
                          {item.approvalStatus === 'active' ? (
                            <Button variant="ghost" className="text-amber-500 hover:text-amber-700 p-0 h-auto" onClick={() => { const updated = taskData.map(d => d.id === item.id ? { ...d, approvalStatus: 'disabled' as TaskAlertStatus } : d); setTaskData(updated); }}>停用</Button>
                          ) : null}
                          {item.approvalStatus === 'disabled' ? (
                            <Button variant="ghost" className="text-emerald-500 hover:text-emerald-700 p-0 h-auto">启用</Button>
                          ) : null}
                          {item.approvalStatus === 'draft' || item.approvalStatus === 'rejected' || item.approvalStatus === 'expired' ? (
                            <Button variant="ghost" className="text-red-500 hover:text-red-700 p-0 h-auto">删除</Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* 分页区域 */}
      <div className="px-6 pb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          共 {alertMode === 'indicator' ? indicatorMockData.length : taskData.length} 项数据
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
              <SelectItem value="100">100条/页</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="w-9 h-9" disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="w-9 h-9 bg-[#0085D0] text-white border-[#0085D0] hover:bg-[#006BB0]">
            1
          </Button>
          <Button variant="outline" size="icon" className="w-9 h-9" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-600">前往</span>
            <Input type="number" defaultValue="1" className="w-16 h-9 text-center" />
            <Button variant="outline" className="h-9">Go</Button>
          </div>
          <span className="text-sm text-gray-600 ml-2">1页</span>
        </div>
      </div>

      {/* 任务预警详情弹窗 */}

      {/* 指标预警详情弹窗 */}
    </div>
  );
}
