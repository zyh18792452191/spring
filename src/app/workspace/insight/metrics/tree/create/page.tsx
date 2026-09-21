'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// 动态导入 MetricTreeEditor 组件（客户端组件）
const MetricTreeEditor = dynamic(() => import('@/components/MetricTreeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">加载编辑器...</div>
    </div>
  )
});

// 业务场景
const businessScenarios = ['客户保有', '价值提升', '风险监控', '流量运营', '融合营销', '终端运营'];

// 归属区域

// 分析粒度
const granularities = ['地州', '地市', '区县', '网格'];

export default function CreateMetricTreePage() {
  const router = useRouter();

  const handleSave = () => {
    // TODO: 实现保存逻辑
    alert('保存成功');
    router.push('/workspace/insight/metrics/tree');
  };

  const handleCancel = () => {
    router.push('/workspace/insight/metrics/tree');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MetricTreeEditor
        groupName=""
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
