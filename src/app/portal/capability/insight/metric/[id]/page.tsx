'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function MetricDetailContent() {
}

// 模拟数据 - 从洞察总览进入的指标详情数据
const mockMetrics: Record<string, any> = {
  'm001': {
    id: 'm001',
    name: '当月全量离网客户数',
    isCustomerMetric: '是',
    type: '值',
    period: '月',
    format: '数值',
    purpose: '预警',
    businessDefinition: '当月全量离网客户数',
    technicalDefinition: '统计当月所有主动离网的客户总数',
    description: '用于监控客户离网情况，及时发现并采取维系措施',
    code: 'TOTAL_CHURN_MONTH',
    businessScenario: '客户运营/离网维系',
    granularity: '地州',
    timeliness: 'T+1',
    unit: '户',
    direction: '负向指标',
    sourceSystem: '大数据平台',
    sourceTable: 'CHURN_CUSTOMER_MONTH_DWS',
    owner: '集团管理员',
    accessMethod: '数据同步',
    sourceField: 'CHURN_COUNT',
    effectiveDate: '2025-01-01',
  },
  // 默认模板，用于其他未定义的指标
  'default': {
    id: 'default',
    name: '指标详情',
    isCustomerMetric: '是',
    type: '值',
    period: '月',
    format: '数值',
    purpose: '监控',
    businessDefinition: '指标业务定义',
    technicalDefinition: '指标技术定义',
    description: '指标说明',
    code: 'METRIC_CODE',
    businessScenario: '业务场景',
    granularity: '地州',
    timeliness: 'T+1',
    unit: '个',
    direction: '正向指标',
    sourceSystem: '大数据平台',
    sourceTable: 'METRIC_TABLE',
    owner: '数据管理员',
    accessMethod: '数据同步',
    sourceField: 'METRIC_FIELD',
    effectiveDate: '2025-01-01',
  }
};

function InsightMetricDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromView = searchParams.get('from'); // 来源视图：metric 或 tree
  const currentView = searchParams.get('view'); // 当前视图：metric 或 tree
  
  const metric = mockMetrics[id] || { ...mockMetrics['default'], id, name: `指标 ${id}`, code: `CODE_${id.toUpperCase()}` };
  
  // 处理返回按钮点击
  const handleBack = () => {
    // 根据来源返回到对应的视图
    if (currentView === 'metric') {
      router.push('/portal/capability/insight/overview?view=metric');
    } else if (currentView === 'tree') {
      router.push('/portal/capability/insight/overview?view=tree');
    } else {
      // 默认返回
      window.history.back();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-full">
      {/* 顶部导航栏 */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">指标详情</h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6">
        <Card className="bg-white">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{metric.name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md">
                  {metric.code}
                </span>
                {metric.direction === '负向指标' && (
                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-md">
                    {metric.direction}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* 左侧：基本信息 */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">基本信息</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">是否客户指标</p>
                    <p className="text-sm text-gray-900">{metric.isCustomerMetric}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">指标类型</p>
                    <p className="text-sm text-gray-900">{metric.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">统计周期</p>
                    <p className="text-sm text-gray-900">{metric.period}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">数据格式</p>
                    <p className="text-sm text-gray-900">{metric.format}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">用途</p>
                    <p className="text-sm text-gray-900">{metric.purpose}</p>
                  </div>
                </div>
              </div>

              {/* 中间：业务信息 */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">业务信息</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">业务定义</p>
                    <p className="text-sm text-gray-900">{metric.businessDefinition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">业务场景</p>
                    <p className="text-sm text-gray-900">{metric.businessScenario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">统计维度</p>
                    <p className="text-sm text-gray-900">{metric.granularity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">数据时效性</p>
                    <p className="text-sm text-gray-900">{metric.timeliness}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">计量单位</p>
                    <p className="text-sm text-gray-900">{metric.unit}</p>
                  </div>
                </div>
              </div>

              {/* 右侧：技术信息 */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b">技术信息</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">技术定义</p>
                    <p className="text-sm text-gray-900">{metric.technicalDefinition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">来源系统</p>
                    <p className="text-sm text-gray-900">{metric.sourceSystem}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">来源表</p>
                    <p className="text-sm text-gray-900">{metric.sourceTable}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">来源字段</p>
                    <p className="text-sm text-gray-900">{metric.sourceField}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">数据获取方式</p>
                    <p className="text-sm text-gray-900">{metric.accessMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">数据负责人</p>
                    <p className="text-sm text-gray-900">{metric.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">生效日期</p>
                    <p className="text-sm text-gray-900">{metric.effectiveDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 描述 */}
            {metric.description && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">指标说明</h3>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function MetricDetailPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <InsightMetricDetailPage params={params} />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
