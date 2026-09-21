'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TreeNode, TreeBasicInfo } from '@/components/MetricTreeEditor';

// 动态导入 MetricTreeEditor 核心部分（不使用其头部）
const MetricTreeEditor = dynamic(() => import('@/components/MetricTreeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">加载编辑器...</div>
    </div>
  )
});

// 指标组数据
const metricGroups = [
  { id: 'group-1', name: '中高端客户运营指标组', description: '包含中高端客户的消费、使用行为等核心运营指标' },
  { id: 'group-2', name: '离网维系指标组', description: '包含客户离网预警、维系效果评估等指标' },
  { id: 'group-3', name: '用量运营指标组', description: '包含流量使用、语音使用等用量相关指标' },
  { id: 'group-4', name: '融合运营指标组', description: '包含融合套餐办理、融合渗透等指标' },
];

function CreateMetricTreeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // 从URL参数获取指标组ID
  const groupIdFromUrl = searchParams.get('groupId');

  useEffect(() => {
    // 如果没有传递指标组ID，显示指标组选择弹窗
    if (!groupIdFromUrl) {
      setShowGroupDialog(true);
    } else if (groupIdFromUrl) {
      setSelectedGroupId(groupIdFromUrl);
    }
  }, [groupIdFromUrl]);

  const handleGroupSelect = () => {
    setShowGroupDialog(false);
  };

  const handleBack = () => {
    // 返回洞察总览页面
    router.push('/portal/capability/insight/overview');
  };

  const handleSave = () => {
    // TODO: 实现保存逻辑
    alert('保存成功');
    handleBack();
  };

  const handleCancel = () => {
    handleBack();
  };

  const handleSaveDraft = () => {
    alert('保存草稿功能开发中');
  };

  const handlePreview = () => {
    alert('预览功能开发中');
  };

  // 如果还在选择指标组，只显示弹窗
  if (showGroupDialog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>选择指标组</DialogTitle>
              <DialogDescription>
                选择要创建的指标树所属的指标组
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <RadioGroup value={selectedGroupId} onValueChange={setSelectedGroupId}>
                {metricGroups.map(group => (
                  <div key={group.id} className="flex items-start space-x-3 py-2">
                    <RadioGroupItem value={group.id} id={group.id} className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor={group.id} className="font-medium cursor-pointer">
                        {group.name}
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleBack}
              >
                返回
              </Button>
              <Button
                onClick={handleGroupSelect}
                disabled={!selectedGroupId}
              >
                确定
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // 显示指标树编辑器（自定义头部）
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 自定义顶部按钮栏 - 统一的一层按钮 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">创建指标树</h2>
          {selectedGroupId && (
            <span className="text-sm text-gray-500">
              - {metricGroups.find(g => g.id === selectedGroupId)?.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
          >
            保存草稿
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-1" />
            预览
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-1" />
            发布
          </Button>
        </div>
      </div>

      {/* MetricTreeEditor 内容区域 - 隐藏其自带的头部 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full" style={{ marginTop: '-65px' }}>
          <MetricTreeEditor
            groupName={metricGroups.find(g => g.id === selectedGroupId)?.name || ''}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

// 导出包装组件，使用 Suspense 包裹
export default function CreateMetricTreePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    }>
      <CreateMetricTreeContent />
    </Suspense>
  );
}
