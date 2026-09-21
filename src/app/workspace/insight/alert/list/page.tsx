'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, FileWarning, Settings, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ==================== 类型定义 ====================

type AlertMode = 'indicator' | 'opportunity';
type AlertStatus = 'pending' | 'expired';

interface IndicatorAlertRecord {
  id: string;
  indicatorName: string;
  alertType: 'rule' | 'ai';
  alertLevel: string;
  alertContent: string;
  alertTime: string;
  status: AlertStatus;
}

interface OpportunityAlertRecord {
  id: string;
  category: string;
  alertLevel: string;
  alertContent: string;
  alertTime: string;
  status: AlertStatus;
}

// ==================== 常量配置 ====================

const getLevelColor = (level: string) => {
  switch (level) {
    case '红色预警':
      return 'text-red-600 bg-red-50';
    case '橙色预警':
      return 'text-orange-600 bg-orange-50';
    case '黄色预警':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-blue-600 bg-blue-50';
  }
};

const statusConfig: Record<AlertStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-orange-50 text-orange-600' },
  expired: { label: '已失效', color: 'bg-gray-100 text-gray-400' },
};

const levelOrder: Record<string, number> = {
  '红色预警': 1,
  '橙色预警': 2,
  '黄色预警': 3,
  '蓝色预警': 4,
};

// ==================== 模拟数据 - 指标预警 ====================

const mockIndicatorAlerts: IndicatorAlertRecord[] = [
  { id: 'IND001', indicatorName: '11111111', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城当月DOU<11111111111111.0…', alertTime: '2026-08-04 12:12:01', status: 'pending' },
  { id: 'IND002', indicatorName: '111111', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城移动数据流量收入<1000000…', alertTime: '2026-08-04 12:11:52', status: 'pending' },
  { id: 'IND003', indicatorName: '测试', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城流量套餐使用饱和度<80.0%，触…', alertTime: '2026-08-04 12:11:42', status: 'pending' },
  { id: 'IND004', indicatorName: '当月DOU', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城当月DOU<11111111111111.0…', alertTime: '2026-08-04 12:11:32', status: 'pending' },
  { id: 'IND005', indicatorName: '移动数据流量收入', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城移动数据流量收入<1000000…', alertTime: '2026-08-04 11:03:01', status: 'pending' },
  { id: 'IND006', indicatorName: '流量套餐使用饱和度', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城流量套餐使用饱和度<80.0%，触…', alertTime: '2026-08-03 14:30:00', status: 'expired' },
  { id: 'IND007', indicatorName: '当月流量增幅', alertType: 'rule', alertLevel: '红色预警', alertContent: '塔城当月流量增幅<-5.0%，触发…', alertTime: '2026-08-02 09:15:00', status: 'expired' },
  { id: 'IND008', indicatorName: 'ARPU值', alertType: 'rule', alertLevel: '红色预警', alertContent: '乌鲁木齐ARPU值环比下降8.5%，触…', alertTime: '2026-07-30 10:20:00', status: 'expired' },
  { id: 'IND009', indicatorName: '全球通保有率', alertType: 'rule', alertLevel: '红色预警', alertContent: '喀什全球通保有率<92.0%，触发…', alertTime: '2026-07-28 16:45:00', status: 'expired' },
  { id: 'IND010', indicatorName: '中高端客户离网率', alertType: 'rule', alertLevel: '红色预警', alertContent: '阿克苏中高端客户离网率>2.0%，触…', alertTime: '2026-07-23 11:03:01', status: 'expired' },
];

const mockOpportunityAlerts: OpportunityAlertRecord[] = [
  { id: 'WRN001', category: '携转预警', alertLevel: '红色预警', alertContent: '乌鲁木齐天山区存在15名携转意愿评分≥80的客户未处理，请及时跟进挽留', alertTime: '2026-08-05 09:30:00', status: 'pending' },
  { id: 'WRN002', category: '宽带离网预警', alertLevel: '红色预警', alertContent: '全疆宽带续费概率≤0.3且15天内到期的客户达86户，存在批量离网风险', alertTime: '2026-08-05 09:00:00', status: 'pending' },
  { id: 'WRN003', category: '全球通离网预警', alertLevel: '橙色预警', alertContent: '喀什全球通离网概率≥0.6且月均消费降幅≥20%的客户共23名，需重点维系', alertTime: '2026-08-05 08:45:00', status: 'pending' },
  { id: 'WRN004', category: '投诉工单预警', alertLevel: '橙色预警', alertContent: '阿克苏近7天投诉工单量环比增长45%，超阈值触发预警', alertTime: '2026-08-04 16:20:00', status: 'pending' },
  { id: 'WRN005', category: '热线商机预警', alertLevel: '黄色预警', alertContent: '吐鲁番热线商机转化率连续3天低于15%，分包看管执行效率待提升', alertTime: '2026-08-04 14:10:00', status: 'pending' },
  { id: 'WRN006', category: '异动客户预警', alertLevel: '黄色预警', alertContent: '昌吉异动客户（流量降幅≥30%）共42名，建议触发精准营销', alertTime: '2026-08-04 10:30:00', status: 'pending' },
  { id: 'WRN007', category: '携转预警', alertLevel: '橙色预警', alertContent: '伊犁霍尔果斯网格携转预警任务执行超时，8名客户超48小时未跟进', alertTime: '2026-08-03 17:00:00', status: 'expired' },
  { id: 'WRN008', category: '宽带离网预警', alertLevel: '蓝色预警', alertContent: '塔城宽带离网预警规则已执行完毕，本月累计挽留成功31户', alertTime: '2026-08-02 11:15:00', status: 'expired' },
  { id: 'WRN009', category: '全球通离网预警', alertLevel: '黄色预警', alertContent: '巴州全球通客户离网追溯任务已完成，追溯成功率82%', alertTime: '2026-08-01 09:45:00', status: 'expired' },
  { id: 'WRN010', category: '投诉工单预警', alertLevel: '蓝色预警', alertContent: '和田投诉工单预警执行结束，本周投诉量环比下降12%', alertTime: '2026-07-30 15:30:00', status: 'expired' },
];

// ==================== 主组件 ====================

export default function AlertListPage() {
  const router = useRouter();
  const [alertMode, setAlertMode] = useState<AlertMode>('indicator');

  // 状态筛选
  const [filterStatus, setFilterStatus] = useState<'all' | AlertStatus>('all');

  // 指标预警筛选
  const [indTypeFilter, setIndTypeFilter] = useState('all');
  const [indKeyword, setIndKeyword] = useState('');
  const [indStartTime, setIndStartTime] = useState('');
  const [indEndTime, setIndEndTime] = useState('');
  const [indLevelSort, setIndLevelSort] = useState<'asc' | 'desc'>('desc');

  // 商机预警筛选
  const [oppRuleFilter, setOppRuleFilter] = useState('all');
  const [oppKeyword, setOppKeyword] = useState('');
  const [oppStartTime, setOppStartTime] = useState('');
  const [oppEndTime, setOppEndTime] = useState('');

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');

  // 排序切换
  const toggleLevelSort = () => {
    setIndLevelSort(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // ==================== 指标预警数据处理 ====================
  const filteredIndicatorAlerts = mockIndicatorAlerts.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (indTypeFilter !== 'all') {
      if (indTypeFilter === 'rule' && r.alertType !== 'rule') return false;
      if (indTypeFilter === 'ai' && r.alertType !== 'ai') return false;
    }
    if (indKeyword && !r.indicatorName.includes(indKeyword)) return false;
    if (indStartTime && r.alertTime < indStartTime) return false;
    if (indEndTime && r.alertTime > indEndTime + ' 23:59:59') return false;
    return true;
  }).sort((a, b) => {
    const diff = levelOrder[a.alertLevel] - levelOrder[b.alertLevel];
    return indLevelSort === 'desc' ? diff : -diff;
  });

  // ==================== 商机预警数据处理 ====================
  const filteredOpportunityAlerts = mockOpportunityAlerts.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (oppRuleFilter !== 'all' && !r.category.includes(oppRuleFilter)) return false;
    if (oppKeyword && !r.category.includes(oppKeyword)) return false;
    if (oppStartTime && r.alertTime < oppStartTime) return false;
    if (oppEndTime && r.alertTime > oppEndTime + ' 23:59:59') return false;
    return true;
  });

  // 当前页数据
  const currentData = alertMode === 'indicator' ? filteredIndicatorAlerts : filteredOpportunityAlerts;
  const totalPages = Math.max(1, Math.ceil(currentData.length / parseInt(pageSize)));
  const paginatedData = currentData.slice(
    (currentPage - 1) * parseInt(pageSize),
    currentPage * parseInt(pageSize)
  );

  // 重置筛选
  const handleReset = () => {
    setFilterStatus('all');
    if (alertMode === 'indicator') {
      setIndTypeFilter('all');
      setIndKeyword('');
      setIndStartTime('');
      setIndEndTime('');
    } else {
      setOppRuleFilter('all');
      setOppKeyword('');
      setOppStartTime('');
      setOppEndTime('');
    }
    setCurrentPage(1);
  };

  // 去调度 - 跳转中高端运营
  const handleGoDispatch = () => {
    router.push('/portal/mid-high-customer-operations');
  };

  // 切换Tab
  const handleSwitchTab = (mode: AlertMode) => {
    setAlertMode(mode);
    setFilterStatus('all');
    setCurrentPage(1);
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
            onClick={() => handleSwitchTab('indicator')}
          >
            <AlertTriangle className="w-4 h-4" />
            指标预警
          </button>
          <button
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
              alertMode === 'opportunity'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => handleSwitchTab('opportunity')}
          >
            <FileWarning className="w-4 h-4" />
            商机预警
          </button>
        </div>
      </div>

      {/* 状态筛选按钮 */}
      <div className="px-6 pt-3 flex items-center gap-2">
        {(['all', 'pending', 'expired'] as const).map(s => (
          <button
            key={s}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              filterStatus === s
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
          >
            {s === 'all' ? '全部' : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* 搜索筛选区域 */}
      <Card className="mx-6 my-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* 类型/规则筛选 */}
          <Select
            value={alertMode === 'indicator' ? indTypeFilter : oppRuleFilter}
            onValueChange={(v) => {
              if (alertMode === 'indicator') setIndTypeFilter(v);
              else setOppRuleFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder={alertMode === 'indicator' ? '类型' : '预警规则'} />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              <SelectItem value="all">全部</SelectItem>
              {alertMode === 'indicator' ? (
                <>
                  <SelectItem value="rule">规则配置预警</SelectItem>
                  <SelectItem value="ai">AI监控预警</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="携转预警">携转预警</SelectItem>
                  <SelectItem value="宽带离网预警">宽带离网预警</SelectItem>
                  <SelectItem value="全球通离网预警">全球通离网预警</SelectItem>
                  <SelectItem value="投诉工单预警">投诉工单预警</SelectItem>
                  <SelectItem value="热线商机预警">热线商机预警</SelectItem>
                  <SelectItem value="异动客户预警">异动客户预警</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {/* 关键词搜索 */}
          <div className="relative">
            <Input
              placeholder={alertMode === 'indicator' ? '预警指标组/指标' : '商机分类'}
              value={alertMode === 'indicator' ? indKeyword : oppKeyword}
              onChange={(e) => {
                if (alertMode === 'indicator') setIndKeyword(e.target.value);
                else setOppKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 h-9 pr-8"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* 时间筛选 */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-600 whitespace-nowrap">预警时间</span>
            <Input
              type="date"
              value={alertMode === 'indicator' ? indStartTime : oppStartTime}
              onChange={(e) => {
                if (alertMode === 'indicator') setIndStartTime(e.target.value);
                else setOppStartTime(e.target.value);
              }}
              className="w-36 h-9 text-sm"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              value={alertMode === 'indicator' ? indEndTime : oppEndTime}
              onChange={(e) => {
                if (alertMode === 'indicator') setIndEndTime(e.target.value);
                else setOppEndTime(e.target.value);
              }}
              className="w-36 h-9 text-sm"
            />
          </div>

          <button
            className="text-sm text-gray-400 hover:text-gray-600 ml-1"
            onClick={handleReset}
          >
            重置
          </button>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              className="bg-[#0085D0] hover:bg-[#006BB0] h-9"
              onClick={() => setCurrentPage(1)}
            >
              <Search className="w-4 h-4 mr-1" />搜索
            </Button>
            <Button variant="outline" className="h-9 border-gray-300">
              <Settings className="w-4 h-4 mr-1" />预警配置
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card className="mx-6 mb-4 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              {alertMode === 'indicator' ? (
                <>
                  <TableHead className="font-semibold text-gray-900 w-32">类型</TableHead>
                  <TableHead className="font-semibold text-gray-900">预警指标组/指标</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-32">
                    <button
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={toggleLevelSort}
                    >
                      预警等级
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">预警内容</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-40">预警时间</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-24">预警状态</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-20">操作</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-semibold text-gray-900 w-32">类型</TableHead>
                  <TableHead className="font-semibold text-gray-900">分类</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-32">
                    <button
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={() => {}}
                    >
                      预警等级
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">预警内容</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-40">预警时间</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-24">预警状态</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-20">操作</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((record) => {
                const isIndicator = alertMode === 'indicator';
                const indRecord = record as IndicatorAlertRecord;
                const oppRecord = record as OpportunityAlertRecord;
                const cfg = statusConfig[record.status];
                const typeLabel = isIndicator
                  ? (indRecord.alertType === 'rule' ? '规则配置预警' : 'AI监控预警')
                  : oppRecord.category;
                return (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                        {typeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {isIndicator ? indRecord.indicatorName : oppRecord.category}
                    </TableCell>
                    <TableCell>
                      <span className={cn('px-2 py-1 rounded text-xs', getLevelColor(record.alertLevel))}>
                        {record.alertLevel}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-[300px] truncate" title={record.alertContent}>
                      {record.alertContent}
                    </TableCell>
                    <TableCell className="text-gray-900 text-sm">{record.alertTime}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('text-xs', cfg.color)}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isIndicator && record.status === 'pending' ? (
                        <Button
                          variant="ghost"
                          className="text-[#0085D0] hover:text-[#006BB0] p-0 h-auto text-sm"
                          onClick={handleGoDispatch}
                        >
                          去调度
                        </Button>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 分页 */}
      <div className="px-6 pb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          共 {currentData.length} 项数据
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                className={cn('w-9 h-9', currentPage === pageNum && 'bg-[#0085D0] text-white border-[#0085D0] hover:bg-[#006BB0]')}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-600">前往</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Number(e.target.value);
                if (page >= 1 && page <= totalPages) setCurrentPage(page);
              }}
              className="w-16 h-9 text-center"
            />
            <span className="text-sm text-gray-600">页</span>
          </div>
        </div>
      </div>
    </div>
  );
}
