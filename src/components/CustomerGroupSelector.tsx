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
import { Search, X, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { businessScenarios } from '@/lib/business-scenarios';

// 客群 mock 数据 - 与客群管理列表页字段对齐
const mockCustomerGroups = [
  { id: 'CG001', code: 'SEG_HV_LOWCOST_001', name: '高流量低资费客户', businessScenarioPath: '公众市场 / 客户运营 / 中高端', businessScenarioId: 'mid_high_end', businessDefinition: '月均流量>20GB且ARPU<50元', relatedTags: ['高价值', '流量型'], status: '生效' },
  { id: 'CG002', code: 'SEG_MNP_RISK_001', name: '携转高风险客户', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention', businessDefinition: '近30天携转查询>2次且无合约', relatedTags: ['携转相关', '无合约'], status: '生效' },
  { id: 'CG003', code: 'SEG_5G_UPGRADE_001', name: '5G终端持有4G套餐', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products', businessDefinition: '持有5G终端但仍在用4G套餐', relatedTags: ['5G用户', '价值提升'], status: '生效' },
  { id: 'CG004', code: 'SEG_CONTRACT_EXPIRY_001', name: '到期未续约客户', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention', businessDefinition: '合约到期30天内未续约', relatedTags: ['合约即将到期'], status: '生效' },
  { id: 'CG005', code: 'SEG_ZERO_TRAFFIC_001', name: '零流量使用客户', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products', businessDefinition: '连续30天零流量使用', relatedTags: ['沉默期', '零价值'], status: '生效' },
  { id: 'CG006', code: 'SEG_BB_EXPIRY_001', name: '宽带到期客户', businessScenarioPath: '家庭市场 / 宽带业务 / 光纤宽带', businessScenarioId: 'fiber', businessDefinition: '宽带合约即将到期', relatedTags: ['合约即将到期', '融合型'], status: '生效' },
  { id: 'CG007', code: 'SEG_DOWNGRADE_001', name: '降档倾向客户', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention', businessDefinition: '近7天查询低档套餐>3次', relatedTags: ['价格敏感', '降档倾向'], status: '生效' },
  { id: 'CG008', code: 'SEG_CAMPUS_001', name: '校园新生客群', businessScenarioPath: '公众市场 / 细分市场运营 / 校园市场', businessScenarioId: 'campus_market', businessDefinition: '18-22岁新入网客户', relatedTags: ['校园人群', '新入网'], status: '生效' },
  { id: 'CG009', code: 'SEG_SILVER_001', name: '银发低消费客群', businessScenarioPath: '公众市场 / 细分市场运营 / 银发市场', businessScenarioId: 'silver_market', businessDefinition: '60岁以上ARPU<30元', relatedTags: ['银发市场', '低价值'], status: '失效' },
  { id: 'CG010', code: 'SEG_GOV_HV_001', name: '政企高价值客群', businessScenarioPath: '政企市场 / 政企客户运营', businessScenarioId: 'enterprise_customer', businessDefinition: '政企客户ARPU>200元', relatedTags: ['政企人群', '高价值'], status: '生效' },
  { id: 'CG011', code: 'SEG_COMPLAINT_001', name: '高频投诉客群', businessScenarioPath: '公众市场 / 客户运营 / 离网维系', businessScenarioId: 'churn_retention', businessDefinition: '近30天投诉次数≥3次', relatedTags: ['投诉风险'], status: '生效' },
  { id: 'CG012', code: 'SEG_NEW_SILENT_001', name: '新入网沉默客群', businessScenarioPath: '公众市场 / 市场运营 / 新入网', businessScenarioId: 'new_subscriptions', businessDefinition: '入网90天内零主动业务办理', relatedTags: ['沉默期', '新入网'], status: '生效' },
  { id: 'CG013', code: 'SEG_CONVERGE_001', name: '融合套餐潜在客群', businessScenarioPath: '家庭市场 / 宽带业务 / 光纤宽带', businessScenarioId: 'fiber', businessDefinition: '单卡用户且有宽带地址', relatedTags: ['融合型', '价值提升'], status: '生效' },
  { id: 'CG014', code: 'SEG_CONTRACT_60_001', name: '到期合约客群', businessScenarioPath: '公众市场 / 客户运营 / 中高端流失预警', businessScenarioId: 'mid_high_end_warning', businessDefinition: '合约到期60天内', relatedTags: ['合约即将到期'], status: '生效' },
  { id: 'CG015', code: 'SEG_OVERFLOW_001', name: '流量超套客群', businessScenarioPath: '公众市场 / 产品运营 / 数据产品', businessScenarioId: 'data_products', businessDefinition: '月流量超出套餐额度>50%', relatedTags: ['流量型', '价格敏感'], status: '生效' },
];

const PAGE_SIZE = 10;

export interface CustomerGroupItem {
  id: string;
  code: string;
  name: string;
  businessScenarioPath: string;
  businessScenarioId: string;
  businessDefinition: string;
  relatedTags: string[];
  status: string;
}

interface CustomerGroupSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds?: string[];
  onConfirm: (groups: CustomerGroupItem[]) => void;
  multiple?: boolean;
}

// 收集节点及其所有子孙的叶子ID
function collectAllDescendantLeafIds(node: typeof businessScenarios[0]): string[] {
  const selfLeafIds = (!node.children || node.children.length === 0) ? [node.id] : [];
  const childLeafIds = node.children ? node.children.flatMap(collectAllDescendantLeafIds) : [];
  return [...selfLeafIds, ...childLeafIds];
}

export default function CustomerGroupSelector({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
  multiple = true,
}: CustomerGroupSelectorProps) {
  const [searchText, setSearchText] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['public_market']));
  const [innerSelected, setInnerSelected] = useState<string[]>(selectedIds ?? []);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setInnerSelected(selectedIds ?? []);
  }, [selectedIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeScenarioId]);

  // 获取选中节点及其所有子孙的叶子ID集合
  const activeScenarioLeafIds = useMemo(() => {
    if (!activeScenarioId) return null;
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

  const filteredGroups = useMemo(() => {
    let list = mockCustomerGroups;
    if (activeScenarioLeafIds) {
      list = list.filter((g) => activeScenarioLeafIds.has(g.businessScenarioId));
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(lower) ||
          g.code.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [searchText, activeScenarioLeafIds]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedGroups = filteredGroups.slice(
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
    const selected = mockCustomerGroups.filter((g) =>
      innerSelected.includes(g.id)
    );
    onConfirm(selected);
    onOpenChange(false);
  };

  const handleRemove = (id: string) => {
    setInnerSelected((prev) => prev.filter((x) => x !== id));
  };

  const selectedItems = mockCustomerGroups.filter((g) =>
    innerSelected.includes(g.id)
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
          <DialogTitle>选择客群</DialogTitle>
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
                全部客群
              </div>
              {businessScenarios.map((node) => renderScenarioNode(node))}
            </ScrollArea>
          </div>

          {/* 右侧客群列表 */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索客群名称或编码..."
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
                    <th className="text-left py-2 px-3 font-medium">客群名称</th>
                    <th className="text-left py-2 px-3 font-medium w-36">编码</th>
                    <th className="text-left py-2 px-3 font-medium w-44">业务场景</th>
                    <th className="text-left py-2 px-3 font-medium w-32">关联标签</th>
                    <th className="text-left py-2 px-3 font-medium w-16">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedGroups.map((g) => (
                    <tr
                      key={g.id}
                      className={`border-t cursor-pointer hover:bg-muted/30 ${
                        innerSelected.includes(g.id) ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleToggle(g.id)}
                    >
                      <td className="py-2 px-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            innerSelected.includes(g.id)
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {innerSelected.includes(g.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-medium whitespace-nowrap">{g.name}</td>
                      <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                        {g.code}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-xs text-muted-foreground">{g.businessScenarioPath}</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {g.relatedTags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs whitespace-nowrap">
                              {tag}
                            </Badge>
                          ))}
                          {g.relatedTags.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{g.relatedTags.length - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={g.status === '生效' ? 'default' : 'outline'} className="text-xs">
                          {g.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {pagedGroups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        未找到匹配客群
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>

            {/* 分页 */}
            {filteredGroups.length > 0 && (
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>共 {filteredGroups.length} 条</span>
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

        {/* 已选客群 */}
        {selectedItems.length > 0 && (
          <div className="border-t pt-3 mt-2">
            <div className="text-sm text-muted-foreground mb-2">
              已选 {selectedItems.length} 项
            </div>
            <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto">
              {selectedItems.map((g) => (
                <Badge
                  key={g.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {g.name}
                  <button
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(g.id);
                    }}
                  >
                    <X className="h-3 w-3" />
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
