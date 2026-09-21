'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== 类型定义 ====================

interface RetentionActivity {
  id: number;
  name: string;
  activityId: string;
  execCycle: string;
  channel: string;
  operationPosition: string;
  status: string;
  creator: string;
  createTime: string;
}

interface OrderDetailData {
  taskId: string;
  taskName: string;
  businessTopic: string;
  taskSource: string;
  assigner: string;
  businessScene: string;
  taskCycle: string;
  remark: string;
  taskStatus: string;
  taskStatusColor: string;
  activities: RetentionActivity[];
  flowStatus: string;
}

// ==================== 模拟数据 ====================

const orderDetailMap: Record<string, OrderDetailData> = {
  'IND-2026-0802': {
    taskId: 'IND-2026-0802', taskName: '喀什全球通保有率提升任务', businessTopic: '存量运营', taskSource: '指标调度',
    assigner: 'admin01', businessScene: '全球通保有', taskCycle: '2026-08-04 ~ 2026-08-10',
    remark: '针对喀什全球通保有率低于92%的问题，执行保有提升任务。',
    taskStatus: '已完成', taskStatusColor: 'bg-green-500 text-white',
    activities: [
      { id: 1, name: '全球通客户专属权益推送', activityId: 'ACT-2026-0802-01', execCycle: '2026-08-04~08-06', channel: 'APP推送', operationPosition: '首页弹窗', status: '已完成', creator: '喀什运营人员', createTime: '2026-08-04 14:30:00' },
      { id: 2, name: '全球通客户生日关怀', activityId: 'ACT-2026-0802-02', execCycle: '2026-08-05~08-10', channel: '短信', operationPosition: '生日祝福短信', status: '已完成', creator: '喀什运营人员', createTime: '2026-08-04 15:00:00' },
    ],
    flowStatus: '已完成',
  },
  'STR-2026-0803': {
    taskId: 'STR-2026-0803', taskName: '阿克苏中高端客户维系任务', businessTopic: '存量运营', taskSource: '策略调度',
    assigner: 'admin01', businessScene: '中高端客户运营', taskCycle: '2026-08-03 ~ 2026-08-09',
    remark: '针对阿克苏中高端客户离网率超2%的问题，执行维系策略任务。',
    taskStatus: '已完成', taskStatusColor: 'bg-green-500 text-white',
    activities: [
      { id: 1, name: '中高端客户专属经理跟进', activityId: 'ACT-2026-0803-01', execCycle: '2026-08-03~08-07', channel: '电话外呼', operationPosition: '客户经理', status: '已完成', creator: '阿克苏运营人员', createTime: '2026-08-03 10:30:00' },
    ],
    flowStatus: '已完成',
  },
  'COD-2026-0805': {
    taskId: 'COD-2026-0805', taskName: '伊犁携转挽留任务', businessTopic: '存量运营', taskSource: '商机调度',
    assigner: 'admin01', businessScene: '携转挽留', taskCycle: '2026-08-01 ~ 2026-08-05',
    remark: '对伊犁携转意愿评分较高的客户执行挽留动作。',
    taskStatus: '已完成', taskStatusColor: 'bg-green-500 text-white',
    activities: [
      { id: 1, name: '携转高风险客户专属挽留', activityId: 'ACT-2026-0805-01', execCycle: '2026-08-01~08-04', channel: '电话外呼', operationPosition: '客户经理', status: '已完成', creator: '伊犁运营人员', createTime: '2026-08-01 09:30:00' },
      { id: 2, name: '携转客户优惠方案推送', activityId: 'ACT-2026-0805-02', execCycle: '2026-08-02~08-05', channel: '短信', operationPosition: '优惠通知', status: '已完成', creator: '伊犁运营人员', createTime: '2026-08-01 10:00:00' },
    ],
    flowStatus: '已完成',
  },
  'IND-2026-0811': {
    taskId: 'IND-2026-0811', taskName: '克拉玛依流量增收任务', businessTopic: '流量运营', taskSource: '指标调度',
    assigner: 'admin01', businessScene: '流量增收', taskCycle: '2026-07-18 ~ 2026-07-25',
    remark: '克拉玛依移动数据流量收入未达标，执行流量增收提升方案。',
    taskStatus: '已完成', taskStatusColor: 'bg-green-500 text-white',
    activities: [
      { id: 1, name: '低流量客户套餐升级推荐', activityId: 'ACT-2026-0811-01', execCycle: '2026-07-18~07-22', channel: 'APP推送', operationPosition: '套餐推荐', status: '已完成', creator: '克拉玛依运营人员', createTime: '2026-07-18 16:30:00' },
    ],
    flowStatus: '已完成',
  },
  'RAS-2026-0806': {
    taskId: 'RAS-2026-0806', taskName: '吐鲁番高昌区区域攻坚任务', businessTopic: '流量运营', taskSource: '区域攻坚调度',
    assigner: 'admin01', businessScene: '区域攻坚', taskCycle: '2026-07-30 ~ 2026-08-08',
    remark: '吐鲁番高昌区流量份额下降，执行区域攻坚任务。',
    taskStatus: '执行中', taskStatusColor: 'bg-blue-500 text-white',
    activities: [],
    flowStatus: '待派发',
  },
  'ALR-2026-0807': {
    taskId: 'ALR-2026-0807', taskName: '昌吉异动客户精准营销任务', businessTopic: '存量运营', taskSource: '预警调度',
    assigner: 'admin01', businessScene: '精准营销', taskCycle: '2026-07-28 ~ 2026-08-05',
    remark: '昌吉异动客户共42名，触发精准营销任务。',
    taskStatus: '执行中', taskStatusColor: 'bg-blue-500 text-white',
    activities: [],
    flowStatus: '待派发',
  },
  'STR-2026-0810': {
    taskId: 'STR-2026-0810', taskName: '石河子存量客户保有任务', businessTopic: '存量运营', taskSource: '策略调度',
    assigner: 'admin01', businessScene: '客户保有', taskCycle: '2026-07-20 ~ 2026-07-28',
    remark: '石河子存量客户保有任务执行情况。',
    taskStatus: '已完成', taskStatusColor: 'bg-green-500 text-white',
    activities: [
      { id: 1, name: '存量客户套餐续约提醒', activityId: 'ACT-2026-0810-01', execCycle: '2026-07-20~07-25', channel: '短信', operationPosition: '续约提醒', status: '已完成', creator: '石河子运营人员', createTime: '2026-07-20 10:00:00' },
    ],
    flowStatus: '已完成',
  },
};

// 任务信息字段
const taskInfoFields = [
  { label: '保有任务名称', key: 'taskName' },
  { label: '任务ID', key: 'taskId' },
  { label: '业务专题', key: 'businessTopic' },
  { label: '任务来源', key: 'taskSource' },
  { label: '指派人', key: 'assigner' },
  { label: '业务场景', key: 'businessScene' },
  { label: '任务周期时间', key: 'taskCycle' },
];

// 保有活动表格列
const activityColumns = ['序号', '活动名称', '活动ID', '执行周期', '执行渠道', '运营位', '当前状态', '创建人', '创建时间', '操作'];

export default function OrderDetailPage() {
  return <Suspense><OrderDetailContent /></Suspense>;
}

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'IND-2026-0802';

  const order = orderDetailMap[orderId] || orderDetailMap['IND-2026-0802'];

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 顶部面包屑 */}
      <div className="px-6 py-3 border-b bg-background flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回上一页
        </Button>
        <span className="text-muted-foreground">|</span>
        <span className="text-sm text-muted-foreground">我的保有任务</span>
        <span className="text-muted-foreground">&gt;</span>
        <span className="text-sm font-medium">任务详情</span>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* 区块1：任务信息 */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-base font-semibold">任务信息</h2>
            <span className={cn('text-xs px-3 py-1 rounded-full', order.taskStatusColor)}>{order.taskStatus}</span>
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {taskInfoFields.map(f => (
              <div key={f.key}>
                <p className="text-sm text-muted-foreground mb-1">{f.label}</p>
                <p className="text-sm font-medium">{(order as any)[f.key] || '—'}</p>
              </div>
            ))}
            <div className="col-span-3">
              <p className="text-sm text-muted-foreground mb-1">备注</p>
              <p className="text-sm font-medium">{order.remark}</p>
            </div>
          </div>
        </Card>

        {/* 区块2：关联保有活动信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">关联保有活动信息</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {activityColumns.map(col => (
                  <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activityColumns.length} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                </TableRow>
              ) : (
                order.activities.map(act => (
                  <TableRow key={act.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground">{act.id}</TableCell>
                    <TableCell className="text-sm font-medium">{act.name}</TableCell>
                    <TableCell className="text-sm">{act.activityId}</TableCell>
                    <TableCell className="text-sm">{act.execCycle}</TableCell>
                    <TableCell className="text-sm">{act.channel}</TableCell>
                    <TableCell className="text-sm">{act.operationPosition}</TableCell>
                    <TableCell className="text-sm">{act.status}</TableCell>
                    <TableCell className="text-sm">{act.creator}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{act.createTime}</TableCell>
                    <TableCell className="text-sm">
                      <button className="text-primary hover:underline">查看</button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* 区块3：工单执行流程跟踪 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">工单执行流程跟踪</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">任务状态：</span>
            <span className="text-sm font-medium">{order.flowStatus}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
