'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, ArrowUpToLine, ArrowDownToLine } from "lucide-react";

// 预置商机源数据
const initialSourceData: SourceItem[] = [
  { id: 1, name: 'CRM系统', code: 'CRM', status: 'approved', createTime: '2024-01-15 10:30', creator: '张三' },
  { id: 2, name: '营销活动平台', code: 'MKT', status: 'pending', createTime: '2024-01-15 09:45', creator: '李四' },
  { id: 3, name: '外呼系统', code: 'OUTCALL', status: 'approved', createTime: '2024-01-15 08:20', creator: '王五' },
  { id: 4, name: '线上渠道', code: 'ONLINE', status: 'offline', createTime: '2024-01-14 18:00', creator: '赵六' },
  { id: 5, name: '线下营业厅', code: 'OFFLINE', status: 'online', createTime: '2024-01-15 10:00', creator: '钱七' },
  { id: 6, name: '代理商系统', code: 'AGENT', status: 'pending', createTime: '2024-01-13 14:20', creator: '孙八' },
  { id: 7, name: '微信小程序', code: 'WXAPP', status: 'approved', createTime: '2024-01-12 16:30', creator: '周九' },
  { id: 8, name: '企业微信', code: 'QYWX', status: 'online', createTime: '2024-01-11 09:00', creator: '吴十' },
];

// 商机源数据类型
interface SourceItem {
  id: number;
  name: string;
  code: string;
  status: SourceStatus;
  createTime: string;
  creator: string;
}

// 状态类型
type SourceStatus = 'pending' | 'approved' | 'rejected' | 'online' | 'offline';

// 获取状态显示
const getStatusDisplay = (status: SourceStatus) => {
  const statusMap: Record<SourceStatus, { label: string; variant: string }> = {
    pending: { label: '待审批', variant: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '已审批', variant: 'bg-green-100 text-green-700' },
    rejected: { label: '已拒绝', variant: 'bg-red-100 text-red-700' },
    online: { label: '已上架', variant: 'bg-blue-100 text-blue-700' },
    offline: { label: '已下架', variant: 'bg-gray-100 text-gray-700' },
  };
  return statusMap[status];
};

export default function SourceManagementPage() {
  const [sourceList, setSourceList] = useState<SourceItem[]>(initialSourceData);
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceItem | null>(null);
  // 表单受控状态
  const [formData, setFormData] = useState({ name: '', code: '', creator: '', status: 'pending' as SourceStatus });

  // 筛选后的列表
  const filteredList = sourceList.filter(item => {
    const matchName = item.name.includes(searchName) || item.code.toLowerCase().includes(searchName.toLowerCase());
    const matchStatus = searchStatus === "all" || item.status === searchStatus;
    return matchName && matchStatus;
  });

  // 打开新增弹窗
  const openAddDialog = () => {
    setEditingSource(null);
    setFormData({ name: '', code: '', creator: '', status: 'pending' });
    setIsDialogOpen(true);
  };

  // 打开编辑弹窗
  const openEditDialog = (source: SourceItem) => {
    setEditingSource(source);
    setFormData({ name: source.name, code: source.code, creator: source.creator, status: source.status });
    setIsDialogOpen(true);
  };

  // 保存（新增/编辑）
  const handleSave = () => {
    if (!formData.name.trim()) { toast.error('请输入商机源名称'); return; }
    if (!formData.code.trim()) { toast.error('请输入商机源编码'); return; }
    if (!formData.creator.trim()) { toast.error('请输入创建人'); return; }
    // 编码唯一性校验
    const codeTrim = formData.code.trim().toUpperCase();
    const duplicate = sourceList.find(item => item.code === codeTrim && item.id !== editingSource?.id);
    if (duplicate) { toast.error('商机源编码已存在', { description: `编码 ${codeTrim} 已被「${duplicate.name}」占用` }); return; }
    if (editingSource) {
      setSourceList(prev => prev.map(item => item.id === editingSource.id ? {
        ...item, name: formData.name.trim(), code: codeTrim, creator: formData.creator.trim(), status: formData.status,
      } : item));
      toast.success('商机源已更新');
    } else {
      const newId = Math.max(0, ...sourceList.map(s => s.id)) + 1;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const createTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setSourceList(prev => [...prev, { id: newId, name: formData.name.trim(), code: codeTrim, status: formData.status, createTime, creator: formData.creator.trim() }]);
      toast.success('商机源已新增');
    }
    setIsDialogOpen(false);
  };

  // 审批
  const handleApprove = (id: number) => {
    setSourceList(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'approved' as SourceStatus } : item
    ));
  };

  // 拒绝
  const handleReject = (id: number) => {
    setSourceList(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'rejected' as SourceStatus } : item
    ));
  };

  // 上架
  const handleOnline = (id: number) => {
    setSourceList(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'online' as SourceStatus } : item
    ));
  };

  // 下架
  const handleOffline = (id: number) => {
    setSourceList(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'offline' as SourceStatus } : item
    ));
  };

  // 删除
  const handleDelete = (id: number) => {
    setSourceList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">商机源管理</h1>
        <Button 
          className="bg-[#0085D0] hover:bg-[#0070B8]"
          onClick={openAddDialog}
        >
          <Plus className="w-4 h-4 mr-1" />
          新增
        </Button>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">商机源名称：</span>
            <Input
              placeholder="请输入商机源名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">商机状态：</span>
            <Select value={searchStatus} onValueChange={setSearchStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="approved">已审批</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="online">已上架</SelectItem>
                <SelectItem value="offline">已下架</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setSearchName(""); setSearchStatus("all"); }}>
              重置
            </Button>
            <Button className="bg-[#0085D0] hover:bg-[#0070B8]">
              <Search className="w-4 h-4 mr-1" />
              查询
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">商机源名称</TableHead>
              <TableHead className="w-[12%]">商机源编码</TableHead>
              <TableHead className="w-[13%]">状态</TableHead>
              <TableHead className="w-[18%]">创建时间</TableHead>
              <TableHead className="w-[13%]">创建人</TableHead>
              <TableHead className="w-[22%] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((item) => {
                const statusInfo = getStatusDisplay(item.status as SourceStatus);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-600">{item.code}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{item.createTime}</TableCell>
                    <TableCell className="text-gray-500">{item.creator}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* 待审批状态 */}
                        {item.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600"
                              onClick={() => handleApprove(item.id)}
                            >
                              审批
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleReject(item.id)}
                            >
                              拒绝
                            </Button>
                          </>
                        )}
                        {/* 审批成功状态 */}
                        {item.status === 'approved' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOnline(item.id)}
                            >
                              上架
                            </Button>
                          </>
                        )}
                        {/* 审批失败状态 */}
                        {item.status === 'rejected' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                        )}
                        {/* 已上架状态 */}
                        {item.status === 'online' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOffline(item.id)}
                          >
                            下架
                          </Button>
                        )}
                        {/* 已下架状态 */}
                        {item.status === 'offline' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOnline(item.id)}
                            >
                              上架
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? "编辑商机源" : "新增商机源"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>商机源名称 *</Label>
              <Input placeholder="请输入商机源名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>商机源编码 *</Label>
              <Input placeholder="请输入商机源编码（如 CRM）" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>创建人 *</Label>
              <Input placeholder="请输入创建人" value={formData.creator} onChange={(e) => setFormData({ ...formData, creator: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as SourceStatus })}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="approved">已审批</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="online">已上架</SelectItem>
                  <SelectItem value="offline">已下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button className="bg-[#0085D0] hover:bg-[#0070B8]" onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
