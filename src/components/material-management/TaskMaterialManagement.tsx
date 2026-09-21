'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Plus, FileText, Trash2, X, Image as ImageIcon, Video, FileText as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MaterialFormDialog } from '@/components/material-management/MaterialFormDialog';
import { toast } from 'sonner';

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

interface TaskMaterialManagementProps {
  taskId: number;
  onCancel?: () => void;
}

function TaskMaterialManagementContent({ taskId, onCancel }: TaskMaterialManagementProps) {
  const [associatedMaterials, setAssociatedMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  // 关联素材弹窗
  const [showAssociateDialog, setShowAssociateDialog] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);

  // 新增素材弹窗
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [materialType, setMaterialType] = useState('all');

  // 加载已关联素材
  const loadAssociatedMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/materials/associations?taskId=${taskId}`);
      const result = await response.json();

      if (result.success) {
        setAssociatedMaterials(result.data);
      } else {
        toast.error(result.error || '加载关联素材失败');
      }
    } catch (error) {
      console.error('加载关联素材失败:', error);
      toast.error('加载关联素材失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssociatedMaterials();
  }, [taskId]);

  // 加载可选素材列表
  const loadAvailableMaterials = async () => {
    setAvailableLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '100',
      });

      if (searchKeyword) params.append('materialName', searchKeyword);
      if (materialType !== 'all') params.append('materialType', materialType);

      const response = await fetch(`/api/materials?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        // 过滤掉已关联的素材
        const associatedIds = associatedMaterials.map(m => m.id);
        const available = result.data.filter((m: Material) => !associatedIds.includes(m.id));
        setAvailableMaterials(available);
      } else {
        toast.error(result.error || '加载素材列表失败');
      }
    } catch (error) {
      console.error('加载素材列表失败:', error);
      toast.error('加载素材列表失败');
    } finally {
      setAvailableLoading(false);
    }
  };

  // 打开关联弹窗
  const handleOpenAssociateDialog = () => {
    setShowAssociateDialog(true);
    setSearchKeyword('');
    setMaterialType('all');
    setSelectedMaterialIds([]);
    loadAvailableMaterials();
  };

  // 确认关联
  const handleAssociate = async () => {
    if (selectedMaterialIds.length === 0) {
      toast.error('请选择要关联的素材');
      return;
    }

    try {
      const response = await fetch('/api/materials/associations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          materialIds: selectedMaterialIds,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('关联成功');
        setShowAssociateDialog(false);
        setSelectedMaterialIds([]);
        loadAssociatedMaterials();
      } else {
        toast.error(result.error || '关联失败');
      }
    } catch (error) {
      console.error('关联失败:', error);
      toast.error('关联失败');
    }
  };

  // 取消关联
  const handleUnassociate = async (materialId: number) => {
    if (!confirm('确定要取消关联吗？')) return;

    try {
      const response = await fetch(
        `/api/materials/associations?taskId=${taskId}&materialId=${materialId}`,
        {
          method: 'DELETE',
        }
      );
      const result = await response.json();

      if (result.success) {
        toast.success('取消关联成功');
        loadAssociatedMaterials();
      } else {
        toast.error(result.error || '取消关联失败');
      }
    } catch (error) {
      console.error('取消关联失败:', error);
      toast.error('取消关联失败');
    }
  };

  // 打开新增素材
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowFormDialog(true);
  };

  // 表单保存成功
  const handleFormSave = () => {
    setShowFormDialog(false);
    setEditingMaterial(null);
    loadAssociatedMaterials();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // 获取素材类型中文名
  const getMaterialTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'image': '图片',
      'video': '视频',
      'document': '文档',
      'audio': '音频'
    };
    return typeMap[type] || type;
  };

  // 获取业务类型中文名
  const getBusinessTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'marketing': '营销',
      'public_relations': '公关',
      'product': '产品',
      'brand': '品牌',
      'training': '培训',
      'operations': '运营'
    };
    return typeMap[type] || type;
  };

  // 获取素材类型图标
  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMaterialIds(availableMaterials.map(m => m.id));
    } else {
      setSelectedMaterialIds([]);
    }
  };

  // 单选
  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedMaterialIds([...selectedMaterialIds, id]);
    } else {
      setSelectedMaterialIds(selectedMaterialIds.filter(sid => sid !== id));
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">运营任务-素材管理</h1>
      </div>

      {/* 操作按钮 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleOpenAssociateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              关联素材
            </Button>
            <Button variant="outline" onClick={handleAddMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              新增素材
            </Button>
            <div className="text-sm text-gray-600">
              已关联 <span className="font-bold text-blue-600">{associatedMaterials.length}</span> 个素材
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 已关联素材列表 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              加载中...
            </div>
          ) : associatedMaterials.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              暂无关联素材
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">素材ID</TableHead>
                    <TableHead>素材名称</TableHead>
                    <TableHead className="w-[120px]">素材类型</TableHead>
                    <TableHead className="w-[120px]">业务类型</TableHead>
                    <TableHead className="w-[100px]">创建人</TableHead>
                    <TableHead className="w-[160px]">创建时间</TableHead>
                    <TableHead className="w-[100px]">状态</TableHead>
                    <TableHead className="w-[120px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associatedMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="text-xs">{material.material_code}</TableCell>
                      <TableCell className="font-medium">{material.material_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getMaterialTypeIcon(material.material_type)}
                          {getMaterialTypeName(material.material_type)}
                        </div>
                      </TableCell>
                      <TableCell>{getBusinessTypeName(material.business_type)}</TableCell>
                      <TableCell>{material.created_by}</TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {new Date(material.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={material.status === 'published' ? 'default' : 'secondary'}>
                          {material.status === 'published' ? '已发布' : '草稿'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(material.file_url, '_blank')}
                          >
                            查看
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnassociate(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 取消按钮 */}
      {onCancel && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      )}

      {/* 关联素材弹窗 */}
      <Dialog open={showAssociateDialog} onOpenChange={setShowAssociateDialog}>
        <DialogContent className="!max-w-[1200px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>关联素材</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 搜索和筛选 */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  placeholder="素材名称"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadAvailableMaterials()}
                />
              </div>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="image">图片</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="document">文档</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAvailableMaterials}>搜索</Button>
              <Button variant="outline" onClick={() => { setSearchKeyword(''); setMaterialType('all'); loadAvailableMaterials(); }}>重置</Button>
            </div>

            {/* 素材列表 */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedMaterialIds.length === availableMaterials.length && availableMaterials.length > 0}
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
                    <TableHead className="w-[100px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : availableMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMaterialIds.includes(material.id)}
                            onCheckedChange={(checked) => handleSelect(material.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-xs">{material.material_code}</TableCell>
                        <TableCell className="font-medium">{material.material_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMaterialTypeIcon(material.material_type)}
                            {getMaterialTypeName(material.material_type)}
                          </div>
                        </TableCell>
                        <TableCell>{getBusinessTypeName(material.business_type)}</TableCell>
                        <TableCell>{material.created_by}</TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {new Date(material.created_at).toLocaleString('zh-CN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={material.status === 'published' ? 'default' : 'secondary'}>
                            {material.status === 'published' ? '已发布' : '草稿'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(material.file_url, '_blank')}
                          >
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-gray-600">
              共 {availableMaterials.length} 项数据
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssociateDialog(false)}>
              返回
            </Button>
            <Button onClick={handleAssociate}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑素材对话框 */}
      <MaterialFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        material={editingMaterial}
        onSave={handleFormSave}
      />
    </div>
  );
}

export function TaskMaterialManagement({ taskId, onCancel }: TaskMaterialManagementProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <TaskMaterialManagementContent taskId={taskId} onCancel={onCancel} />
    </Suspense>
  );
}
