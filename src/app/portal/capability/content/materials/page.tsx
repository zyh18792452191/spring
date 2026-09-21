'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Download, Upload, LayoutGrid, List, Building2, Users, Calendar, ChevronDown, ChevronRight, ArrowLeft, Layers, Tag, Image, Video, FileText as FileIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MaterialFormDialog } from '@/components/material-management/MaterialFormDialog';
import { toast } from 'sonner';

// 素材类型
const materialTypes = [
  { id: 'all', name: '全部类型' },
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
  { id: 'document', name: '文档' },
];

// 业务类型
const businessTypes = [
  { id: 'all', name: '全部业务' },
  { id: 'product_intro', name: '产品介绍' },
  { id: 'marketing', name: '营销推广' },
  { id: 'training', name: '培训教程' },
  { id: 'news', name: '新闻资讯' },
];

// 状态
const statuses = [
  { id: 'all', name: '全部状态' },
  { id: 'draft', name: '草稿' },
  { id: 'published', name: '已发布' },
];

interface Material {
  id: number;
  material_code: string;
  material_name: string;
  material_type: string;
  business_type: string;
  visibility: string;
  file_key: string;
  file_url: string;
  file_size: number;
  file_mime_type: string;
  cover_key: string;
  cover_url: string;
  copyright_info: string;
  copyright_statement: string;
  copyright_proof_key: string;
  copyright_proof_url: string;
  description: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function MaterialManagementPageContent() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [materialType, setMaterialType] = useState('all');
  const [businessType, setBusinessType] = useState('all');
  const [status, setStatus] = useState('all');

  // 对话框状态
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 加载素材列表
  const loadMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchKeyword) params.append('materialName', searchKeyword);
      if (materialType !== 'all') params.append('materialType', materialType);
      if (businessType !== 'all') params.append('businessType', businessType);
      if (status !== 'all') params.append('status', status);

      const response = await fetch(`/api/materials?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setMaterials(result.data);
        setTotal(result.total);
      } else {
        toast.error(result.error || '加载素材列表失败');
      }
    } catch (error) {
      console.error('加载素材列表失败:', error);
      toast.error('加载素材列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [page, pageSize]);

  // 搜索
  const handleSearch = () => {
    setPage(1);
    loadMaterials();
  };

  // 重置
  const handleReset = () => {
    setSearchKeyword('');
    setMaterialType('all');
    setBusinessType('all');
    setStatus('all');
    setPage(1);
    loadMaterials();
  };

  // 打开新增对话框
  const handleAdd = () => {
    setEditingMaterial(null);
    setShowFormDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setShowFormDialog(true);
  };

  // 删除素材
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该素材吗？')) return;

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('删除成功');
        loadMaterials();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除素材失败:', error);
      toast.error('删除素材失败');
    }
  };

  // 表单保存成功回调
  const handleFormSave = () => {
    setShowFormDialog(false);
    setEditingMaterial(null);
    loadMaterials();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // 获取素材类型图标
  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // 获取可见权限文本
  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'national':
        return '全国';
      case 'province':
        return '地州';
      default:
        return visibility;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'published':
        return '已发布';
      default:
        return status;
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(materials.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 单选
  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">素材管理</h1>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>素材名称</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="请输入素材名称"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>

            <div className="w-[180px]">
              <Label>素材类型</Label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <Label>业务类型</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <Label>状态</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAdd} className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              新增素材
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 素材列表 */}
      <Card>
        <CardHeader>
          <CardTitle>素材列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.length === materials.length && materials.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">素材ID</TableHead>
                    <TableHead>素材名称</TableHead>
                    <TableHead className="w-[120px]">素材类型</TableHead>
                    <TableHead className="w-[120px]">业务类型</TableHead>
                    <TableHead className="w-[100px]">创建人</TableHead>
                    <TableHead className="w-[160px]">创建时间</TableHead>
                    <TableHead className="w-[100px]">状态</TableHead>
                    <TableHead className="w-[200px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(material.id)}
                            onCheckedChange={(checked) => handleSelect(material.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-xs">{material.material_code}</TableCell>
                        <TableCell className="font-medium">{material.material_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMaterialTypeIcon(material.material_type)}
                            {material.material_type}
                          </div>
                        </TableCell>
                        <TableCell>{material.business_type}</TableCell>
                        <TableCell>{material.created_by}</TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {new Date(material.created_at).toLocaleString('zh-CN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={material.status === 'published' ? 'default' : 'secondary'}>
                            {getStatusText(material.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(material.file_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(material)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 分页 */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                共 {total} 条数据，第 {page} / {Math.ceil(total / pageSize)} 页
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(parseInt(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10条/页</SelectItem>
                    <SelectItem value="20">20条/页</SelectItem>
                    <SelectItem value="50">50条/页</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <MaterialFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        material={editingMaterial}
        onSave={handleFormSave}
      />
    </div>
  );
}

export default function MaterialManagementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <MaterialManagementPageContent />
    </Suspense>
  );
}
