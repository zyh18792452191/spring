'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Tag {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
  is_system: boolean;
  sort_order: number;
  description: string;
}

interface TagManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TagManagementDialog({
  open,
  onOpenChange
}: TagManagementDialogProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  // 新增/编辑表单状态
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parent_id: '',
    description: ''
  });

  // 加载标签列表
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tags');
      const result = await response.json();
      if (result.success) {
        setTags(result.data);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadTags();
    }
  }, [open]);

  // 获取一级标签
  const level1Tags = tags.filter(tag => tag.level === 1).sort((a, b) => a.sort_order - b.sort_order);

  // 获取二级标签
  const level2Tags = tags.filter(tag => tag.level === 2).sort((a, b) => a.sort_order - b.sort_order);

  // 获取某个一级标签的子标签
  const getChildTags = (parentId: string) => {
    return level2Tags.filter(tag => tag.parent_id === parentId);
  };

  // 切换展开/收起
  const toggleExpand = (tagId: string) => {
    setExpandedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  // 打开新增表单
  const handleAdd = (level: number, parentId?: string) => {
    setEditingTag(null);
    setFormData({
      name: '',
      level,
      parent_id: parentId || '',
      description: ''
    });
    setShowForm(true);
  };

  // 打开编辑表单
  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      level: tag.level,
      parent_id: tag.parent_id || '',
      description: tag.description
    });
    setShowForm(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (editingTag) {
        // 更新
        response = await fetch(`/api/tags/${editingTag.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description
          })
        });
      } else {
        // 新增
        response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const result = await response.json();

      if (result.success) {
        alert(editingTag ? '修改成功' : '新增成功');
        setShowForm(false);
        loadTags();
      } else {
        alert(result.error || (editingTag ? '修改失败' : '新增失败'));
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('操作失败');
    }
  };

  // 删除标签
  const handleDelete = async (tag: Tag) => {
    if (tag.is_system) {
      alert('系统预置标签不可删除');
      return;
    }

    if (!confirm(`确定要删除标签"${tag.name}"吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert('删除成功');
        loadTags();
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 渲染标签项
  const renderTagItem = (tag: Tag, isChild: boolean = false) => {
    const children = getChildTags(tag.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedTags.has(tag.id);

    return (
      <div key={tag.id} className={`${isChild ? 'ml-8' : ''}`}>
        <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg group">
          {/* 展开/收起图标 */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(tag.id)}
              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* 标签信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{tag.name}</span>
              {tag.is_system && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                  系统预置
                </span>
              )}
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {tag.level}级
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!tag.is_system && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEdit(tag)}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(tag)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            {tag.level === 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleAdd(2, tag.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                添加二级标签
              </Button>
            )}
          </div>
        </div>

        {/* 渲染子标签 */}
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderTagItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              标签管理
            </DialogTitle>
            <DialogDescription>
              管理运营人员标签（两级结构）
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between py-4 border-b">
            <div className="text-sm text-gray-600">
              共 {tags.length} 个标签
            </div>
            <Button
              size="sm"
              onClick={() => handleAdd(1)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              新增一级标签
            </Button>
          </div>

          <div className="py-4 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                加载中...
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                暂无标签，点击上方按钮添加
              </div>
            ) : (
              <div>
                {level1Tags.map(tag => renderTagItem(tag))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑表单弹窗 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? '编辑标签' : '新增标签'}
            </DialogTitle>
            <DialogDescription>
              {editingTag ? '修改标签信息' : '创建新的标签'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                标签名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入标签名称"
                required
              />
            </div>

            {!editingTag && (
              <div>
                <Label htmlFor="level">
                  标签层级 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">一级标签</SelectItem>
                    <SelectItem value="2">二级标签</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.level === 2 && !editingTag && (
              <div>
                <Label htmlFor="parent">
                  父标签 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择父标签" />
                  </SelectTrigger>
                  <SelectContent>
                    {level1Tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入描述（可选）"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {editingTag ? '保存' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
