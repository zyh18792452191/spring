'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

// ==================== 类型定义 ====================

interface RelatedOrder {
  orderName: string;
  orderId: string;
  orderType: string;
  orderStatus: string;
  businessTopic: string;
  businessScene: string;
  issueTime: string;
  deadline: string;
  execOrg: string;
  executor: string;
}

interface Supervisor {
  org: string;
  name: string;
}

interface FlowNode {
  node: string;
  result: string;
  processTime: string;
  feedback: string;
}

interface SupervisionDetail {
  id: string;
  // 处理结果
  approvalResult: string;
  approvalTime: string;
  receiptTime: string;
  isCompleted: string;
  remark: string;
  supervisionLevel: string;
  relatedTask: string;
  // 基本信息
  name: string;
  status: string;
  type: string;
  // 督办信息
  supervisors: Supervisor[];
  content: string;
  // 工单
  orders: RelatedOrder[];
  // 流程跟踪
  flowNodes: FlowNode[];
}

// ==================== 模拟数据 ====================

const detailMap: Record<string, SupervisionDetail> = {
  'SUPV-2026-001': {
    id: 'SUPV-2026-001',
    approvalResult: '', approvalTime: '', receiptTime: '', isCompleted: '', remark: '', supervisionLevel: '-', relatedTask: '保有任务-乌鲁木齐5G流量提升',
    name: '乌鲁木齐5G流量提升督办', status: '待执行', type: '保有任务督办',
    supervisors: [{ org: '乌鲁木齐市分公司', name: '李主管' }],
    content: '针对乌鲁木齐当月DOU未达标问题，督办执行流量提升方案。',
    orders: [
      { orderName: '乌鲁木齐5G流量提升工单', orderId: 'IND-2026-0801', orderType: '指标调度', orderStatus: '待执行', businessTopic: '流量运营', businessScene: '流量增收', issueTime: '2026-08-05 09:30:00', deadline: '2026-08-15 18:00:00', execOrg: '乌鲁木齐市分公司', executor: '乌鲁木齐运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-05 10:00:00', feedback: '' },
    ],
  },
  'SUPV-2026-002': {
    id: 'SUPV-2026-002',
    approvalResult: '待确认', approvalTime: '', receiptTime: '2026-08-06 10:30:00', isCompleted: '是', remark: '已执行全球通客户维系策略，触达客户156户，预计保有率提升至93.5%。', supervisionLevel: '-', relatedTask: '保有任务-喀什全球通保有率提升',
    name: '喀什全球通保有率督办', status: '待确认', type: '保有任务督办',
    supervisors: [{ org: '喀什分公司', name: '李主管' }],
    content: '喀什全球通保有率低于92%，督办维系策略执行效果。',
    orders: [
      { orderName: '喀什全球通保有率提升工单', orderId: 'IND-2026-0802', orderType: '指标调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '全球通保有', issueTime: '2026-08-04 14:00:00', deadline: '2026-08-12 18:00:00', execOrg: '喀什分公司', executor: '喀什运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-04 15:00:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-06 10:30:00', feedback: '已执行全球通客户维系策略' },
    ],
  },
  'SUPV-2026-003': {
    id: 'SUPV-2026-003',
    approvalResult: '待确认', approvalTime: '', receiptTime: '2026-08-05 16:00:00', isCompleted: '是', remark: '已对离网风险客户执行专属维系方案，触达89户，挽留成功23户。', supervisionLevel: '-', relatedTask: '预警工单-阿克苏中高端客户离网',
    name: '阿克苏中高端客户离网督办', status: '待确认', type: '预警工单督办',
    supervisors: [{ org: '阿克苏分公司', name: '王经理' }],
    content: '阿克苏中高端客户离网率超2%，督办维系策略执行。',
    orders: [
      { orderName: '阿克苏中高端维系策略工单', orderId: 'STR-2026-0803', orderType: '策略调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '中高端客户运营', issueTime: '2026-08-03 10:15:00', deadline: '2026-08-10 18:00:00', execOrg: '阿克苏分公司', executor: '阿克苏运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-03 11:00:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-05 16:00:00', feedback: '已对离网风险客户执行专属维系方案' },
    ],
  },
  'SUPV-2026-004': {
    id: 'SUPV-2026-004',
    approvalResult: '审批通过', approvalTime: '2026-08-04 15:30:00', receiptTime: '2026-08-04 09:00:00', isCompleted: '是', remark: '已完成宽带续费提醒，触达客户86户，续费成功41户。', supervisionLevel: '-', relatedTask: '保有任务-塔城宽带续费',
    name: '塔城宽带续费督办', status: '已完成', type: '保有任务督办',
    supervisors: [{ org: '塔城分公司', name: '王经理' }],
    content: '塔城宽带续费概率偏低，督办续费提醒执行情况。',
    orders: [],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-02 17:00:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-04 09:00:00', feedback: '已完成宽带续费提醒' },
      { node: '审批结果', result: '审批通过', processTime: '2026-08-04 15:30:00', feedback: '执行效果良好' },
    ],
  },
  'SUPV-2026-005': {
    id: 'SUPV-2026-005',
    approvalResult: '审批通过', approvalTime: '2026-08-03 17:00:00', receiptTime: '2026-08-03 14:00:00', isCompleted: '是', remark: '已对15名携转高风险客户执行挽留，成功挽留11户。', supervisionLevel: '-', relatedTask: '预警工单-伊犁携转挽留',
    name: '伊犁携转挽留督办', status: '已完成', type: '预警工单督办',
    supervisors: [{ org: '伊犁分公司', name: '孙主管' }],
    content: '伊犁携转意愿评分较高的客户，督办挽留动作执行。',
    orders: [
      { orderName: '伊犁携转挽留工单', orderId: 'COD-2026-0805', orderType: '商机调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '携转挽留', issueTime: '2026-08-01 09:00:00', deadline: '2026-08-06 18:00:00', execOrg: '伊犁分公司', executor: '伊犁运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-01 10:00:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-03 14:00:00', feedback: '已对15名携转高风险客户执行挽留' },
      { node: '审批结果', result: '审批通过', processTime: '2026-08-03 17:00:00', feedback: '挽留效果达标' },
    ],
  },
  'SUPV-2026-006': {
    id: 'SUPV-2026-006',
    approvalResult: '驳回', approvalTime: '2026-08-02 14:00:00', receiptTime: '2026-08-02 09:00:00', isCompleted: '是', remark: '已执行区域攻坚，触达小区15个。', supervisionLevel: '-', relatedTask: '其他任务-吐鲁番区域攻坚',
    name: '吐鲁番区域攻坚督办', status: '已驳回', type: '其他督办任务',
    supervisors: [{ org: '吐鲁番分公司', name: '孙主管' }],
    content: '吐鲁番高昌区流量份额下降，督办区域攻坚执行。',
    orders: [
      { orderName: '吐鲁番高昌区区域攻坚工单', orderId: 'RAS-2026-0806', orderType: '区域攻坚调度', orderStatus: '执行中', businessTopic: '流量运营', businessScene: '区域攻坚', issueTime: '2026-07-30 11:20:00', deadline: '2026-08-08 18:00:00', execOrg: '吐鲁番分公司', executor: '吐鲁番运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-30 14:00:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-02 09:00:00', feedback: '已执行区域攻坚' },
      { node: '审批结果', result: '驳回', processTime: '2026-08-02 14:00:00', feedback: '反馈内容不完整，缺少具体执行数据' },
    ],
  },
  'SUPV-2026-007': {
    id: 'SUPV-2026-007',
    approvalResult: '驳回', approvalTime: '2026-07-30 15:00:00', receiptTime: '2026-07-30 10:00:00', isCompleted: '否', remark: '已触发营销但未全部完成。', supervisionLevel: '-', relatedTask: '预警工单-昌吉异动客户营销',
    name: '昌吉异动客户营销督办', status: '已驳回', type: '预警工单督办',
    supervisors: [{ org: '昌吉分公司', name: '陈组长' }],
    content: '昌吉异动客户共42名，督办精准营销执行结果。',
    orders: [
      { orderName: '昌吉异动客户营销工单', orderId: 'ALR-2026-0807', orderType: '预警调度', orderStatus: '执行中', businessTopic: '存量运营', businessScene: '精准营销', issueTime: '2026-07-28 15:45:00', deadline: '2026-08-05 18:00:00', execOrg: '昌吉分公司', executor: '昌吉运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-28 16:30:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-07-30 10:00:00', feedback: '已触发营销但未全部完成' },
      { node: '审批结果', result: '驳回', processTime: '2026-07-30 15:00:00', feedback: '未提供营销方案执行效果数据' },
    ],
  },
  'SUPV-2026-008': {
    id: 'SUPV-2026-008',
    approvalResult: '', approvalTime: '', receiptTime: '', isCompleted: '', remark: '', supervisionLevel: '-', relatedTask: '预警工单-巴州投诉工单处理',
    name: '巴州投诉工单处理督办', status: '已下线', type: '预警工单督办',
    supervisors: [{ org: '巴州分公司', name: '陈组长' }],
    content: '巴州投诉工单量环比增长45%，督办处理进度。',
    orders: [],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-25 11:00:00', feedback: '' },
      { node: '是否下线', result: '是', processTime: '2026-07-28 09:00:00', feedback: '任务已下线' },
    ],
  },
  'SUPV-2026-009': {
    id: 'SUPV-2026-009',
    approvalResult: '', approvalTime: '', receiptTime: '', isCompleted: '', remark: '', supervisionLevel: '-', relatedTask: '保有任务-和田热线商机转化',
    name: '和田热线商机转化督办', status: '待执行', type: '保有任务督办',
    supervisors: [{ org: '和田分公司', name: '李主管' }],
    content: '和田热线商机转化率连续3天低于15%，督办提升。',
    orders: [],
    flowNodes: [
      { node: '是否已读', result: '否', processTime: '', feedback: '' },
    ],
  },
  'SUPV-2026-010': {
    id: 'SUPV-2026-010',
    approvalResult: '待确认', approvalTime: '', receiptTime: '2026-07-25 11:00:00', isCompleted: '是', remark: '已完成存量客户保有任务，触达客户320户，保有率达95.2%。', supervisionLevel: '-', relatedTask: '保有任务-石河子存量客户保有',
    name: '石河子存量客户保有督办', status: '待确认', type: '保有任务督办',
    supervisors: [{ org: '石河子分公司', name: '王经理' }],
    content: '石河子存量客户保有任务执行情况督办。',
    orders: [
      { orderName: '石河子存量客户保有工单', orderId: 'STR-2026-0810', orderType: '策略调度', orderStatus: '已完成', businessTopic: '存量运营', businessScene: '客户保有', issueTime: '2026-07-20 09:45:00', deadline: '2026-07-28 18:00:00', execOrg: '石河子分公司', executor: '石河子运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-20 10:30:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-07-25 11:00:00', feedback: '已完成存量客户保有任务' },
    ],
  },
  'SUPV-2026-011': {
    id: 'SUPV-2026-011',
    approvalResult: '审批通过', approvalTime: '2026-07-22 16:00:00', receiptTime: '2026-07-22 10:00:00', isCompleted: '是', remark: '已执行流量增收方案，触达客户210户，流量收入环比增长8.5%。', supervisionLevel: '-', relatedTask: '保有任务-克拉玛依流量增收',
    name: '克拉玛依流量增收督办', status: '已完成', type: '保有任务督办',
    supervisors: [{ org: '克拉玛依分公司', name: '孙主管' }],
    content: '克拉玛依移动数据流量收入未达标，督办提升方案。',
    orders: [
      { orderName: '克拉玛依流量增收工单', orderId: 'IND-2026-0811', orderType: '指标调度', orderStatus: '已完成', businessTopic: '流量运营', businessScene: '流量增收', issueTime: '2026-07-18 16:00:00', deadline: '2026-07-25 18:00:00', execOrg: '克拉玛依分公司', executor: '克拉玛依运营人员' },
    ],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-18 17:00:00', feedback: '' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-07-22 10:00:00', feedback: '已执行流量增收方案' },
      { node: '审批结果', result: '审批通过', processTime: '2026-07-22 16:00:00', feedback: '执行效果良好' },
    ],
  },
  'SUPV-2026-012': {
    id: 'SUPV-2026-012',
    approvalResult: '', approvalTime: '', receiptTime: '', isCompleted: '', remark: '', supervisionLevel: '-', relatedTask: '预警工单-博州全球通离网追溯',
    name: '博州全球通离网追溯督办', status: '已下线', type: '预警工单督办',
    supervisors: [{ org: '博州分公司', name: '陈组长' }],
    content: '博州全球通客户离网追溯任务督办。',
    orders: [],
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-15 14:00:00', feedback: '' },
      { node: '是否下线', result: '是', processTime: '2026-07-18 09:00:00', feedback: '任务已下线' },
    ],
  },
};

// 工单表格列
const orderColumns = ['工单名称', '工单ID', '工单类型', '工单状态', '业务专题', '业务场景', '下发时间', '截止时间', '执行组织', '执行人', '操作'];

export default function SupervisionDetailPage() {
  return <Suspense><SupervisionDetailContent /></Suspense>;
}

function SupervisionDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || 'SUPV-2026-001';
  const d = detailMap[taskId] || detailMap['SUPV-2026-001'];

  const handleBack = () => router.push('/workspace/dispatch/supervision');

  const handleViewOrder = (orderId: string) => {
    router.push(`/workspace/dispatch/my-supervision/order-detail?orderId=${orderId}`);
  };

  // 渲染工单表格
  const renderOrderTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          {orderColumns.map(col => <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {d.orders.length === 0 ? (
          <TableRow><TableCell colSpan={orderColumns.length} className="text-center text-muted-foreground py-8">暂无数据</TableCell></TableRow>
        ) : (
          d.orders.map(order => (
            <TableRow key={order.orderId} className="hover:bg-muted/30">
              <TableCell className="text-sm font-medium">{order.orderName}</TableCell>
              <TableCell className="text-sm">{order.orderId}</TableCell>
              <TableCell className="text-sm">{order.orderType}</TableCell>
              <TableCell className="text-sm">{order.orderStatus}</TableCell>
              <TableCell className="text-sm">{order.businessTopic || '—'}</TableCell>
              <TableCell className="text-sm">{order.businessScene || '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{order.issueTime}</TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{order.deadline}</TableCell>
              <TableCell className="text-sm">{order.execOrg}</TableCell>
              <TableCell className="text-sm">{order.executor}</TableCell>
              <TableCell className="text-sm"><button className="text-primary hover:underline" onClick={() => handleViewOrder(order.orderId)}>查看详情</button></TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 顶部面包屑 */}
      <div className="px-6 py-3 border-b bg-background flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回上一页
        </Button>
        <span className="text-muted-foreground">|</span>
        <span className="text-sm font-medium">查看详情</span>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* 区块1：督办任务处理结果 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办任务处理结果</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-4">
            <div><p className="text-sm text-muted-foreground mb-1">审批结果</p><p className="text-sm font-medium">{d.approvalResult || '—'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">审批时间</p><p className="text-sm font-medium">{d.approvalTime || '—'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">回执时间</p><p className="text-sm font-medium">{d.receiptTime || '—'}</p></div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">是否已完成</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5"><input type="radio" checked={d.isCompleted === '是'} disabled className="h-3.5 w-3.5 accent-primary" /><span className="text-sm text-muted-foreground">是</span></label>
                <label className="flex items-center gap-1.5"><input type="radio" checked={d.isCompleted === '否'} disabled className="h-3.5 w-3.5 accent-primary" /><span className="text-sm text-muted-foreground">否</span></label>
              </div>
            </div>
            <div><p className="text-sm text-muted-foreground mb-1">备注</p><p className="text-sm font-medium">{d.remark || '—'}</p></div>
          </div>
          {renderOrderTable()}
        </Card>

        {/* 区块2：基本信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-4">
            <div><p className="text-sm text-muted-foreground mb-1">督办名称</p><p className="text-sm font-medium">{d.name}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">督办状态</p><p className="text-sm font-medium">{d.status}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">督办类型</p><p className="text-sm font-medium">{d.type}</p></div>
          </div>
          {renderOrderTable()}
        </Card>

        {/* 区块3：督办信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办信息</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">督办人员</p>
              <div className="w-2/5">
                <Table>
                  <TableHeader><TableRow className="bg-muted/50"><TableHead className="text-center">组织</TableHead><TableHead className="text-center">督办人</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {d.supervisors.map((s, i) => (
                      <TableRow key={i}><TableCell className="text-sm text-center">{s.org}</TableCell><TableCell className="text-sm text-center">{s.name}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div><p className="text-sm text-muted-foreground mb-1">督办内容</p><div className="text-sm bg-muted/30 rounded-md p-3 min-h-[40px]">{d.content || '—'}</div></div>
            <div><p className="text-sm text-muted-foreground mb-1">附件</p><p className="text-sm text-muted-foreground">暂无附件</p></div>
          </div>
        </Card>

        {/* 区块4：督办任务流程跟踪 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办任务流程跟踪</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center">节点</TableHead>
                <TableHead className="text-center">结果值</TableHead>
                <TableHead className="text-center">处理时间</TableHead>
                <TableHead className="text-center">反馈内容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.flowNodes.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">暂无数据</TableCell></TableRow>
              ) : (
                d.flowNodes.map((n, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-center">{n.node}</TableCell>
                    <TableCell className="text-sm text-center">{n.result}</TableCell>
                    <TableCell className="text-sm text-center text-muted-foreground">{n.processTime || '—'}</TableCell>
                    <TableCell className="text-sm text-center">{n.feedback || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
