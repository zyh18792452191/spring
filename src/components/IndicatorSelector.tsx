'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { businessScenarios } from '@/lib/business-scenarios';

// 指标 mock 数据 - 与指标库管理列表页字段对齐
const mockIndicators = [
  { id: 'IND001', name: '降档客户数', code: 'JIANGDANG_CNT', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention' },
  { id: 'IND002', name: '降档客户数环比', code: 'JIANGDANG_CNT_QOQ', isGroupMetric: false, metricType: '衍生指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention' },
  { id: 'IND003', name: 'ARPU值', code: 'ARPU', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 中高端', businessScenarioId: 'mid_high_end' },
  { id: 'IND004', name: 'ARPU环比增幅', code: 'ARPU_QOQ', isGroupMetric: false, metricType: '衍生指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 中高端', businessScenarioId: 'mid_high_end' },
  { id: 'IND005', name: '流量DOU', code: 'DOU', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products' },
  { id: 'IND006', name: '流量DOU环比', code: 'DOU_QOQ', isGroupMetric: false, metricType: '衍生指标', granularity: '地市', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products' },
  { id: 'IND007', name: '5G登网率', code: '5G_LOGIN_RATE', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products' },
  { id: 'IND008', name: '携转净流入量', code: 'MNP_NET_IN', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 市场运营 / 新入网', businessScenarioId: 'new_subscriptions' },
  { id: 'IND009', name: '宽带新增用户数', code: 'BB_NEW_USER', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '家庭市场 / 宽带业务 / 光纤宽带', businessScenarioId: 'fiber' },
  { id: 'IND010', name: '融合套餐渗透率', code: 'CONVERGE_PENETRATION', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '家庭市场 / 宽带业务 / 光纤宽带', businessScenarioId: 'fiber' },
  { id: 'IND011', name: '高价值客户流失率', code: 'HV_CHURN_RATE', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 中高端流失预警', businessScenarioId: 'mid_high_end_warning' },
  { id: 'IND012', name: '新入网客户数', code: 'NEW_USER_CNT', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 市场运营 / 新入网', businessScenarioId: 'new_subscriptions' },
  { id: 'IND013', name: '套餐流量容量利用率', code: 'PKG_CAPACITY_USAGE', isGroupMetric: false, metricType: '衍生指标', granularity: '地市', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products' },
  { id: 'IND014', name: '竞品携出率', code: 'COMP_MNP_OUT_RATE', isGroupMetric: false, metricType: '衍生指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention' },
  { id: 'IND015', name: '到期合约续约率', code: 'CONTRACT_RENEW_RATE', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention' },
  { id: 'IND016', name: '零流量用户占比', code: 'ZERO_TRAFFIC_RATIO', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products' },
  { id: 'IND017', name: '中高端客户ARPU', code: 'MH_ARPU', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '公众市场 / 客户运营 / 中高端', businessScenarioId: 'mid_high_end' },
  { id: 'IND018', name: '宽带客户流失率', code: 'BB_CHURN_RATE', isGroupMetric: true, metricType: '存量指标', granularity: '地市', businessScenarioPath: '家庭市场 / 宽带业务 / 光纤宽带', businessScenarioId: 'fiber' },
];

const PAGE_SIZE = 10;

export interface IndicatorItem {
  id: string;
  name: string;
  code: string;
  isGroupMetric: boolean;
  metricType: string;
  granularity: string;
  businessScenarioPath: string;
  businessScenarioId: string;
}

interface IndicatorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds?: string[];
  onConfirm: (indicators: IndicatorItem[]) => void;
  multiple?: boolean;
}

// 收集所有叶子节点ID（用于筛选匹配）
function collectLeafIds(node: typeof businessScenarios[0]): string[] {
  if (!node.children || node.children.length === 0) {
    return [node.id];
  }
  return node.children.flatMap(collectLeafIds);
}

// 收集节点及其所有子孙的叶子ID
function collectAllDescendantLeafIds(node: typeof businessScenarios[0]): string[] {
  const selfLeafIds = (!node.children || node.children.length === 0) ? [node.id] : [];
  const childLeafIds = node.children ? node.children.flatMap(collectAllDescendantLeafIds) : [];
  return [...selfLeafIds, ...childLeafIds];
}

export default function IndicatorSelector({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
  multiple = true,
}: IndicatorSelectorProps) {
  const [searchText, setSearchText] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['public_market']));
  const [innerSelected, setInnerSelected] = useState<string[]>(selectedIds ?? []);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setInnerSelected(selectedIds ?? []);
  }, [selectedIds]);

  // 搜索或分类变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeScenarioId]);

  // 获取选中节点及其所有子孙的叶子ID集合（用于筛选指标）
  const activeScenarioLeafIds = useMemo(() => {
    if (!activeScenarioId) return null; // null 表示不筛选
    // 在 businessScenarios 树中找到该节点
    const findNode = (nodes: typeof businessScenarios): typeof businessScenarios[0] | null => {
      for (const n of nodes) {
        if (n.id === activeScenarioId) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(businessScenarios);
    if (!node) return null;
    return new Set(collectAllDescendantLeafIds(node));
  }, [activeScenarioId]);

  const filteredIndicators = useMemo(() => {
    let list = mockIndicators;
    if (activeScenarioLeafIds) {
      list = list.filter((ind) => activeScenarioLeafIds.has(ind.businessScenarioId));
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      list = list.filter(
        (ind) =>
          ind.name.toLowerCase().includes(lower) ||
          ind.code.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [searchText, activeScenarioLeafIds]);

  const totalPages = Math.max(1, Math.ceil(filteredIndicators.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedIndicators = filteredIndicators.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleToggle = (id: string) => {
    if (!multiple) {
      setInnerSelected([id]);
      return;
    }
    setInnerSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selected = mockIndicators.filter((ind) =>
      innerSelected.includes(ind.id)
    );
    onConfirm(selected);
    onOpenChange(false);
  };

  const handleRemove = (id: string) => {
    setInnerSelected((prev) => prev.filter((x) => x !== id));
  };

  const selectedItems = mockIndicators.filter((ind) =>
    innerSelected.includes(ind.id)
  );

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // 渲染业务场景树节点
  const renderScenarioNode = (
    node: typeof businessScenarios[0],
    depth: number = 0
  ) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = activeScenarioId === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer text-sm ${
            isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            setActiveScenarioId(isActive ? '' : node.id);
            if (hasChildren && !isExpanded) {
              toggleExpand(node.id);
            }
          }}
        >
          {hasChildren ? (
            <span
              className="shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </span>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderScenarioNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableMaxWidth className="w-[1000px] max-w-[95vw] h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择指标</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 flex-1 min-h-0">
          {/* 左侧业务场景分类树 */}
          <div className="w-56 border rounded-md p-3 shrink-0 flex flex-col">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              业务场景
            </div>
            <ScrollArea className="flex-1">
              <div
                className={`px-2 py-1.5 rounded cursor-pointer text-sm mb-1 ${
                  !activeScenarioId
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setActiveScenarioId('')}
              >
                全部指标
              </div>
              {businessScenarios.map((node) => renderScenarioNode(node))}
            </ScrollArea>
          </div>

          {/* 右侧指标列表 */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索指标名称或编码..."
                className="pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-1 border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium w-10">选择</th>
                    <th className="text-left py-2 px-3 font-medium">指标名称</th>
                    <th className="text-left py-2 px-3 font-medium w-32">编码</th>
                    <th className="text-left py-2 px-3 font-medium w-20">客群指标</th>
                    <th className="text-left py-2 px-3 font-medium w-20">类型</th>
                    <th className="text-left py-2 px-3 font-medium w-16">粒度</th>
                    <th className="text-left py-2 px-3 font-medium w-44">业务场景</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedIndicators.map((ind) => (
                    <tr
                      key={ind.id}
                      className={`border-t cursor-pointer hover:bg-muted/30 ${
                        innerSelected.includes(ind.id) ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleToggle(ind.id)}
                    >
                      <td className="py-2 px-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            innerSelected.includes(ind.id)
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {innerSelected.includes(ind.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">{ind.name}</td>
                      <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                        {ind.code}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={ind.isGroupMetric ? 'default' : 'outline'} className="text-xs">
                          {ind.isGroupMetric ? '是' : '否'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">
                        {ind.metricType}
                      </td>
                      <td className="py-2 px-3 text-xs">{ind.granularity}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs text-muted-foreground">{ind.businessScenarioPath}</span>
                      </td>
                    </tr>
                  ))}
                  {pagedIndicators.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        未找到匹配指标
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>

            {/* 分页 */}
            {filteredIndicators.length > 0 && (
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>共 {filteredIndicators.length} 条</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span>{safePage} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 已选指标 */}
        {selectedItems.length > 0 && (
          <div className="border-t pt-3 mt-2">
            <div className="text-sm text-muted-foreground mb-2">
              已选 {selectedItems.length} 项
            </div>
            <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto">
              {selectedItems.map((ind) => (
                <Badge
                  key={ind.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {ind.name}
                  <button
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(ind.id);
                    }}
                  >
                    <span className="text-xs">&times;</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={innerSelected.length === 0}>
            确认选择 ({innerSelected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
