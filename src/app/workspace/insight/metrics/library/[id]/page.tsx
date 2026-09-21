'use client';

import React from 'react';
import { ArrowLeft, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// 模拟数据
const mockMetric = {
  // 基本信息 - 左列
  name: '活动PV（日）',
  displayName: '活动页面浏览量',
  businessScenario: '公众市场/客户运营/统一营销进度',
  granularity: '地州',
  timeliness: 'T+1',
  unit: '万',
  direction: '正向指标',
  businessDefinition: '活动页面在统计周期内的页面浏览量，统计口径为UV方式计算，同一用户在统计周期内多次访问计为1次。',
  technicalDefinition: 'SELECT COUNT(DISTINCT user_id) FROM activity_log WHERE activity_date = #{stat_date}',
  description: '用于衡量活动页面的流量情况，反映活动的曝光度和用户参与度。',

  // 基本信息 - 右列
  code: 'ACTIVITY_PV_DAY',
  isCustomerMetric: '否',
  type: '值',
  period: '日',
  format: '数值',
  purpose: '业务监控',
  dimension: '单维度',

  // 扩展属性 - 左列
  sourceSystem: '大数据平台',
  sourceTable: 'SDJHWD_DAY_DWS',
  owner: '集团管理员',

  // 扩展属性 - 右列
  accessMethod: '数据同步',
  sourceField: 'ACTIVITY_PV_DAY',
  effectiveDate: '2026-01-30',
};

// 模拟关联指标数据
const mockRelationMetrics = {
  yoyMetric: {
    id: '101',
    code: 'ACTIVITY_PV_YOY',
    name: '活动PV同比（日）',
    type: '同比',
  },
  momMetric: {
    id: '105',
    code: 'ACTIVITY_PV_MOM',
    name: '活动PV环比（日）',
    type: '环比',
  },
};

export default function MetricDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // 跳转到关联指标详情
  const handleNavigateToMetric = (metricId: string) => {
    router.push(`/workspace/insight/metrics/library/${metricId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-full">
      {/* 顶部导航栏 */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">指标详情</h1>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 基本信息 */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">基本信息</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {/* 左列 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标名称</div>
                    <div className="text-sm text-gray-900 font-medium">{mockMetric.name}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标展示名称</div>
                    <div className="text-sm text-gray-900">{mockMetric.displayName}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">业务场景</div>
                    <div className="text-sm text-gray-900">{mockMetric.businessScenario}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标最小粒度</div>
                    <div className="text-sm text-gray-900">{mockMetric.granularity}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标及时性</div>
                    <div className="text-sm text-gray-900">{mockMetric.timeliness}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标单位</div>
                    <div className="text-sm text-gray-900">{mockMetric.unit}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标方向</div>
                    <div className="text-sm text-gray-900">{mockMetric.direction}</div>
                  </div>
                </div>

                {/* 右列 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标编码</div>
                    <div className="text-sm text-gray-900 font-mono">{mockMetric.code}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">客群指标</div>
                    <div className="text-sm text-gray-900">{mockMetric.isCustomerMetric}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标类型</div>
                    <div className="text-sm text-gray-900">{mockMetric.type}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">统计周期</div>
                    <div className="text-sm text-gray-900">{mockMetric.period}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标格式</div>
                    <div className="text-sm text-gray-900">{mockMetric.format}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标用途</div>
                    <div className="text-sm text-gray-900">{mockMetric.purpose}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标维度</div>
                    <div className="text-sm text-gray-900">{mockMetric.dimension}</div>
                  </div>
                </div>
              </div>

              {/* 通栏字段 */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-[120px_1fr] items-start py-2">
                  <div className="text-sm text-gray-500 pt-0.5">指标业务口径</div>
                  <div className="text-sm text-gray-900">{mockMetric.businessDefinition}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start py-2">
                  <div className="text-sm text-gray-500 pt-0.5">指标技术口径</div>
                  <div className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{mockMetric.technicalDefinition}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start py-2">
                  <div className="text-sm text-gray-500 pt-0.5">指标业务描述</div>
                  <div className="text-sm text-gray-900">{mockMetric.description || '-'}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 关联指标 */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900">关联指标</h2>
            </div>
            <div className="p-6">
              {mockRelationMetrics.yoyMetric || mockRelationMetrics.momMetric ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 同比指标 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                        同比指标
                      </span>
                      {mockRelationMetrics.yoyMetric && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                          onClick={() => handleNavigateToMetric(mockRelationMetrics.yoyMetric.id)}
                        >
                          查看详情
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                    {mockRelationMetrics.yoyMetric ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mockRelationMetrics.yoyMetric.name}</div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">{mockRelationMetrics.yoyMetric.code}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">暂未关联</div>
                    )}
                  </div>

                  {/* 环比指标 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                        环比指标
                      </span>
                      {mockRelationMetrics.momMetric && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                          onClick={() => handleNavigateToMetric(mockRelationMetrics.momMetric.id)}
                        >
                          查看详情
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                    {mockRelationMetrics.momMetric ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mockRelationMetrics.momMetric.name}</div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">{mockRelationMetrics.momMetric.code}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">暂未关联</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">暂无关联指标</div>
                </div>
              )}
            </div>
          </Card>

          {/* 扩展属性 */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">扩展属性</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {/* 左列 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标来源系统</div>
                    <div className="text-sm text-gray-900">{mockMetric.sourceSystem}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标数据源表</div>
                    <div className="text-sm text-gray-900 font-mono">{mockMetric.sourceTable}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标责任人</div>
                    <div className="text-sm text-gray-900">{mockMetric.owner}</div>
                  </div>
                </div>

                {/* 右列 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标接入方式</div>
                    <div className="text-sm text-gray-900">{mockMetric.accessMethod}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标数据源字段</div>
                    <div className="text-sm text-gray-900 font-mono">{mockMetric.sourceField}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center py-2">
                    <div className="text-sm text-gray-500">指标生效日期</div>
                    <div className="text-sm text-gray-900">{mockMetric.effectiveDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
