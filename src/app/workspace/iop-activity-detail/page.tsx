'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 可折叠模块组件
function CollapsibleCard({
  title,
  icon,
  moduleKey,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  moduleKey: string;
  collapsed: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 mb-6">
      <div
        className="flex items-center gap-2 mb-4 cursor-pointer select-none"
        onClick={() => onToggle(moduleKey)}
      >
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
        )}
      </div>
      {!collapsed && children}
    </Card>
  );
}

export default function IOPActivityDetailPage() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId') || 'IOP-2026-0701';
  const ticketId = searchParams.get('ticketId') || '';

  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  const toggleModule = (key: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-emerald-600" />
        <h1 className="text-xl font-semibold text-gray-900">IOP活动详情</h1>
        <p className="text-sm text-gray-500 ml-4">活动ID：{activityId}</p>
        {ticketId && <p className="text-sm text-gray-500">关联工单：{ticketId}</p>}
      </div>

      {/* 审批信息 */}
      <CollapsibleCard title="审批信息" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-approval" collapsed={collapsedModules.has('iop-approval')} onToggle={toggleModule}>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-sm text-gray-500 mb-1">审批状态</p><p className="text-sm font-medium">已通过</p></div>
          <div><p className="text-sm text-gray-500 mb-1">审批人</p><p className="text-sm font-medium">张经理</p></div>
          <div><p className="text-sm text-gray-500 mb-1">审批时间</p><p className="text-sm font-medium">2026-07-12 10:30:00</p></div>
          <div><p className="text-sm text-gray-500 mb-1">审批意见</p><p className="text-sm font-medium">同意执行</p></div>
        </div>
      </CollapsibleCard>

      {/* 活动基本信息 */}
      <CollapsibleCard title="活动基本信息" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-basic" collapsed={collapsedModules.has('iop-basic')} onToggle={toggleModule}>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-sm text-gray-500 mb-1">活动名称</p><p className="text-sm font-medium">全球通保有促活活动</p></div>
          <div><p className="text-sm text-gray-500 mb-1">活动ID</p><p className="text-sm font-medium">{activityId}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">活动类型</p><p className="text-sm font-medium">保有促活</p></div>
          <div><p className="text-sm text-gray-500 mb-1">执行周期</p><p className="text-sm font-medium">2026-07-01 ~ 2026-07-31</p></div>
          <div><p className="text-sm text-gray-500 mb-1">活动状态</p><p className="text-sm font-medium"><Badge variant="default" className="text-xs">执行中</Badge></p></div>
          <div><p className="text-sm text-gray-500 mb-1">创建人</p><p className="text-sm font-medium">张建国</p></div>
          <div><p className="text-sm text-gray-500 mb-1">创建时间</p><p className="text-sm font-medium">2026-06-28 10:30:00</p></div>
          <div><p className="text-sm text-gray-500 mb-1">优先级</p><p className="text-sm font-medium">高</p></div>
        </div>
      </CollapsibleCard>

      {/* 配置产品 */}
      <CollapsibleCard title="配置产品" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-products" collapsed={collapsedModules.has('iop-products')} onToggle={toggleModule}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>产品名称</TableHead>
              <TableHead>产品编码</TableHead>
              <TableHead>产品类型</TableHead>
              <TableHead>资费（元/月）</TableHead>
              <TableHead>合约期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: '全球通128元套餐', code: 'P-GQT-128', type: '主套餐', price: '128', period: '12个月' },
              { name: '5G升级包30元', code: 'P-5G-30', type: '叠加包', price: '30', period: '6个月' },
              { name: '家庭宽带200M', code: 'P-BB-200', type: '融合产品', price: '0（合约赠送）', period: '24个月' },
            ].map((p, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.code}</TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell>{p.price}</TableCell>
                <TableCell>{p.period}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleCard>

      {/* 客群信息 */}
      <CollapsibleCard title="客群信息" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-customer-group" collapsed={collapsedModules.has('iop-customer-group')} onToggle={toggleModule}>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-sm text-gray-500 mb-1">客群名称</p><p className="text-sm font-medium">高离网风险客户群</p></div>
          <div><p className="text-sm text-gray-500 mb-1">客群编码</p><p className="text-sm font-medium">CG202607001</p></div>
          <div><p className="text-sm text-gray-500 mb-1">客群规模</p><p className="text-sm font-medium">15,832</p></div>
          <div><p className="text-sm text-gray-500 mb-1">客群来源</p><p className="text-sm font-medium">精准平台</p></div>
          <div><p className="text-sm text-gray-500 mb-1">圈选条件</p><p className="text-sm font-medium">{'离网概率>0.6 且 ARPU>80'}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">更新时间</p><p className="text-sm font-medium">2026-07-01 00:00</p></div>
        </div>
      </CollapsibleCard>

      {/* 投放渠道 */}
      <CollapsibleCard title="投放渠道" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-channels" collapsed={collapsedModules.has('iop-channels')} onToggle={toggleModule}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>渠道名称</TableHead>
              <TableHead>渠道类型</TableHead>
              <TableHead>运营位</TableHead>
              <TableHead>投放时段</TableHead>
              <TableHead>日均投放量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: '10086短信', type: '短信', position: '5G套餐推荐', time: '09:00-21:00', volume: '3,000' },
              { name: '外呼中心', type: '外呼', position: '保有维系话术', time: '10:00-12:00,14:00-18:00', volume: '500' },
              { name: '中国移动APP', type: 'APP推送', position: '首页Banner', time: '全天', volume: '8,000' },
            ].map((ch, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{ch.name}</TableCell>
                <TableCell>{ch.type}</TableCell>
                <TableCell>{ch.position}</TableCell>
                <TableCell className="text-xs">{ch.time}</TableCell>
                <TableCell>{ch.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleCard>

      {/* 其他设置 */}
      <CollapsibleCard title="其他设置" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-settings" collapsed={collapsedModules.has('iop-settings')} onToggle={toggleModule}>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-sm text-gray-500 mb-1">频次控制</p><p className="text-sm font-medium">同一客户7天内最多触达2次</p></div>
          <div><p className="text-sm text-gray-500 mb-1">免打扰时段</p><p className="text-sm font-medium">12:00-14:00, 21:00-09:00</p></div>
          <div><p className="text-sm text-gray-500 mb-1">失败重试</p><p className="text-sm font-medium">最多3次，间隔30分钟</p></div>
          <div><p className="text-sm text-gray-500 mb-1">并发限制</p><p className="text-sm font-medium">外呼最大并发50路</p></div>
          <div><p className="text-sm text-gray-500 mb-1">效果归因</p><p className="text-sm font-medium">触达后7天内订购归因本活动</p></div>
        </div>
      </CollapsibleCard>

      {/* 关联保有任务信息 */}
      <CollapsibleCard title="关联保有任务信息" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-related-task" collapsed={collapsedModules.has('iop-related-task')} onToggle={toggleModule}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>工单编号</TableHead>
              <TableHead>工单标题</TableHead>
              <TableHead>业务类型</TableHead>
              <TableHead>工单状态</TableHead>
              <TableHead>创建时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticketId && (
              <TableRow>
                <TableCell className="font-medium">{ticketId}</TableCell>
                <TableCell>保有任务调度工单</TableCell>
                <TableCell>生产类/保有任务调度</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">处理中</Badge></TableCell>
                <TableCell>2026-07-01 10:00:00</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CollapsibleCard>

      {/* 保有效果 */}
      <CollapsibleCard title="保有效果" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="iop-effect" collapsed={collapsedModules.has('iop-effect')} onToggle={toggleModule}>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded-md">
            <p className="text-2xl font-bold text-primary">12,456</p>
            <p className="text-xs text-muted-foreground mt-1">触达客户数</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-md">
            <p className="text-2xl font-bold text-primary">3,892</p>
            <p className="text-xs text-muted-foreground mt-1">响应客户数</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-md">
            <p className="text-2xl font-bold text-primary">1,256</p>
            <p className="text-xs text-muted-foreground mt-1">订购客户数</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-md">
            <p className="text-2xl font-bold text-primary">32.3%</p>
            <p className="text-xs text-muted-foreground mt-1">响应率</p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>渠道</TableHead>
              <TableHead>触达数</TableHead>
              <TableHead>响应数</TableHead>
              <TableHead>订购数</TableHead>
              <TableHead>响应率</TableHead>
              <TableHead>转化率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { ch: '短信', touch: '8,500', resp: '2,380', order: '680', respRate: '28.0%', convRate: '8.0%' },
              { ch: '外呼', touch: '2,456', resp: '1,012', order: '376', respRate: '41.2%', convRate: '15.3%' },
              { ch: 'APP推送', touch: '1,500', resp: '500', order: '200', respRate: '33.3%', convRate: '13.3%' },
            ].map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.ch}</TableCell>
                <TableCell>{r.touch}</TableCell>
                <TableCell>{r.resp}</TableCell>
                <TableCell>{r.order}</TableCell>
                <TableCell>{r.respRate}</TableCell>
                <TableCell>{r.convRate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleCard>
    </div>
  );
}
