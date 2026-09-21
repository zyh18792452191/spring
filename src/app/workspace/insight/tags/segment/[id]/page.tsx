'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 模拟客群详情数据
const getSegmentById = (id: string) => {
  const mockData: Record<string, {
    code: string;
    name: string;
    businessScenario: string;
    businessDefinition: string;
    technicalDefinition: string;
    effectiveDate: string;
    expiryDate: string;
    status: '生效' | '失效';
    relatedTags: string[];
    relatedIndicators: string[];
    createTime: string;
    updateTime: string;
    creator: string;
  }> = {
    '1': {
      code: 'test-0311-01',
      name: '客群测试',
      businessScenario: '公众市场 / 客户运营 / 离网维系',
      businessDefinition: '用于测试客群功能的测试数据',
      technicalDefinition: 'test_segment_flag = 1',
      effectiveDate: '2026-03-03',
      expiryDate: '2026-03-31',
      status: '生效',
      relatedTags: ['夜间高流量用户', '饱和度分档'],
      relatedIndicators: ['test-0303客户群指标'],
      createTime: '2026-03-03 10:00:00',
      updateTime: '2026-03-03 15:30:00',
      creator: '张三',
    },
    '2': {
      code: 'SEG_CHURN_011',
      name: '低饱和客户',
      businessScenario: '公众市场 / 客户运营 / 离网维系',
      businessDefinition: '流量使用饱和度低于30%的客户群体',
      technicalDefinition: 'saturation_rate < 0.3',
      effectiveDate: '2025-01-15',
      expiryDate: '2099-01-14',
      status: '生效',
      relatedTags: ['饱和度分档'],
      relatedIndicators: ['离网率', '保有率'],
      createTime: '2025-01-15 09:00:00',
      updateTime: '2025-01-15 09:00:00',
      creator: '李四',
    },
  };
  return mockData[id] || null;
};

export default function SegmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    code: string;
    name: string;
    businessScenario: string;
    businessDefinition: string;
    technicalDefinition: string;
    effectiveDate: string;
    expiryDate: string;
    status: '生效' | '失效';
    relatedTags: string[];
    relatedIndicators: string[];
    createTime: string;
    updateTime: string;
    creator: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setData(getSegmentById(id));
      setLoading(false);
    }, 300);
  }, [id]);

  const handleBack = () => {
    router.push('/workspace/insight/tags/segment');
  };

  const handleEdit = () => {
    router.push(`/workspace/insight/tags/segment/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-20">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-20">客群不存在或已删除</div>
        <div className="text-center">
          <Button variant="outline" onClick={handleBack}>返回列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">客群详情</h1>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={handleEdit}>
          <Edit2 className="w-4 h-4 mr-1" />
          编辑
        </Button>
      </div>

      {/* 基本信息卡片 */}
      <Card className="p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">客群编码</label>
            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{data.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">客群名称</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">业务场景</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.businessScenario}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">生效日期</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.effectiveDate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">失效日期</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.expiryDate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">状态</label>
            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded mt-1 ${
              data.status === '生效'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {data.status}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-500">创建人</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.creator}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">创建时间</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.createTime}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">更新时间</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{data.updateTime}</p>
          </div>
        </div>
      </Card>

      {/* 口径定义卡片 */}
      <Card className="p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">口径定义</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">业务口径</label>
            <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{data.businessDefinition}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">技术口径</label>
            <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg font-mono">{data.technicalDefinition}</p>
          </div>
        </div>
      </Card>

      {/* 关联信息卡片 */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">关联信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">关联标签</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.relatedTags.length > 0 ? (
                data.relatedTags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 text-sm rounded bg-blue-50 text-blue-600">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">暂无关联标签</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">关联指标</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.relatedIndicators.length > 0 ? (
                data.relatedIndicators.map((indicator, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 text-sm rounded bg-green-50 text-green-600">
                    {indicator}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">暂无关联指标</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
