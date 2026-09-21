'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Paperclip } from 'lucide-react';

// ==================== 类型定义 ====================

type DetailStatus = '待评分' | '已完成' | '已驳回' | '已下线';

interface RelatedOrder {
  orderId: string;
  orderName: string;
  orderType: string;
  orderStatus: string;
  businessTopic: string;
  businessScene: string;
  issueTime: string;
  deadline: string;
  execOrg: string;
  executor: string;
}

interface TaskDetailFull {
  id: string;
  name: string;
  issueTime: string;
  relatedTask: string;
  status: DetailStatus;
  type: string;
  level: string;
  initiator: string;
  content: string;
  // 处理结果
  receiptTime?: string;
  isCompleted?: string;
  remark?: string;
  approvalResult?: string;
  approvalTime?: string;
  rejectReason?: string;
  orders: RelatedOrder[];
}

// ==================== 模拟数据 ====================

const taskDetailMap: Record<string, TaskDetailFull> = {
  'SUP-2026-0802': {
    id: 'SUP-2026-0802', name: '喀什全球通保有率督办', issueTime: '2026-08-04 14:00:00', relatedTask: 'IND-2026-0802',
    status: '待评分', type: '指标督办', level: '紧急', initiator: '新疆市场部领导',
    content: '喀什全球通保有率低于92%，请跟进维系策略执行效果。',
    receiptTime: '2026-08-06 10:30:00', isCompleted: '是', remark: '已执行全球通客户维系策略，触达客户156户，预计保有率提升至93.5%。',
    orders: [
      { orderId: 'IND-2026-0802', orderName: '喀什全球通保有率提升工单', orderType: '指标调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '全球通保有', issueTime: '2026-08-04 14:00:00', deadline: '2026-08-10 18:00:00', execOrg: '喀什分公司', executor: '喀什运营人员' },
    ],
  },
  'SUP-2026-0803': {
    id: 'SUP-2026-0803', name: '阿克苏中高端客户离网督办', issueTime: '2026-08-03 10:15:00', relatedTask: 'STR-2026-0803',
    status: '待评分', type: '策略督办', level: '重要', initiator: '新疆运营人员',
    content: '阿克苏中高端客户离网率超2%，请执行维系策略并反馈。',
    receiptTime: '2026-08-05 16:00:00', isCompleted: '是', remark: '已对离网风险客户执行专属维系方案，触达89户，挽留成功23户。',
    orders: [
      { orderId: 'STR-2026-0803', orderName: '阿克苏中高端维系策略工单', orderType: '策略调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '中高端客户运营', issueTime: '2026-08-03 10:15:00', deadline: '2026-08-09 18:00:00', execOrg: '阿克苏分公司', executor: '阿克苏运营人员' },
    ],
  },
  'SUP-2026-0810': {
    id: 'SUP-2026-0810', name: '石河子存量客户保有督办', issueTime: '2026-07-20 09:45:00', relatedTask: 'STR-2026-0810',
    status: '待评分', type: '策略督办', level: '重要', initiator: '新疆市场部领导',
    content: '石河子存量客户保有任务执行情况，请反馈回执。',
    receiptTime: '2026-07-25 11:00:00', isCompleted: '是', remark: '已完成存量客户保有任务，触达客户320户，保有率达95.2%。',
    orders: [
      { orderId: 'STR-2026-0810', orderName: '石河子存量客户保有工单', orderType: '策略调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '客户保有', issueTime: '2026-07-20 09:45:00', deadline: '2026-07-28 18:00:00', execOrg: '石河子分公司', executor: '石河子运营人员' },
    ],
  },
  'SUP-2026-0804': {
    id: 'SUP-2026-0804', name: '塔城宽带续费督办', issueTime: '2026-08-02 16:30:00', relatedTask: 'CG-2026-0804',
    status: '已完成', type: '客群督办', level: '普通', initiator: '新疆市场部领导',
    content: '塔城宽带续费概率偏低，请跟进续费提醒执行情况。',
    receiptTime: '2026-08-04 09:00:00', isCompleted: '是', remark: '已完成宽带续费提醒，触达客户86户，续费成功41户。',
    approvalResult: '审批通过', approvalTime: '2026-08-04 15:30:00',
    orders: [],
  },
  'SUP-2026-0805': {
    id: 'SUP-2026-0805', name: '伊犁携转挽留督办', issueTime: '2026-08-01 09:00:00', relatedTask: 'COD-2026-0805',
    status: '已完成', type: '商机督办', level: '重要', initiator: '新疆运营人员',
    content: '伊犁携转意愿评分较高的客户，请执行挽留动作。',
    receiptTime: '2026-08-03 14:00:00', isCompleted: '是', remark: '已对15名携转高风险客户执行挽留，成功挽留11户。',
    approvalResult: '审批通过', approvalTime: '2026-08-03 17:00:00',
    orders: [
      { orderId: 'COD-2026-0805', orderName: '伊犁携转挽留工单', orderType: '商机调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '携转挽留', issueTime: '2026-08-01 09:00:00', deadline: '2026-08-05 18:00:00', execOrg: '伊犁分公司', executor: '伊犁运营人员' },
    ],
  },
  'SUP-2026-0811': {
    id: 'SUP-2026-0811', name: '克拉玛依流量增收督办', issueTime: '2026-07-18 16:00:00', relatedTask: 'IND-2026-0811',
    status: '已完成', type: '指标督办', level: '紧急', initiator: '新疆运营人员',
    content: '克拉玛依移动数据流量收入未达标，请执行提升方案。',
    receiptTime: '2026-07-22 10:00:00', isCompleted: '是', remark: '已执行流量增收方案，触达客户210户，流量收入环比增长8.5%。',
    approvalResult: '审批通过', approvalTime: '2026-07-22 16:00:00',
    orders: [
      { orderId: 'IND-2026-0811', orderName: '克拉玛依流量增收工单', orderType: '指标调度', orderStatus: '已完成', businessTopic: '流量运营', businessScene: '流量增收', issueTime: '2026-07-18 16:00:00', deadline: '2026-07-25 18:00:00', execOrg: '克拉玛依分公司', executor: '克拉玛依运营人员' },
    ],
  },
  'SUP-2026-0806': {
    id: 'SUP-2026-0806', name: '吐鲁番区域攻坚督办', issueTime: '2026-07-30 11:20:00', relatedTask: 'RAS-2026-0806',
    status: '已驳回', type: '区域攻坚督办', level: '紧急', initiator: '新疆市场部领导',
    content: '吐鲁番高昌区流量份额下降，请执行区域攻坚并反馈。',
    receiptTime: '2026-08-02 09:00:00', isCompleted: '是', remark: '已执行区域攻坚，触达小区15个。',
    approvalResult: '驳回', approvalTime: '2026-08-02 14:00:00', rejectReason: '反馈内容不完整，缺少具体执行数据与客户触达明细，请补充后重新提交。',
    orders: [
      { orderId: 'RAS-2026-0806', orderName: '吐鲁番高昌区区域攻坚工单', orderType: '区域攻坚调度', orderStatus: '执行中', businessTopic: '流量运营', businessScene: '区域攻坚', issueTime: '2026-07-30 11:20:00', deadline: '2026-08-08 18:00:00', execOrg: '吐鲁番分公司', executor: '吐鲁番运营人员' },
    ],
  },
  'SUP-2026-0807': {
    id: 'SUP-2026-0807', name: '昌吉异动客户营销督办', issueTime: '2026-07-28 15:45:00', relatedTask: 'ALR-2026-0807',
    status: '已驳回', type: '预警督办', level: '普通', initiator: '新疆运营人员',
    content: '昌吉异动客户共42名，请触发精准营销并反馈结果。',
    receiptTime: '2026-07-30 10:00:00', isCompleted: '否', remark: '已触发营销但未全部完成。',
    approvalResult: '驳回', approvalTime: '2026-07-30 15:00:00', rejectReason: '未提供营销方案的执行效果数据，请补充转化率与客户反馈信息。',
    orders: [
      { orderId: 'ALR-2026-0807', orderName: '昌吉异动客户营销工单', orderType: '预警调度', orderStatus: '执行中', businessTopic: '存量运营', businessScene: '精准营销', issueTime: '2026-07-28 15:45:00', deadline: '2026-08-05 18:00:00', execOrg: '昌吉分公司', executor: '昌吉运营人员' },
    ],
  },
  'SUP-2026-0808': {
    id: 'SUP-2026-0808', name: '巴州投诉工单处理督办', issueTime: '2026-07-25 10:00:00', relatedTask: 'ALR-2026-0808',
    status: '已下线', type: '预警督办', level: '重要', initiator: '新疆市场部领导',
    content: '巴州投诉工单量环比增长45%，请跟进处理进度。',
    orders: [],
  },
  'SUP-2026-0812': {
    id: 'SUP-2026-0812', name: '博州全球通离网追溯督办', issueTime: '2026-07-15 11:30:00', relatedTask: 'ALR-2026-0812',
    status: '已下线', type: '预警督办', level: '普通', initiator: '新疆市场部领导',
    content: '博州全球通客户离网追溯任务，请跟进执行。',
    orders: [],
  },
};

// ==================== 基本信息字段配置 ====================

const baseInfoFields = [
  { label: '督办名称', key: 'name' },
  { label: '下发时间', key: 'issueTime' },
  { label: '督办任务状态', key: 'status' },
  { label: '督办类型', key: 'type' },
  { label: '发起人', key: 'initiator' },
];

// 工单表格列
const orderColumns = ['工单名称', '工单ID', '工单类型', '工单状态', '业务专题', '业务场景', '下发时间', '截止时间', '执行组织', '执行人', '操作'];

export default function DetailSupervisionPage() {
  return <Suspense><DetailSupervisionContent /></Suspense>;
}

function DetailSupervisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || 'SUP-2026-0802';
  const fromPath = searchParams.get('fromPath');

  const task = taskDetailMap[taskId] || taskDetailMap['SUP-2026-0802'];

  const handleBack = () => {
    if (fromPath) {
      router.push(decodeURIComponent(fromPath));
    } else {
      router.push('/workspace/dispatch/my-supervision');
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/workspace/dispatch/my-supervision/order-detail?orderId=${orderId}`);
  };

  // 是否展示处理结果区块（已下线状态无此区块）
  const showProcessResult = task.status !== '已下线';

  // 处理结果字段渲染配置
  const renderProcessResultFields = () => {
    const fields: { label: string; value: string; highlight?: boolean }[] = [];

    // 已完成/已驳回：审批结果 + 审批时间
    if (task.status === '已完成' || task.status === '已驳回') {
      fields.push({ label: '审批结果', value: task.approvalResult || '—', highlight: task.status === '已驳回' });
      fields.push({ label: '审批时间', value: task.approvalTime || '—' });
    }
    // 已驳回：驳回原因
    if (task.status === '已驳回' && task.rejectReason) {
      fields.push({ label: '驳回原因', value: task.rejectReason, highlight: true });
    }
    // 回执时间
    if (task.receiptTime) fields.push({ label: '回执时间', value: task.receiptTime });
    // 是否已完成
    if (task.isCompleted) fields.push({ label: '是否已完成', value: task.isCompleted });
    // 备注
    if (task.remark) fields.push({ label: '备注', value: task.remark });

    return fields;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 顶部面包屑 */}
      <div className="px-6 py-3 border-b bg-background flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回上一页
        </Button>
        <span className="text-muted-foreground">|</span>
        <span className="text-sm font-medium">查看督办详情</span>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* 区块1：督办任务处理结果（已下线无此区块） */}
        {showProcessResult && (
          <Card className="p-5">
            <h2 className="text-base font-semibold mb-4">督办任务处理结果</h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-4">
              {renderProcessResultFields().map((f, idx) => (
                <div key={idx} className={f.label === '驳回原因' ? 'col-span-3' : ''}>
                  <p className="text-sm text-muted-foreground mb-1">{f.label}</p>
                  <p className={`text-sm font-medium ${f.highlight ? 'text-red-600' : ''}`}>{f.value}</p>
                </div>
              ))}
            </div>
            {/* 关联工单表格 */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">关联工单</p>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {orderColumns.map(col => (
                      <TableHead key={col} className={col === '工单名称' ? '' : 'whitespace-nowrap'}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {task.orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={orderColumns.length} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    task.orders.map(order => (
                      <TableRow key={order.orderId} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-medium">{order.orderName}</TableCell>
                        <TableCell className="text-sm">{order.orderId}</TableCell>
                        <TableCell className="text-sm">{order.orderType}</TableCell>
                        <TableCell className="text-sm">{order.orderStatus}</TableCell>
                        <TableCell className="text-sm">{order.businessTopic}</TableCell>
                        <TableCell className="text-sm">{order.businessScene}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{order.issueTime}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{order.deadline}</TableCell>
                        <TableCell className="text-sm">{order.execOrg}</TableCell>
                        <TableCell className="text-sm">{order.executor}</TableCell>
                        <TableCell className="text-sm">
                          <button className="text-primary hover:underline" onClick={() => handleViewOrder(order.orderId)}>查看详情</button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* 区块2：基本信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {baseInfoFields.map(f => (
              <div key={f.key}>
                <p className="text-sm text-muted-foreground mb-1">{f.label}</p>
                <p className="text-sm font-medium">{(task as any)[f.key] || '—'}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 区块3：督办信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办信息</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">督办内容</p>
              <div className="text-sm bg-muted/30 rounded-md p-3 min-h-[60px]">{task.content}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">附件</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Paperclip className="w-4 h-4" />
                <span>暂无附件</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 底部按钮 */}
      <div className="px-6 py-3 border-t bg-background flex justify-center">
        <Button onClick={handleBack}>返回</Button>
      </div>
    </div>
  );
}
