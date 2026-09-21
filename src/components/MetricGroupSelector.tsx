'use client';

import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';

// 导出接口定义，供其他组件使用
export interface MetricGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface MetricGroupSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (group: MetricGroup) => void;
  selectedGroupId?: string;
}

// 模拟指标组数据
const mockMetricGroups: MetricGroup[] = [
  { id: '1', name: '离网指标组', code: 'CHURN_METRIC', description: '用于分析客户离网情况的指标组' },
  { id: '2', name: '中高端指标组', code: 'HIGH_END_METRIC', description: '中高端客户相关指标' },
  { id: '3', name: '全球通指标组', code: 'GLOBAL_METRIC', description: '全球通业务指标' },
  { id: '4', name: '国际业务指标组', code: 'INTL_METRIC', description: '国际业务相关指标' },
  { id: '5', name: '家庭业务指标组', code: 'FAMILY_METRIC', description: '家庭套餐和业务指标' },
  { id: '6', name: '融合运营指标组', code: 'FUSION_METRIC', description: '融合业务运营指标' },
  { id: '7', name: '用量运营指标组', code: 'USAGE_METRIC', description: '业务用量相关指标' },
  { id: '8', name: '细分市场指标组', code: 'SEGMENT_METRIC', description: '细分市场分析指标' },
];

export default function MetricGroupSelector({
  isOpen,
  onClose,
  onSelect,
  selectedGroupId
}: MetricGroupSelectorProps) {
  const [searchText, setSearchText] = useState('');

  if (!isOpen) return null;

  // 过滤指标组
  const filteredGroups = mockMetricGroups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase()) ||
    group.code.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-white rounded-xl shadow-xl w-[600px] max-h-[600px] flex flex-col">
        {/* 标题 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">选择指标组</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索指标组名称或编码"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 指标组列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              未找到匹配的指标组
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelect(group)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedGroupId === group.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {group.name}
                        </h4>
                        {selectedGroupId === group.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{group.code}</p>
                      {group.description && (
                        <p className="text-xs text-gray-400">{group.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
