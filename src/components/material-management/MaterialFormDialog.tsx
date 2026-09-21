'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Material {
  id?: number;
  material_code?: string;
  material_name?: string;
  material_type?: string;
  business_type?: string;
  visibility?: string;
  file_key?: string;
  file_url?: string;
  file_size?: number;
  file_mime_type?: string;
  cover_key?: string;
  cover_url?: string;
  copyright_info?: string;
  copyright_statement?: string;
  copyright_proof_key?: string;
  copyright_proof_url?: string;
  description?: string;
}

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  onSave: () => void;
}

// 素材类型
const materialTypes = [
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
  { id: 'document', name: '文档' },
];

// 业务类型
const businessTypes = [
  { id: 'product_intro', name: '产品介绍' },
  { id: 'marketing', name: '营销推广' },
  { id: 'training', name: '培训教程' },
  { id: 'news', name: '新闻资讯' },
];

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  onSave,
}: MaterialFormDialogProps) {
  const [loading, setLoading] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    materialName: '',
    materialType: '',
    businessType: '',
    visibility: 'national',
    coverKey: '',
    coverUrl: '',
    copyrightInfo: 'owned',
    copyrightStatement: '',
    copyrightProofKey: '',
    copyrightProofUrl: '',
    description: '',
  });

  // 文件上传状态
  const [fileUploading, setFileUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [proofUploading, setProofUploading] = useState(false);

  // 编辑模式：填充表单
  useEffect(() => {
    if (material && material.id) {
      setFormData({
        materialName: material.material_name || '',
        materialType: material.material_type || '',
        businessType: material.business_type || '',
        visibility: material.visibility || 'national',
        coverKey: material.cover_key || '',
        coverUrl: material.cover_url || '',
        copyrightInfo: material.copyright_info || 'owned',
        copyrightStatement: material.copyright_statement || '',
        copyrightProofKey: material.copyright_proof_key || '',
        copyrightProofUrl: material.copyright_proof_url || '',
        description: material.description || '',
      });
    } else {
      // 新增模式：重置表单
      setFormData({
        materialName: '',
        materialType: '',
        businessType: '',
        visibility: 'national',
        coverKey: '',
        coverUrl: '',
        copyrightInfo: 'owned',
        copyrightStatement: '',
        copyrightProofKey: '',
        copyrightProofUrl: '',
        description: '',
      });
    }
  }, [material, open]);

  // 上传文件
  const uploadFile = async (file: File, fileType: 'material' | 'cover' | 'copyright_proof') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const response = await fetch('/api/materials/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || '上传失败');
    }

    return result.data;
  };

  // 处理素材文件上传（新增模式）
  const handleMaterialFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    try {
      const data = await uploadFile(file, 'material');

      // 根据文件类型自动设置素材类型
      let autoType = '';
      if (file.type.startsWith('image/')) {
        autoType = 'image';
      } else if (file.type.startsWith('video/')) {
        autoType = 'video';
      } else if (file.type.includes('pdf') || file.type.includes('word')) {
        autoType = 'document';
      }

      setFormData({
        ...formData,
        materialType: autoType || formData.materialType,
        // 保存文件信息到临时状态
        _tempFileKey: data.fileKey,
        _tempFileUrl: data.fileUrl,
        _tempFileSize: data.fileSize,
        _tempFileMimeType: data.fileMimeType,
      } as any);

      toast.success('文件上传成功');
    } catch (error: any) {
      console.error('上传失败:', error);
      toast.error(error.message || '上传失败');
    } finally {
      setFileUploading(false);
    }
  };

  // 处理封面上传
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    try {
      const data = await uploadFile(file, 'cover');
      setFormData({
        ...formData,
        coverKey: data.fileKey,
        coverUrl: data.fileUrl,
      });
      toast.success('封面上传成功');
    } catch (error: any) {
      console.error('上传失败:', error);
      toast.error(error.message || '上传失败');
    } finally {
      setCoverUploading(false);
    }
  };

  // 处理版权证明上传
  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofUploading(true);
    try {
      const data = await uploadFile(file, 'copyright_proof');
      setFormData({
        ...formData,
        copyrightProofKey: data.fileKey,
        copyrightProofUrl: data.fileUrl,
      });
      toast.success('版权证明上传成功');
    } catch (error: any) {
      console.error('上传失败:', error);
      toast.error(error.message || '上传失败');
    } finally {
      setProofUploading(false);
    }
  };

  // 删除封面
  const handleRemoveCover = () => {
    setFormData({
      ...formData,
      coverKey: '',
      coverUrl: '',
    });
  };

  // 删除版权证明
  const handleRemoveProof = () => {
    setFormData({
      ...formData,
      copyrightProofKey: '',
      copyrightProofUrl: '',
    });
  };

  // 验证表单
  const validateForm = () => {
    if (!formData.materialName.trim()) {
      toast.error('请输入素材名称');
      return false;
    }
    if (!formData.materialType) {
      toast.error('请选择素材类型');
      return false;
    }
    if (!formData.businessType) {
      toast.error('请选择业务类型');
      return false;
    }
    if (!formData.visibility) {
      toast.error('请选择可见权限');
      return false;
    }
    if (!formData.copyrightInfo) {
      toast.error('请选择版权信息');
      return false;
    }
    if (!formData.copyrightStatement.trim()) {
      toast.error('请输入版权声明');
      return false;
    }

    // 新增模式需要上传素材文件
    if (!material?.id && !(formData as any)._tempFileKey) {
      toast.error('请上传素材文件');
      return false;
    }

    return true;
  };

  // 保存
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = {
        materialName: formData.materialName,
        materialType: formData.materialType,
        businessType: formData.businessType,
        visibility: formData.visibility,
        fileKey: material?.id ? material.file_key : (formData as any)._tempFileKey,
        fileUrl: material?.id ? material.file_url : (formData as any)._tempFileUrl,
        fileSize: material?.id ? material.file_size : (formData as any)._tempFileSize,
        fileMimeType: material?.id ? material.file_mime_type : (formData as any)._tempFileMimeType,
        coverKey: formData.coverKey,
        coverUrl: formData.coverUrl,
        copyrightInfo: formData.copyrightInfo,
        copyrightStatement: formData.copyrightStatement,
        copyrightProofKey: formData.copyrightProofKey,
        copyrightProofUrl: formData.copyrightProofUrl,
        description: formData.description,
        createdBy: '集团市场运营人员',
      };

      const url = material?.id
        ? `/api/materials/${material.id}`
        : '/api/materials';
      const method = material?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(material?.id ? '更新成功' : '新增成功');
        onSave();
      } else {
        toast.error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material?.id ? '编辑素材' : '新增素材'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基础信息 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                素材名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="请输入"
                value={formData.materialName}
                onChange={(e) =>
                  setFormData({ ...formData, materialName: e.target.value })
                }
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.materialName.length}/100
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                素材类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.materialType}
                onValueChange={(value) =>
                  setFormData({ ...formData, materialType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                业务类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) =>
                  setFormData({ ...formData, businessType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                可见权限 <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(value) =>
                  setFormData({ ...formData, visibility: value })
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="national" id="national" />
                    <Label htmlFor="national" className="cursor-pointer">
                      全国
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="province" id="province" />
                    <Label htmlFor="province" className="cursor-pointer">
                      地州
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* 素材文件上传（新增模式） */}
          {!material?.id && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                素材文件 <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="materialFile"
                  className="hidden"
                  onChange={handleMaterialFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="materialFile"
                  className="cursor-pointer inline-block"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      点击或拖拽文件到此处上传
                    </div>
                    <div className="text-xs text-gray-400">
                      支持 jpg.png.gif.jpeg.ico、pdf、doc、docx 等格式
                    </div>
                  </div>
                </label>
                {(formData as any)._tempFileUrl && (
                  <div className="mt-4 text-sm text-green-600">
                    已上传: {(formData as any)._tempFileMimeType} ({formatFileSize((formData as any)._tempFileSize)})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 封面上传 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">素材封面</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {!formData.coverUrl ? (
                <input
                  type="file"
                  id="coverFile"
                  className="hidden"
                  onChange={handleCoverUpload}
                  accept="image/*"
                />
              ) : null}

              {!formData.coverUrl ? (
                <label
                  htmlFor="coverFile"
                  className="cursor-pointer inline-block w-full"
                >
                  <div className="flex flex-col items-center justify-center h-32">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <div className="text-sm text-gray-600">
                      {coverUploading ? '上传中...' : '点击上传封面'}
                    </div>
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={formData.coverUrl}
                    alt="封面"
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                若未单独设置封面，系统将自动截取视频第1帧作为缩略图展示
              </div>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                版权信息 <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.copyrightInfo}
                onValueChange={(value) =>
                  setFormData({ ...formData, copyrightInfo: value })
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owned" id="owned" />
                    <Label htmlFor="owned" className="cursor-pointer">
                      拥有版权
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_copyright" id="no_copyright" />
                    <Label htmlFor="no_copyright" className="cursor-pointer">
                      暂不具备版权
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                版权声明 <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="请输入"
                value={formData.copyrightStatement}
                onChange={(e) =>
                  setFormData({ ...formData, copyrightStatement: e.target.value })
                }
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.copyrightStatement.length}/100
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                版权证明 <span className="text-red-500">*</span>
              </Label>
              {!formData.copyrightProofUrl ? (
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="proofFile"
                    className="hidden"
                    onChange={handleProofUpload}
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="proofFile">
                    <Button type="button" variant="outline" disabled={proofUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {proofUploading ? '上传中...' : '上传版权证明'}
                    </Button>
                  </label>
                  <div className="text-xs text-gray-500">
                    支持 jpg.png.gif.jpeg.ico、pdf，单文件不超过10MB
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button variant="outline" asChild>
                    <a
                      href={formData.copyrightProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      查看证明
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveProof}
                  >
                    <X className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 素材介绍 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">素材介绍</Label>
            <Textarea
              placeholder="请输入"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={1500}
              rows={4}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.description.length}/1500
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
