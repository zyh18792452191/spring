'use client';

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Eye, Send, XCircle, Clock, CheckCircle, Calendar, AlertTriangle, Zap, Users, MapPin, Settings } from "lucide-react";
import { toast } from 'sonner';
import OpportunityFilterPanel from '../components/OpportunityFilterPanel';
import OpportunityKanbanCard from '../components/OpportunityKanbanCard';

const businessTypeOptions = [
  { value: '流量达量预警-全球通客户-CRM系统', label: '流量达量预警-全球通客户-CRM系统' },
  { value: '特定内容高频访问-全球通客户-营销活动平台', label: '特定内容高频访问-全球通客户-营销活动平台' },
  { value: '高价值套餐推荐-中高端客户-外呼系统', label: '高价值套餐推荐-中高端客户-外呼系统' },
  { value: '家庭融合推荐-中高端客户-外呼系统', label: '家庭融合推荐-中高端客户-外呼系统' },
  { value: '合约到期提醒-潜力客户-线下营业厅', label: '合约到期提醒-潜力客户-线下营业厅' },
];

const regionOptions = [
  { value: '乌鲁木齐', label: '乌鲁木齐' },
  { value: '克拉玛依', label: '克拉玛依' },
  { value: '吐鲁番', label: '吐鲁番' },
  { value: '哈密', label: '哈密' },
  { value: '昌吉', label: '昌吉' },
  { value: '巴州', label: '巴州' },
  { value: '阿克苏', label: '阿克苏' },
  { value: '喀什', label: '喀什' },
];

const RATING_LEVELS = {
  HIGH: { label: '高', color: 'bg-red-100 text-red-700 border-red-200' },
  MEDIUM: { label: '中', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  LOW: { label: '低', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const STATUS = {
  PENDING_SCHEDULE: { label: '待调度', color: 'bg-slate-100 text-slate-600' },
  SCHEDULING: { label: '调度中', color: 'bg-blue-100 text-blue-600' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-600' },
  ABANDONED: { label: '已废弃', color: 'bg-gray-100 text-gray-500' },
};

function getValidUntil(collectTime: string, validHours: number): string {
  try {
    const base = new Date(collectTime.replace(' ', 'T'));
    const expiry = new Date(base.getTime() + validHours * 3600000);
    return `${expiry.getMonth() + 1}/${expiry.getDate()} ${String(expiry.getHours()).padStart(2, '0')}:${String(expiry.getMinutes()).padStart(2, '0')}`;
  } catch { return '-'; }
}

const PAGE_SIZE = 20;

interface GroupOpportunity {
  id: string;
  businessTypeId: string;
  businessTypeName: string;
  category: string;
  businessScenario: string;
  rating: 'HIGH' | 'MEDIUM' | 'LOW';
  groupName: string;
  groupScale: number;
  region: string;
  recommendedStrategy?: string;
  status: keyof typeof STATUS;
  collectTime: string;
  validHours: number;
  scheduleInfo?: { channel: string; executor: string; plan: string };
  executionProgress?: { dispatched: number; executing: number; completed: number };
  conversionResult?: { successRate: number; avgResponseTime: string };
}

const groupOpportunityData: GroupOpportunity[] = [
  { id: 'SQ202401150001', businessTypeId: 'BT001', businessTypeName: '流量达量预警-全球通客户-CRM系统', category: '风险预警类/流量预警/流量达量预警', businessScenario: '流量运营', rating: 'HIGH', groupName: '高流量超额客群-A区', groupScale: 1250, region: '乌鲁木齐', recommendedStrategy: '流量加油包推送策略', status: 'PENDING_SCHEDULE', collectTime: '2024-01-15 08:00', validHours: 72 },
  { id: 'SQ202401150002', businessTypeId: 'BT002', businessTypeName: '特定内容高频访问-全球通客户-营销活动平台', category: '价值提升类/流量经营/特定内容高频访问', businessScenario: '流量运营', rating: 'MEDIUM', groupName: '视频高频客群-B区', groupScale: 860, region: '克拉玛依', recommendedStrategy: '视频定向流量包策略', status: 'PENDING_SCHEDULE', collectTime: '2024-01-15 09:30', validHours: 96 },
  { id: 'SQ202401140003', businessTypeId: 'BT003', businessTypeName: '高价值套餐推荐-中高端客户-外呼系统', category: '价值提升类/流量经营/地板价套餐查询高流量套餐', businessScenario: '中高端保有', rating: 'HIGH', groupName: '地板价套餐客群-C区', groupScale: 2000, region: '吐鲁番', recommendedStrategy: '高流量套餐升级策略', status: 'SCHEDULING', collectTime: '2024-01-14 14:00', validHours: 120, scheduleInfo: { channel: '外呼中心', executor: '王经理团队', plan: '分3批次外呼，每批670人' }, executionProgress: { dispatched: 2000, executing: 1200, completed: 800 } },
  { id: 'SQ202401130004', businessTypeId: 'BT001', businessTypeName: '流量达量预警-全球通客户-CRM系统', category: '风险预警类/流量预警/流量达量预警', businessScenario: '流量运营', rating: 'MEDIUM', groupName: '流量预警客群-D区', groupScale: 650, region: '哈密', recommendedStrategy: '流量提醒+加油包组合策略', status: 'SCHEDULING', collectTime: '2024-01-13 10:00', validHours: 48, scheduleInfo: { channel: '短信+外呼', executor: '李经理团队', plan: '先短信提醒，48h未处理外呼' }, executionProgress: { dispatched: 650, executing: 400, completed: 250 } },
  { id: 'SQ202401120005', businessTypeId: 'BT005', businessTypeName: '合约到期提醒-潜力客户-线下营业厅', category: '生命周期类/沉默流失预警/零流量使用预警', businessScenario: '离网维系', rating: 'LOW', groupName: '沉默客群-E区', groupScale: 560, region: '巴州', recommendedStrategy: '激活关怀策略', status: 'PENDING_SCHEDULE', collectTime: '2024-01-12 16:00', validHours: 144 },
  { id: 'SQ202401110006', businessTypeId: 'BT002', businessTypeName: '特定内容高频访问-全球通客户-营销活动平台', category: '价值提升类/流量经营/特定内容高频访问', businessScenario: '流量运营', rating: 'HIGH', groupName: '直播流量客群-F区', groupScale: 1500, region: '乌鲁木齐', recommendedStrategy: '直播专属流量包策略', status: 'COMPLETED', collectTime: '2024-01-11 11:00', validHours: 96, scheduleInfo: { channel: '线上推送', executor: '张经理团队', plan: 'APP弹窗+短信推送' }, executionProgress: { dispatched: 1500, executing: 0, completed: 1500 }, conversionResult: { successRate: 28.5, avgResponseTime: '2.3h' } },
  { id: 'SQ202401100007', businessTypeId: 'BT004', businessTypeName: '家庭融合推荐-中高端客户-外呼系统', category: '价值提升类/流量经营/地板价套餐查询高流量套餐', businessScenario: '家庭运营', rating: 'MEDIUM', groupName: '宽带潜在客群-G区', groupScale: 980, region: '阿克苏', recommendedStrategy: '家庭融合套餐推荐策略', status: 'COMPLETED', collectTime: '2024-01-10 09:00', validHours: 120, scheduleInfo: { channel: '营业厅+外呼', executor: '赵经理团队', plan: '营业厅面销+外呼补充' }, executionProgress: { dispatched: 980, executing: 0, completed: 980 }, conversionResult: { successRate: 35.2, avgResponseTime: '4.1h' } },
  { id: 'SQ202401090008', businessTypeId: 'BT005', businessTypeName: '合约到期提醒-潜力客户-线下营业厅', category: '生命周期类/沉默流失预警/零流量使用预警', businessScenario: '离网维系', rating: 'LOW', groupName: '流失预警客群-H区', groupScale: 300, region: '喀什', status: 'ABANDONED', collectTime: '2024-01-09 15:00', validHours: 72 },
];

export default function GroupOpportunityPage() {
  // 看板模式已移除，仅保留列表模式
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [searchId, setSearchId] = useState('');
  const [searchBusinessType, setSearchBusinessType] = useState('');
  const [searchRegion, setSearchRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupOpportunity | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);
  const [executionRole, setExecutionRole] = useState('地市集运');

  const handleReset = () => {
    setSearchId(''); setSearchBusinessType(''); setSearchRegion('');
    setFilterStatus(''); setFilterRating('');
  };

  const filteredData = groupOpportunityData.filter(item => {
    const matchId = !searchId || item.id.includes(searchId);
    const matchBusinessType = !searchBusinessType || item.businessTypeName === searchBusinessType;
    const matchRating = !filterRating || item.rating === filterRating;
    const matchStatus = !filterStatus || item.status === filterStatus;
    const matchRegion = !searchRegion || item.region.includes(searchRegion);
    return matchId && matchBusinessType && matchRating && matchStatus && matchRegion;
  });

  const statusCounts = useMemo(() => ({
    PENDING_SCHEDULE: groupOpportunityData.filter(d => d.status === 'PENDING_SCHEDULE').length,
    SCHEDULING: groupOpportunityData.filter(d => d.status === 'SCHEDULING').length,
    COMPLETED: groupOpportunityData.filter(d => d.status === 'COMPLETED').length,
    ABANDONED: groupOpportunityData.filter(d => d.status === 'ABANDONED').length,
  }), []);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const confirmSchedule = () => { setScheduleDialogOpen(false); setSelectedGroup(null); };
  const confirmAbandon = () => {
    toast.success('已废弃', { description: `客群商机 ${selectedGroup?.id} 已标记为废弃` });
    setAbandonDialogOpen(false); setSelectedGroup(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">客群商机</h1>
          <p className="text-sm text-muted-foreground mt-1">批量客群商机管理，支持调度、废弃等操作</p>
        </div>
        <div className="flex items-center gap-2" />
      </div>

      {/* 筛选面板 */}
      <Card className="p-4 mb-4">
        <OpportunityFilterPanel
          tagFilters={[
            { key: 'status', label: '状态', options: Object.entries(STATUS).map(([k, v]) => ({ value: k, label: v.label, count: statusCounts[k as keyof typeof statusCounts] })) },
            { key: 'rating', label: '评级', options: Object.entries(RATING_LEVELS).map(([k, v]) => ({ value: k, label: v.label })) },
          ]}
          tagValues={{ status: filterStatus, rating: filterRating }}
          onTagChange={(key, value) => {
            if (key === 'status') { setFilterStatus(value); setCurrentPage(1); }
            else if (key === 'rating') { setFilterRating(value); setCurrentPage(1); }
          }}
          idSearchValue={searchId}
          onIdSearchChange={(v) => { setSearchId(v); setCurrentPage(1); }}
          selectFilters={[
            { key: 'businessType', label: '业务类型', options: businessTypeOptions, placeholder: '全部类型' },
            { key: 'region', label: '区域', options: regionOptions, placeholder: '全部区域' },
          ]}
          selectValues={{ businessType: searchBusinessType, region: searchRegion }}
          onSelectChange={(key, value) => {
            if (key === 'businessType') { setSearchBusinessType(value); setCurrentPage(1); }
            else if (key === 'region') { setSearchRegion(value); setCurrentPage(1); }
          }}
          onReset={handleReset}
          totalCount={filteredData.length}
          totalLabel="客群商机"
        />
      </Card>

      {/* 看板模式 */}
      {/* 列表模式 */}
      <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">商机ID</TableHead>
                <TableHead className="w-[10%]">商机业务类型</TableHead>
                <TableHead className="w-[9%]">商机分类</TableHead>
                <TableHead className="w-[5%]">评级</TableHead>
                <TableHead className="w-[8%]">客群名称</TableHead>
                <TableHead className="w-[5%]">客群规模</TableHead>
                <TableHead className="w-[6%]">区域</TableHead>
                <TableHead className="w-[9%]">推荐策略</TableHead>
                <TableHead className="w-[7%]">采集时间</TableHead>
                <TableHead className="w-[6%]">有效期至</TableHead>
                <TableHead className="w-[5%]">状态</TableHead>
                <TableHead className="w-[7%] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow><TableCell colSpan={12} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : (
                paginatedData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-primary">{item.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{item.businessTypeName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${RATING_LEVELS[item.rating].color} font-medium`}>{RATING_LEVELS[item.rating].label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{item.groupName}</TableCell>
                    <TableCell className="text-sm text-primary font-medium">{item.groupScale.toLocaleString()}人</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.region}</TableCell>
                    <TableCell className="text-sm">{item.recommendedStrategy || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-muted-foreground" /><span className="text-sm">{item.collectTime.split(' ')[0]}</span></div>
                    </TableCell>
                    <TableCell className="text-sm">{item.status === 'COMPLETED' || item.status === 'ABANDONED' ? '已结束' : getValidUntil(item.collectTime, item.validHours)}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS[item.status].color} font-normal`}>{STATUS[item.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.status === 'PENDING_SCHEDULE' && (
                          <>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-primary hover:text-primary border-primary/20 hover:bg-primary/5" onClick={() => { setSelectedGroup(item); setScheduleDialogOpen(true); }}>
                              <Send className="w-3.5 h-3.5 mr-1" />调度
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-red-600" onClick={() => { setSelectedGroup(item); setAbandonDialogOpen(true); }}>
                              <XCircle className="w-3.5 h-3.5 mr-1" />废弃
                            </Button>
                          </>
                        )}
                        {(item.status === 'SCHEDULING' || item.status === 'COMPLETED') && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-green-600 hover:text-green-700" onClick={() => { setSelectedGroup(item); setDetailDialogOpen(true); }}>
                            <Eye className="w-3.5 h-3.5 mr-1" />执行情况
                          </Button>
                        )}
                        {item.status === 'ABANDONED' && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground" onClick={() => { setSelectedGroup(item); setDetailDialogOpen(true); }}>
                            <Eye className="w-3.5 h-3.5 mr-1" />详情
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">第 {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredData.length)} 条，共 {filteredData.length} 条</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
              </div>
            </div>
          )}
        </Card>

      {/* 调度弹窗 */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>客群商机调度</DialogTitle>
            <DialogDescription>确认将此客群商机进行调度</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                <div><div className="text-xs text-muted-foreground mb-1">商机ID</div><div className="font-medium text-primary">{selectedGroup.id}</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">评级</div><Badge variant="outline" className={`${RATING_LEVELS[selectedGroup.rating].color} font-medium`}>{RATING_LEVELS[selectedGroup.rating].label}</Badge></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">客群名称</div><div className="text-sm">{selectedGroup.groupName}</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">客群规模</div><div className="text-sm font-medium">{selectedGroup.groupScale.toLocaleString()}人</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">区域</div><div className="text-sm">{selectedGroup.region}</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">采集时间</div><div className="text-sm">{selectedGroup.collectTime}</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">有效期至</div><div className="text-sm">{getValidUntil(selectedGroup.collectTime, selectedGroup.validHours)}</div></div>
              </div>
              {selectedGroup.recommendedStrategy && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-xs text-primary mb-1">推荐策略</div><div className="text-sm font-medium">{selectedGroup.recommendedStrategy}</div>
                </div>
              )}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0">派发系统</span>
                  <div className="flex-1 flex items-center gap-2 p-2.5 bg-primary/5 rounded-md border border-primary/20">
                    <input type="radio" checked readOnly className="accent-primary" />
                    <span className="text-sm font-medium text-primary">网格通</span>
                    <span className="text-xs text-muted-foreground ml-1">当前仅支持网格通系统</span>
                  </div>
                </div>
                <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>执行角色</span>
                  <div className="flex-1 flex gap-3">
                    {['地市集运', '网格经理'].map(role => (
                      <label key={role} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${executionRole === role ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                        <input type="radio" name="groupExecutionRole" checked={executionRole === role} onChange={() => setExecutionRole(role)} className="accent-primary" />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0">计划完成时间</span><Input type="datetime-local" className="flex-1" /></div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100"><div className="text-sm text-amber-700">调度后，{selectedGroup.groupScale.toLocaleString()}人将按网格拆分为子工单，通过网格通分配至{executionRole}处理。</div></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>取消</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={confirmSchedule}>确认调度</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 废弃确认弹窗 */}
      <Dialog open={abandonDialogOpen} onOpenChange={setAbandonDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>废弃确认</DialogTitle>
            <DialogDescription>确认将此客群商机标记为废弃？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">商机ID</div><div className="font-medium text-primary">{selectedGroup.id}</div></div>
              <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">客群名称</div><div className="text-sm">{selectedGroup.groupName} ({selectedGroup.groupScale}人)</div></div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100"><div className="text-sm text-red-700">废弃后，该客群商机将不再参与调度，已分配的工单将被回收。</div></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbandonDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmAbandon}>确认废弃</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" />客群商机详情</DialogTitle>
            <DialogDescription>查看客群商机详细信息与执行情况</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="w-full grid grid-cols-2"><TabsTrigger value="basic">基本信息</TabsTrigger><TabsTrigger value="execution">执行情况</TabsTrigger></TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">商机ID</div><div className="font-medium text-primary">{selectedGroup.id}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">评级</div><Badge variant="outline" className={`${RATING_LEVELS[selectedGroup.rating].color} font-medium`}>{RATING_LEVELS[selectedGroup.rating].label}</Badge></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">客群名称</div><div className="text-sm font-medium">{selectedGroup.groupName}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">客群规模</div><div className="text-sm font-medium text-primary">{selectedGroup.groupScale.toLocaleString()}人</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">区域</div><div className="text-sm">{selectedGroup.region}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">运营场景</div><div className="text-sm text-primary">{selectedGroup.businessScenario}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">采集时间</div><div className="text-sm">{selectedGroup.collectTime}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">有效期至</div><div className="text-sm">{getValidUntil(selectedGroup.collectTime, selectedGroup.validHours)}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg col-span-2"><div className="text-xs text-muted-foreground mb-1">商机分类</div><div className="text-sm">{selectedGroup.category}</div></div>
                    {selectedGroup.recommendedStrategy && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 col-span-2"><div className="text-xs text-primary mb-1">推荐策略</div><div className="text-sm font-medium">{selectedGroup.recommendedStrategy}</div></div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="execution" className="space-y-4 pt-4">
                  {selectedGroup.executionProgress ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center"><div className="text-2xl font-bold text-blue-600">{selectedGroup.executionProgress.dispatched}</div><div className="text-xs text-muted-foreground mt-1">已派发</div></div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center"><div className="text-2xl font-bold text-amber-600">{selectedGroup.executionProgress.executing}</div><div className="text-xs text-muted-foreground mt-1">执行中</div></div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center"><div className="text-2xl font-bold text-green-600">{selectedGroup.executionProgress.completed}</div><div className="text-xs text-muted-foreground mt-1">已完成</div></div>
                      </div>
                      {selectedGroup.conversionResult && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">转化率</div><div className="text-xl font-bold text-green-600">{selectedGroup.conversionResult.successRate}%</div></div>
                          <div className="p-4 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">平均响应时间</div><div className="text-xl font-bold text-primary">{selectedGroup.conversionResult.avgResponseTime}</div></div>
                        </div>
                      )}
                      {selectedGroup.scheduleInfo && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm font-medium mb-2">调度信息</div>
                          <div className="grid grid-cols-3 gap-3 text-sm"><div><span className="text-muted-foreground">渠道：</span>{selectedGroup.scheduleInfo.channel}</div><div><span className="text-muted-foreground">执行团队：</span>{selectedGroup.scheduleInfo.executor}</div><div><span className="text-muted-foreground">计划：</span>{selectedGroup.scheduleInfo.plan}</div></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">暂无执行数据</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailDialogOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
