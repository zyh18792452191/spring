"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface TagItem {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
  is_system: boolean;
  sort_order: number;
  description: string;
  business_scenarios: string[];
  children?: TagItem[];
  isPreset?: boolean; // 兼容旧版本
}

interface TagManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 业务场景列表
const BUSINESS_SCENARIOS = [
  '中高端客户运营',
  '离网维系',
  '国际业务运营',
  '家庭运营',
  '用量运营',
  '融合运营',
  '细分市场运营',
] as const;

export default function TagManager({ open, onOpenChange }: TagManagerProps) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [businessScenarios, setBusinessScenarios] = useState<string[]>([...BUSINESS_SCENARIOS]);
  const [loading, setLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<{ tag: TagItem; parentTag?: TagItem } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBusinessScenarios, setEditBusinessScenarios] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addValue, setAddValue] = useState('');
  const [addParentId, setAddParentId] = useState<string>('');
  const [addBusinessScenarios, setAddBusinessScenarios] = useState<string[]>([]); // 新增标签的业务场景
  const [deleteTag, setDeleteTag] = useState<{ tag: TagItem; parentTag?: TagItem } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // 父级业务场景冲突提示
  const [showParentScenarioWarning, setShowParentScenarioWarning] = useState(false);
  const [parentTagInfo, setParentTagInfo] = useState<TagItem | null>(null);

  // 加载标签数据
  useEffect(() => {
    if (open) {
      loadTags();
    }
  }, [open]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tags');
      const result = await response.json();

      if (result.success) {
        // 转换数据，添加 isPreset 字段以保持兼容
        const formattedTags = result.data.map((tag: any) => ({
          ...tag,
          isPreset: tag.is_system,
          children: tag.children || [],
        }));
        setTags(formattedTags);
        setBusinessScenarios([...(result.businessScenarios || BUSINESS_SCENARIOS)]);
      } else {
        console.error('加载标签失败:', result.error);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑标签
  const handleStartEdit = (tag: TagItem, parentTag?: TagItem) => {
    setEditingTag({ tag, parentTag });
    setEditValue(tag.name);
    setEditDescription(tag.description || '');
    setEditBusinessScenarios(tag.business_scenarios || []);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingTag) return;
    if (!editValue.trim()) {
      alert('标签名称不能为空');
      return;
    }

    // 末级标签业务场景必填验证
    if (isLeafNode(editingTag!.tag) && editBusinessScenarios.length === 0) {
      alert('请至少选择一个业务场景');
      return;
    }

    const { tag } = editingTag;
    setSaveLoading(true);

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editValue.trim(),
          description: editDescription.trim(),
          businessScenarios: editBusinessScenarios,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 重新加载标签数据
        await loadTags();
        setEditingTag(null);
        setEditValue('');
        setEditDescription('');
        setEditBusinessScenarios([]);
      } else {
        alert(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaveLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
    setEditDescription('');
    setEditBusinessScenarios([]);
  };

  // 开始添加标签
  const handleStartAdd = (parentId?: string) => {
    setAddParentId(parentId || '');
    setAddValue('');
    setAddBusinessScenarios([]); // 重置业务场景选择
    setShowAddDialog(true);
  };

  // 查找标签 by id
  const findTagById = (tags: TagItem[], id: string): TagItem | null => {
    for (const tag of tags) {
      if (tag.id === id) return tag;
      if (tag.children) {
        const found = findTagById(tag.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 切换新增标签的业务场景选中状态
  const toggleAddBusinessScenario = (scenario: string) => {
    if (addBusinessScenarios.includes(scenario)) {
      setAddBusinessScenarios(addBusinessScenarios.filter(s => s !== scenario));
    } else {
      setAddBusinessScenarios([...addBusinessScenarios, scenario]);
    }
  };

  // 清除父级标签的业务场景关联
  const clearParentBusinessScenarios = async (parentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/${parentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessScenarios: [],
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('清除父级业务场景失败:', error);
      return false;
    }
  };

  // 添加标签
  const handleAdd = async () => {
    if (!addValue.trim()) {
      alert('标签名称不能为空');
      return;
    }

    // 业务场景必填验证
    if (addBusinessScenarios.length === 0) {
      alert('请至少选择一个业务场景');
      return;
    }

    // 检查父级标签是否有业务场景关联
    if (addParentId) {
      const parentTag = findTagById(tags, addParentId);
      if (parentTag && parentTag.business_scenarios && parentTag.business_scenarios.length > 0) {
        // 显示警告提示
        setParentTagInfo(parentTag);
        setShowParentScenarioWarning(true);
        return;
      }
    }

    // 执行添加
    await executeAddTag();
  };

  // 确认添加子标签（清除父级业务场景后）
  const handleConfirmAddWithParentClear = async () => {
    if (!parentTagInfo) return;
    
    // 清除父级业务场景
    const cleared = await clearParentBusinessScenarios(parentTagInfo.id);
    if (!cleared) {
      alert('清除父级业务场景失败，请重试');
      return;
    }
    
    setShowParentScenarioWarning(false);
    setParentTagInfo(null);
    
    // 执行添加
    await executeAddTag();
  };

  // 执行添加标签
  const executeAddTag = async () => {
    setSaveLoading(true);

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addValue.trim(),
          parentId: addParentId || null,
          isSystem: false,
          sortOrder: 999,
          description: '',
          businessScenarios: addBusinessScenarios,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 重新加载标签数据
        await loadTags();
        setShowAddDialog(false);
        setAddValue('');
        setAddParentId('');
        setAddBusinessScenarios([]);
      } else {
        alert(result.error || '添加失败');
      }
    } catch (error) {
      console.error('添加失败:', error);
      alert('添加失败');
    } finally {
      setSaveLoading(false);
    }
  };

  // 删除标签
  const handleDelete = async () => {
    if (!deleteTag) return;

    const { tag } = deleteTag;
    setSaveLoading(true);

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // 重新加载标签数据
        await loadTags();
        setDeleteTag(null);
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    } finally {
      setSaveLoading(false);
    }
  };

  // 判断是否为末级标签
  const isLeafNode = (tag: TagItem): boolean => {
    return !tag.children || tag.children.length === 0;
  };

  // 切换业务场景选中状态
  const toggleBusinessScenario = (scenario: string) => {
    if (editBusinessScenarios.includes(scenario)) {
      setEditBusinessScenarios(editBusinessScenarios.filter(s => s !== scenario));
    } else {
      setEditBusinessScenarios([...editBusinessScenarios, scenario]);
    }
  };

  // 渲染标签项
  const renderTagItem = (tag: TagItem, parentTag?: TagItem) => {
    const isEditing = editingTag?.tag.id === tag.id;
    const depth = parentTag ? 1 : 0;

    return (
      <div key={tag.id} className={`${depth > 0 ? 'ml-6' : ''}`}>
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg ${tag.is_system ? 'bg-blue-50' : ''}`}
        >
          {/* 展开/收起图标 */}
          {tag.children && tag.children.length > 0 && !isEditing && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {(!tag.children || tag.children.length === 0) && !isEditing && <div className="w-4" />}

          {/* 编辑模式 */}
          {isEditing ? (
            <div className="flex-1 space-y-3">
              <div>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8"
                  placeholder="标签名称"
                  disabled={editingTag?.tag.is_system}
                  autoFocus={!editingTag?.tag.is_system}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                {editingTag?.tag.is_system && (
                  <p className="text-xs text-gray-500 mt-1">预置标签名称不可修改</p>
                )}
              </div>
              <div>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="h-8"
                  placeholder="标签描述（可选）"
                  disabled={editingTag?.tag.is_system}
                />
                {editingTag?.tag.is_system && (
                  <p className="text-xs text-gray-500 mt-1">预置标签描述不可修改</p>
                )}
              </div>

              {/* 业务场景选择 - 仅末级标签显示 */}
              {isLeafNode(tag) && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    关联业务场景 <span className="text-red-500">*</span>
                    {editingTag?.tag.is_system && <span className="ml-2 text-xs text-blue-600">预置标签也可关联</span>}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {businessScenarios.map(scenario => (
                      <div
                        key={scenario}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                          editBusinessScenarios.includes(scenario)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleBusinessScenario(scenario)}
                      >
                        <Checkbox
                          checked={editBusinessScenarios.includes(scenario)}
                          onChange={() => toggleBusinessScenario(scenario)}
                          className="pointer-events-none"
                        />
                        <span className="text-sm">{scenario}</span>
                      </div>
                    ))}
                  </div>
                  {editBusinessScenarios.length > 0 && (
                    <p className="text-xs text-gray-500">
                      已选择: {editBusinessScenarios.join('、')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saveLoading}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 标签名称 */}
              <div className="flex-1">
                <span className={`text-sm ${tag.is_system ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {tag.name}
                  {tag.is_system && <span className="ml-2 text-xs text-gray-500">(预置)</span>}
                </span>

                {/* 显示关联的业务场景 */}
                {tag.business_scenarios && tag.business_scenarios.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">关联: </span>
                    <span className="text-xs text-blue-600">
                      {tag.business_scenarios.join('、')}
                    </span>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-1">
                {/* 末级标签（包括预置标签）都可以编辑业务场景 */}
                {isLeafNode(tag) && (
                  <Button size="sm" variant="ghost" onClick={() => handleStartEdit(tag, parentTag)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {/* 非预置标签可以删除 */}
                {!tag.is_system && (
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTag({ tag, parentTag })}>
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleStartAdd(tag.id)}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* 渲染子标签 */}
        {tag.children && tag.children.length > 0 && (
          <div className="mt-1">
            {tag.children.map(child => renderTagItem(child, tag))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>标签管理</DialogTitle>
            <DialogDescription>
              管理人员标签，预置标签不可修改删除。末级标签可以关联业务场景。
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* 添加一级标签按钮 */}
              <div className="flex justify-end">
                <Button size="sm" onClick={() => handleStartAdd()}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加一级标签
                </Button>
              </div>

              {/* 标签列表 */}
              <div className="border rounded-lg p-4 space-y-1">
                {tags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无标签
                  </div>
                ) : (
                  tags.map(tag => renderTagItem(tag))
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加标签弹窗 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>标签名称 <span className="text-red-500">*</span></Label>
              <Input
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                placeholder="请输入标签名称"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
            </div>
            
            {/* 业务场景选择 - 必填 */}
            <div className="space-y-2">
              <Label>关联业务场景 <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {businessScenarios.map(scenario => (
                  <div
                    key={scenario}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                      addBusinessScenarios.includes(scenario)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleAddBusinessScenario(scenario)}
                  >
                    <Checkbox
                      checked={addBusinessScenarios.includes(scenario)}
                      onChange={() => toggleAddBusinessScenario(scenario)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">{scenario}</span>
                  </div>
                ))}
              </div>
              {addBusinessScenarios.length > 0 && (
                <p className="text-xs text-gray-500">
                  已选择: {addBusinessScenarios.join('、')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setAddValue('');
              setAddParentId('');
              setAddBusinessScenarios([]);
            }}>
              取消
            </Button>
            <Button onClick={handleAdd} disabled={saveLoading}>
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 父级业务场景冲突提示弹窗 */}
      <AlertDialog open={showParentScenarioWarning} onOpenChange={setShowParentScenarioWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>提示</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>父级标签【{parentTagInfo?.name}】已关联业务场景【{parentTagInfo?.business_scenarios?.join('、')}】，添加子标签后该关联将被清除。</p>
              <p className="font-medium">请为子标签选择业务场景后继续。</p>
              <p className="text-blue-600">您已选择: {addBusinessScenarios.join('、')}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowParentScenarioWarning(false);
              setParentTagInfo(null);
            }}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAddWithParentClear} disabled={saveLoading}>
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              继续添加
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!deleteTag} onOpenChange={() => setDeleteTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除标签"{deleteTag?.tag.name}"吗？
              {deleteTag?.tag.children && deleteTag?.tag.children.length > 0 && '此操作将同时删除该标签下的所有子标签。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saveLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saveLoading}>
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
