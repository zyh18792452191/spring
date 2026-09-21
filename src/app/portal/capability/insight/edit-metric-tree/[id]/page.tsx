'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TreeNode, TreeBasicInfo } from '@/components/MetricTreeEditor';

// 动态导入 MetricTreeEditor 组件（客户端组件）
const MetricTreeEditor = dynamic(() => import('@/components/MetricTreeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">加载编辑器...</div>
    </div>
  )
});

// 模拟指标树数据
const mockTreeData = {
  'tree-2': {
    tree: {
      id: 'root',
      name: '当月全量离网客户数',
      type: 'root' as const,
      children: [
        {
          id: 'm2-1',
          name: '当月全量离网客户数',
          code: 'TOTAL_CHURN_MONTH',
          type: 'business_metric' as const,
          children: [
            { id: 'm2-1-1', name: '集团全量离网客户数', code: 'TOTAL_CHURN_MONTH_GRP', type: 'segment_metric' as const, children: [] },
            { id: 'm2-1-2', name: '地州全量离网客户数', code: 'TOTAL_CHURN_MONTH_PROV', type: 'segment_metric' as const, children: [] },
          ]
        },
        {
          id: 'm2-2',
          name: '离网率',
          code: 'CHURN_RATE',
          type: 'business_metric' as const,
          children: []
        },
        {
          id: 'm2-3',
          name: '预警客户数',
          code: 'WARNING_COUNT',
          type: 'business_metric' as const,
          children: []
        },
        {
          id: 'm2-4',
          name: '预警客户覆盖率',
          code: 'WARNING_COVERAGE_RATE',
          type: 'business_metric' as const,
          children: []
        }
      ]
    },
    treeInfo: {
      name: '当月全量离网客户数指标树',
      region: '全国',
      granularity: '地州',
      businessScenario: '离网',
      description: '全量客户离网情况统计指标',
      isTemplate: false
    },
    groupName: '离网维系指标组'
  }
};

export default function EditMetricTreePage() {
  const router = useRouter();
  const params = useParams();
  const treeId = params.id as string;

  const treeData = mockTreeData[treeId as keyof typeof mockTreeData];

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

  // 如果找不到指标树数据
  if (!treeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到指标树数据</p>
          <Button onClick={handleBack}>返回</Button>
        </div>
      </div>
    );
  }

  // 显示指标树编辑器
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 自定义顶部按钮栏 */}
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
          <h2 className="text-lg font-semibold text-gray-900">编辑指标树</h2>
          {treeData.groupName && (
            <span className="text-sm text-gray-500">
              - {treeData.groupName}
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

      {/* MetricTreeEditor 内容区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full" style={{ marginTop: '-65px' }}>
          <MetricTreeEditor
            groupName={treeData.groupName}
            onSave={handleSave}
            onCancel={handleCancel}
            initialTree={treeData.tree}
            initialInfo={treeData.treeInfo}
          />
        </div>
      </div>
    </div>
  );
}
