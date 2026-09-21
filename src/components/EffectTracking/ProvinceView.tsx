'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Activity, ShoppingBag, TrendingUp } from 'lucide-react';
import type { ProvinceData, ProvinceIndicator } from '@/lib/types/effect-tracking';
import { getRankChangeText } from '@/lib/types/effect-tracking';

interface ProvinceViewProps {
  provinceCode: string;
  provinceName: string;
  data: ProvinceData;
  onBack?: () => void;
}

// 模拟数据生成函数
function generateProvinceData(provinceCode: string, provinceName: string): ProvinceData {
  const improvedCount = Math.floor(Math.random() * 20) + 40; // 40-60
  const totalIndicatorCount = 100;
  const activityCount = Math.floor(Math.random() * 20) + 10;
  const totalOrders = Math.floor(Math.random() * 100000) + 50000;
  const averageImprovementRate = (Math.random() * 5 + 2).toFixed(1);

  return {
    provinceCode,
    provinceName,
    improvedCount,
    totalIndicatorCount,
    activityCount,
    totalOrders,
    averageImprovementRate: parseFloat(averageImprovementRate),
    indicators: [], // 这里简化，实际应该从API获取
  };
}

export default function ProvinceView({ provinceCode, provinceName, onBack }: ProvinceViewProps) {
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set());
  const [data, setData] = useState<ProvinceData>(() => 
    generateProvinceData(provinceCode, provinceName)
  );

  // 切换指标展开/收起
  const toggleIndicator = (indicatorId: string) => {
    setExpandedIndicators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indicatorId)) {
        newSet.delete(indicatorId);
      } else {
        newSet.add(indicatorId);
      }
      return newSet;
    });
  };

  return (
    <div>
      {/* 返回按钮 */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          ← 返回地州列表
        </button>
      )}

      {/* 地州标题 */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {provinceName} - 效果跟踪详情
      </h2>

      {/* 地州概况卡片 */}
      <Card className="p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">地州概况</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{data.improvedCount}</div>
            <div className="text-sm text-gray-600">改善指标数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.activityCount}</div>
            <div className="text-sm text-gray-600">活动总数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {(data.totalOrders / 10000).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">总订购量（万单）</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {data.averageImprovementRate}%
            </div>
            <div className="text-sm text-gray-600">平均改善率</div>
          </div>
        </div>
      </Card>

      {/* 改善指标列表 */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">指标改善情况</h3>
        <div className="space-y-3">
          {data.indicators.length > 0 ? (
            data.indicators.map((indicator, index) => {
              const isExpanded = expandedIndicators.has(indicator.indicatorId);
              const changeType = indicator.change >= 0 ? 'up' : 'down';

              return (
                <Card key={indicator.indicatorId} className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleIndicator(indicator.indicatorId)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                            changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {indicator.rank}
                          </span>
                          <span className="text-sm text-gray-500">
                            {indicator.indicatorId}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{indicator.indicatorName}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {indicator.currentValue}
                        </div>
                        <div className={`text-sm flex items-center justify-end gap-1 ${
                          changeType === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {changeType === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          <span>{Math.abs(indicator.change)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Activity size={14} />
                        <span>{indicator.activityCount} 个活动</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ShoppingBag size={14} />
                        <span>{(indicator.totalOrders / 10000).toFixed(1)} 万单</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp size={14} />
                        <span>目标: {indicator.targetValue}</span>
                      </div>
                    </div>
                  </div>

                  {/* 活动详情（展开时显示） */}
                  {isExpanded && indicator.activities.length > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">活动详情</h4>
                      <div className="space-y-2">
                        {indicator.activities.map(activity => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{activity.name}</span>
                                <Badge variant={
                                  activity.status === '进行中' ? 'default' :
                                  activity.status === '已完成' ? 'secondary' : 'outline'
                                }>
                                  {activity.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">{activity.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {(activity.orderCount / 10000).toFixed(1)} 万单
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无数据
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// 修复import
import { useState } from 'react';
