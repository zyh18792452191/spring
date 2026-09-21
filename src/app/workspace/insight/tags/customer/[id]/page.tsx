'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 模拟数据
const mockTagData = {
  id: 1,
  tagType: '固定标签',
  tagCode: 'u_three',
  tagName: '近三月降档情况',
  tagGroup: '通信行为',
  businessDefinition: '近三月降档情况',
  technicalDefinition: '近三月降档情况',
  valueType: '枚举',
  tagValues: [
    { value: '3', meaning: 'T-3月降档' },
    { value: '2', meaning: 'T-2月降档' },
    { value: '1', meaning: 'T-1月降档' },
  ],
  statDataValue: {
    type: '数值',
    format: '数值',
    sourceSystem: '大数据平台',
    sourceTable: 'user_behavior_table',
    granularity: '地州',
    unit: '万',
    accessMethod: '离线接入',
    sourceField: 'downgrade_flag',
  },
  statDataRatio: {
    type: '占比',
    format: '百分比',
    sourceSystem: '大数据平台',
    sourceTable: 'user_behavior_table',
    granularity: '地州',
    unit: '%',
    accessMethod: '离线接入',
    sourceField: 'downgrade_ratio',
  },
  featureDataValue: {
    type: '数值',
    format: '数值',
    sourceSystem: '大数据平台',
    sourceTable: 'user_feature_table',
    granularity: '地州',
    unit: '万',
    accessMethod: '离线接入',
    sourceField: 'feature_value',
  },
  featureDataRatio: {
    type: '占比',
    format: '百分比',
    sourceSystem: '大数据平台',
    sourceTable: 'user_feature_table',
    granularity: '地州',
    unit: '%',
    accessMethod: '离线接入',
    sourceField: 'feature_ratio',
  },
};

export default function CustomerTagDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.id as string;

  const [tagData, setTagData] = useState<typeof mockTagData | null>(null);

  useEffect(() => {
    // TODO: 从API加载数据
    setTagData(mockTagData);
  }, [tagId]);

  if (!tagData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">加载中...</div>
      </div>
    );
  }

  // 渲染数据来源配置卡片
  const renderDataSourceConfig = (title: string, config: typeof mockTagData.statDataValue) => (
    <Card className="p-4 flex-1">
      <div className="text-sm font-medium text-gray-700 mb-4">{title}</div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">类型</div>
            <div className="text-sm text-gray-900">{config.type}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">格式</div>
            <div className="text-sm text-gray-900">{config.format}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">数据来源系统</div>
          <div className="text-sm text-gray-900">{config.sourceSystem}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">数据源表</div>
          <div className="text-sm text-gray-900 font-mono">{config.sourceTable}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">最小粒度</div>
            <div className="text-sm text-gray-900">{config.granularity}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">单位</div>
            <div className="text-sm text-gray-900">{config.unit}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">数据接入方式</div>
          <div className="text-sm text-gray-900">{config.accessMethod}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">数据源字段</div>
          <div className="text-sm text-gray-900 font-mono">{config.sourceField}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* 顶部导航栏 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">标签详情</h1>
        </div>

        {/* 基本信息 */}
        <Card className="mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">基本信息</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {/* 左栏 */}
              <div className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] items-center py-2">
                  <div className="text-sm text-gray-500">标签类型</div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                      tagData.tagType === '固定标签' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tagData.tagType}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center py-2">
                  <div className="text-sm text-gray-500">标签编码</div>
                  <div className="text-sm text-gray-900 font-mono">{tagData.tagCode}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center py-2">
                  <div className="text-sm text-gray-500">标签分组</div>
                  <div className="text-sm text-gray-900">{tagData.tagGroup}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-start py-2">
                  <div className="text-sm text-gray-500 pt-0.5">技术口径</div>
                  <div className="text-sm text-gray-900">{tagData.technicalDefinition}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center py-2">
                  <div className="text-sm text-gray-500">标签取值类型</div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                      tagData.valueType === '枚举' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {tagData.valueType}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右栏 */}
              <div className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] items-center py-2">
                  <div className="text-sm text-gray-500">标签名称</div>
                  <div className="text-sm text-gray-900 font-medium">{tagData.tagName}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-start py-2">
                  <div className="text-sm text-gray-500 pt-0.5">业务口径</div>
                  <div className="text-sm text-gray-900">{tagData.businessDefinition}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-start py-2">
                  <div className="text-sm text-gray-500 pt-0.5">标签取值</div>
                  <div className="space-y-1">
                    {tagData.tagValues.map((tv, index) => (
                      <div key={index} className="text-sm text-gray-900">
                        <span className="font-mono">{tv.value}</span>
                        <span className="text-gray-400 mx-1">:</span>
                        <span>{tv.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 标签统计数据取值来源 - 仅固定标签显示 */}
        {tagData.tagType === '固定标签' && (
          <Card className="mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">标签统计数据取值来源</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderDataSourceConfig('数值', tagData.statDataValue)}
                {renderDataSourceConfig('占比', tagData.statDataRatio)}
              </div>
            </div>
          </Card>
        )}

        {/* 标签特征统计数据取值来源 - 仅固定标签显示 */}
        {tagData.tagType === '固定标签' && (
          <Card className="mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">标签特征统计数据取值来源</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderDataSourceConfig('数值', tagData.featureDataValue)}
                {renderDataSourceConfig('占比', tagData.featureDataRatio)}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
