'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Check, X, FileText, Plus } from 'lucide-react';

// ==================== 类型定义 ====================

type RatingLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'forwarded' | 'expired';

// 临时调级记录
interface RatingAdjustment {
  id: string;
  opportunityName: string;
  opportunityId: string;
  originalRating: RatingLevel;
  requestedRating: RatingLevel;
  reason: string;
  durationDays: number;
  expireAt: string;
  applicant: string;
  applyTime: string;
  status: ApprovalStatus;
  approver: string;
  approvalTime?: string;
  approvalOpinion?: string;
  forwardedTo?: string;
  attachments?: string[];
}

// ==================== 工具函数 ====================

const ratingLabel = (level: RatingLevel): string => {
  const map: Record<RatingLevel, string> = { HIGH: '高', MEDIUM: '中', LOW: '低' };
  return map[level];
};

const ratingBadgeClass = (level: RatingLevel): string => {
  const map: Record<RatingLevel, string> = {
    HIGH: 'bg-red-50 text-red-600 border-red-200',
    MEDIUM: 'bg-orange-50 text-orange-600 border-orange-200',
    LOW: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[level];
};

const statusLabel = (status: ApprovalStatus): string => {
  const map: Record<ApprovalStatus, string> = {
    pending: '待审批',
    approved: '已同意',
    rejected: '已拒绝',
    forwarded: '已转交',
    expired: '已过期',
  };
  return map[status];
};

const statusBadgeClass = (status: ApprovalStatus): string => {
  const map: Record<ApprovalStatus, string> = {
    pending: 'bg-blue-50 text-blue-600 border-blue-200',
    approved: 'bg-green-50 text-green-600 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
    forwarded: 'bg-purple-50 text-purple-600 border-purple-200',
    expired: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  return map[status];
};

// ==================== 快捷审批术语 ====================

const BUILTIN_PHRASES = [
  '同意调级',
  '不同意调级',
  '客户情况需进一步核实，暂不调级',
  '注意跟踪转化效果',
  '暂不调级',
];

const CUSTOM_PHRASES_STORAGE_KEY = 'rating-approval-phrases';

const loadCustomPhrases = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PHRASES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

const saveCustomPhrases = (phrases: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CUSTOM_PHRASES_STORAGE_KEY, JSON.stringify(phrases));
  } catch {
    // 忽略写入异常（如配额溢出、隐私模式）
  }
};

// ==================== 模拟数据 ====================

const mockAdjustments: RatingAdjustment[] = [
  {
    id: 'ADJ20260803001',
    opportunityName: '乌鲁木齐天山区携转挽留商机',
    opportunityId: 'SJ202608030001',
    originalRating: 'MEDIUM',
    requestedRating: 'HIGH',
    reason: '该客户为VIP客户，近期有降档挽留需求，需优先处理',
    durationDays: 7,
    expireAt: '2026-08-10 23:59',
    applicant: '张运营',
    applyTime: '2026-08-03 10:30',
    status: 'pending',
    approver: '李主管',
    attachments: ['调级说明.pdf'],
  },
  {
    id: 'ADJ20260802002',
    opportunityName: '克拉玛依流量达量预警商机',
    opportunityId: 'SJ202608020015',
    originalRating: 'LOW',
    requestedRating: 'MEDIUM',
    reason: '客户近期流量使用突增，存在高价值转化可能',
    durationDays: 14,
    expireAt: '2026-08-16 23:59',
    applicant: '王运营',
    applyTime: '2026-08-02 14:20',
    status: 'pending',
    approver: '赵部长',
  },
  {
    id: 'ADJ20260801003',
    opportunityName: '昌吉中高端客户保有机遇',
    opportunityId: 'SJ202608010008',
    originalRating: 'HIGH',
    requestedRating: 'LOW',
    reason: '客户已确认不再续约，降低评级避免资源浪费',
    durationDays: 3,
    expireAt: '2026-08-04 23:59',
    applicant: '王运营',
    applyTime: '2026-08-01 14:20',
    status: 'rejected',
    approver: '赵部长',
    approvalTime: '2026-08-01 16:00',
    approvalOpinion: '客户情况需进一步核实，暂不调级',
  },
  {
    id: 'ADJ20260728004',
    opportunityName: '伊犁家庭融合套餐升级商机',
    opportunityId: 'SJ202607280032',
    originalRating: 'MEDIUM',
    requestedRating: 'HIGH',
    reason: '家庭客户多成员同时有升级需求，价值较高',
    durationDays: 7,
    expireAt: '2026-08-04 23:59',
    applicant: '张运营',
    applyTime: '2026-07-28 09:15',
    status: 'expired',
    approver: '李主管',
    approvalTime: '2026-07-28 11:00',
    approvalOpinion: '同意调级',
  },
  {
    id: 'ADJ20260727005',
    opportunityName: '喀什零流量客户激活商机',
    opportunityId: 'SJ202607270045',
    originalRating: 'LOW',
    requestedRating: 'MEDIUM',
    reason: '客户为零流量但属于高ARPU用户，需中等优先级处理',
    durationDays: 10,
    expireAt: '2026-08-06 23:59',
    applicant: '刘运营',
    applyTime: '2026-07-27 08:30',
    status: 'approved',
    approver: '李主管',
    approvalTime: '2026-07-27 10:00',
    approvalOpinion: '同意，注意跟踪转化效果',
  },
  {
    id: 'ADJ20260726006',
    opportunityName: '巴州地板价套餐查询商机',
    opportunityId: 'SJ202607260019',
    originalRating: 'MEDIUM',
    requestedRating: 'HIGH',
    reason: '客户连续30天内查询地板价套餐超2次，转化意向强烈',
    durationDays: 5,
    expireAt: '2026-07-31 23:59',
    applicant: '陈运营',
    applyTime: '2026-07-26 11:00',
    status: 'forwarded',
    approver: '赵部长',
    approvalTime: '2026-07-26 14:00',
    approvalOpinion: '转交市场部总经理审批',
    forwardedTo: '孙总经理',
  },
];

// ==================== 主组件 ====================

export default function RatingAdjustmentPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'processed' | 'all'>('pending');
  const searchParams = useSearchParams();
  const [searchCode, setSearchCode] = useState('');
  const [searchApplicant, setSearchApplicant] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTimeStart, setSearchTimeStart] = useState('');
  const [searchTimeEnd, setSearchTimeEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 从URL参数读取商机编码并自动填充查询条件
  useEffect(() => {
    const code = searchParams.get('opportunityCode');
    if (code) {
      setSearchCode(code);
    }
  }, [searchParams]);

  // 审批弹窗
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentAdjustment, setCurrentAdjustment] = useState<RatingAdjustment | null>(null);
  const [approvalOpinion, setApprovalOpinion] = useState('');

  // 快捷审批术语（自定义术语持久化到 localStorage）
  const [customPhrases, setCustomPhrases] = useState<string[]>(() => loadCustomPhrases());
  const [addingPhrase, setAddingPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState('');

  // 自定义术语增删时同步写入 localStorage
  const handleAddCustomPhrase = () => {
    const trimmed = newPhrase.trim();
    if (!trimmed) {
      setAddingPhrase(false);
      setNewPhrase('');
      return;
    }
    if (customPhrases.includes(trimmed) || BUILTIN_PHRASES.includes(trimmed)) {
      setAddingPhrase(false);
      setNewPhrase('');
      return;
    }
    const next = [...customPhrases, trimmed];
    setCustomPhrases(next);
    saveCustomPhrases(next);
    setAddingPhrase(false);
    setNewPhrase('');
  };

  const handleDeleteCustomPhrase = (phrase: string) => {
    const next = customPhrases.filter((item) => item !== phrase);
    setCustomPhrases(next);
    saveCustomPhrases(next);
  };

  const handlePickPhrase = (phrase: string) => {
    setApprovalOpinion(phrase);
  };

  // 按Tab筛选
  const getFilteredByTab = (data: RatingAdjustment[]) => {
    if (activeTab === 'pending') return data.filter(item => item.status === 'pending');
    if (activeTab === 'processed') return data.filter(item => item.status !== 'pending');
    return data;
  };

  // 按筛选条件过滤
  const getFilteredData = () => {
    let result = getFilteredByTab(mockAdjustments);
    if (searchCode) {
      result = result.filter(item => item.opportunityId.includes(searchCode));
    }
    if (searchApplicant) {
      result = result.filter(item => item.applicant.includes(searchApplicant));
    }
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    if (searchTimeStart) {
      result = result.filter(item => item.applyTime >= searchTimeStart);
    }
    if (searchTimeEnd) {
      result = result.filter(item => item.applyTime <= searchTimeEnd + ' 23:59');
    }
    return result;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Tab数量统计
  const pendingCount = mockAdjustments.filter(item => item.status === 'pending').length;
  const processedCount = mockAdjustments.filter(item => item.status !== 'pending').length;

  // 重置筛选
  const handleReset = () => {
    setSearchCode('');
    setSearchApplicant('');
    setFilterStatus('all');
    setSearchTimeStart('');
    setSearchTimeEnd('');
    setCurrentPage(1);
  };

  // 打开审批弹窗
  const handleApproval = (item: RatingAdjustment) => {
    setCurrentAdjustment(item);
    setApprovalOpinion('');
    setApprovalDialogOpen(true);
  };

  // 打开详情弹窗
  const handleDetail = (item: RatingAdjustment) => {
    setCurrentAdjustment(item);
    setDetailDialogOpen(true);
  };

  // 提交审批
  const handleSubmitApproval = (action: 'approve' | 'reject') => {
    // 实际场景调用后端接口
    setApprovalDialogOpen(false);
    setApprovalOpinion('');
  };

  const tabs = [
    { key: 'pending' as const, label: '待审批', count: pendingCount },
    { key: 'processed' as const, label: '已审批', count: processedCount },
    { key: 'all' as const, label: '全部', count: mockAdjustments.length },
  ];

  return (
    <div className="p-6">
      {/* 页面标题 + 新增按钮 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">商机调级管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理商机评级调整申请的审批与记录</p>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 筛选区域 */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">商机编码:</span>
            <Input
              className="w-48"
              placeholder="请输入商机编码"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">申请人:</span>
            <Input
              className="w-32"
              placeholder="请输入申请人"
              value={searchApplicant}
              onChange={(e) => setSearchApplicant(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">审批状态:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="approved">已同意</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">申请时间:</span>
            <Input
              type="date"
              className="w-40"
              value={searchTimeStart}
              onChange={(e) => setSearchTimeStart(e.target.value)}
            />
            <span className="text-sm text-gray-400">至</span>
            <Input
              type="date"
              className="w-40"
              value={searchTimeEnd}
              onChange={(e) => setSearchTimeEnd(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleReset}>重置</Button>
            <Button size="sm" onClick={() => setCurrentPage(1)}>
              <Search className="w-4 h-4 mr-1" />
              搜索
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-32">申请编号</TableHead>
              <TableHead>商机名称</TableHead>
              <TableHead className="w-32">商机编号</TableHead>
              <TableHead className="w-16">原评级</TableHead>
              <TableHead className="w-16">申请评级</TableHead>
              <TableHead className="w-48">调级原因</TableHead>
              <TableHead className="w-20">申请人</TableHead>
              <TableHead className="w-32">申请时间</TableHead>
              <TableHead className="w-20">审批状态</TableHead>
              <TableHead className="w-20">审批人</TableHead>
              <TableHead className="w-20">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-gray-400 py-12">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs text-gray-600">{item.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{item.opportunityName}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{item.opportunityId}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${ratingBadgeClass(item.originalRating)}`}>
                      {ratingLabel(item.originalRating)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${ratingBadgeClass(item.requestedRating)}`}>
                      {ratingLabel(item.requestedRating)}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm max-w-xs truncate" title={item.reason}>
                    {item.reason}
                  </TableCell>
                  <TableCell className="text-gray-600">{item.applicant}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{item.applyTime}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${statusBadgeClass(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.approver}</TableCell>
                  <TableCell>
                    {item.status === 'pending' ? (
                      <Button variant="outline" size="sm" onClick={() => handleApproval(item)}>
                        审批
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleDetail(item)}>
                        详情
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              共 {filteredData.length} 条，第 {currentPage}/{totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 审批弹窗 */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>调级审批</DialogTitle>
          </DialogHeader>
          {currentAdjustment && (
            <div className="space-y-4">
              {/* 调级申请信息 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="text-sm font-medium text-gray-700">申请信息</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">商机名称：</span>
                    <span className="text-gray-900 font-medium">{currentAdjustment.opportunityName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">商机编号：</span>
                    <span className="text-gray-900 font-mono text-xs">{currentAdjustment.opportunityId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">原评级：</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${ratingBadgeClass(currentAdjustment.originalRating)}`}>
                      {ratingLabel(currentAdjustment.originalRating)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">申请评级：</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${ratingBadgeClass(currentAdjustment.requestedRating)}`}>
                      {ratingLabel(currentAdjustment.requestedRating)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">申请人：</span>
                    <span className="text-gray-900">{currentAdjustment.applicant}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">申请时间：</span>
                    <span className="text-gray-900">{currentAdjustment.applyTime}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 mb-1">调级原因：</div>
                    <div className="text-gray-900 bg-white rounded p-2 border border-gray-200">{currentAdjustment.reason}</div>
                  </div>
                  {currentAdjustment.attachments && currentAdjustment.attachments.length > 0 && (
                    <div className="col-span-2">
                      <div className="text-gray-500 mb-1">附件：</div>
                      <div className="flex flex-wrap gap-2">
                        {currentAdjustment.attachments.map((file, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs">
                            <FileText className="w-3 h-3" />
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 审批操作区 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">审批意见 <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder="请输入审批意见"
                  value={approvalOpinion}
                  onChange={(e) => setApprovalOpinion(e.target.value)}
                  rows={3}
                />

                {/* 快捷术语区 */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="text-xs font-medium text-gray-500">快捷术语</div>
                  <div className="flex flex-wrap gap-2">
                    {BUILTIN_PHRASES.map((phrase) => (
                      <Badge
                        key={phrase}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        onClick={() => handlePickPhrase(phrase)}
                      >
                        {phrase}
                      </Badge>
                    ))}
                    {customPhrases.map((phrase) => (
                      <Badge
                        key={phrase}
                        variant="outline"
                        className="group cursor-pointer bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                        onClick={() => handlePickPhrase(phrase)}
                      >
                        {phrase}
                        <button
                          type="button"
                          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 hover:bg-amber-200 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomPhrase(phrase);
                          }}
                          title="删除"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {addingPhrase ? (
                      <div className="flex items-center gap-1">
                        <Input
                          autoFocus
                          size={20}
                          className="h-7 w-40 text-xs"
                          placeholder="输入术语后回车"
                          value={newPhrase}
                          onChange={(e) => setNewPhrase(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomPhrase();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setAddingPhrase(false);
                              setNewPhrase('');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={handleAddCustomPhrase}
                        >
                          确定
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => {
                            setAddingPhrase(false);
                            setNewPhrase('');
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        onClick={() => setAddingPhrase(true)}
                        title="添加自定义术语"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => handleSubmitApproval('reject')}>
              <X className="w-4 h-4 mr-1" />
              拒绝
            </Button>
            <Button onClick={() => handleSubmitApproval('approve')}>
              <Check className="w-4 h-4 mr-1" />
              同意
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>调级详情</DialogTitle>
          </DialogHeader>
          {currentAdjustment && (
            <div className="space-y-4">
              {/* 申请信息 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="text-sm font-medium text-gray-700">申请信息</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">申请编号：</span>
                    <span className="text-gray-900 font-mono text-xs">{currentAdjustment.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">商机名称：</span>
                    <span className="text-gray-900 font-medium">{currentAdjustment.opportunityName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">商机编号：</span>
                    <span className="text-gray-900 font-mono text-xs">{currentAdjustment.opportunityId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">申请人：</span>
                    <span className="text-gray-900">{currentAdjustment.applicant}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">申请时间：</span>
                    <span className="text-gray-900">{currentAdjustment.applyTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">原评级：</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${ratingBadgeClass(currentAdjustment.originalRating)}`}>
                      {ratingLabel(currentAdjustment.originalRating)}
                    </span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="text-gray-500">申请评级：</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${ratingBadgeClass(currentAdjustment.requestedRating)}`}>
                      {ratingLabel(currentAdjustment.requestedRating)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 mb-1">调级原因：</div>
                    <div className="text-gray-900 bg-white rounded p-2 border border-gray-200">{currentAdjustment.reason}</div>
                  </div>
                  {currentAdjustment.attachments && currentAdjustment.attachments.length > 0 && (
                    <div className="col-span-2">
                      <div className="text-gray-500 mb-1">附件：</div>
                      <div className="flex flex-wrap gap-2">
                        {currentAdjustment.attachments.map((file, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs">
                            <FileText className="w-3 h-3" />
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 审批结果 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="text-sm font-medium text-gray-700">审批结果</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">审批状态：</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${statusBadgeClass(currentAdjustment.status)}`}>
                      {statusLabel(currentAdjustment.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">审批人：</span>
                    <span className="text-gray-900">{currentAdjustment.approver}</span>
                  </div>
                  {currentAdjustment.approvalTime && (
                    <div>
                      <span className="text-gray-500">审批时间：</span>
                      <span className="text-gray-900">{currentAdjustment.approvalTime}</span>
                    </div>
                  )}
                  {currentAdjustment.forwardedTo && (
                    <div>
                      <span className="text-gray-500">转交给：</span>
                      <span className="text-gray-900">{currentAdjustment.forwardedTo}</span>
                    </div>
                  )}
                  {currentAdjustment.approvalOpinion && (
                    <div className="col-span-2">
                      <div className="text-gray-500 mb-1">审批意见：</div>
                      <div className="text-gray-900 bg-white rounded p-2 border border-gray-200">{currentAdjustment.approvalOpinion}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
