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
import { Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// 根因分类
const rootCauseCategories = [
  { id: 'price', name: '价格与竞争因素', children: [
    { id: 'price-compete', name: '竞品资费优势' },
    { id: 'price-sensitive', name: '价格敏感度' },
  ]},
  { id: 'product', name: '产品与套餐因素', children: [
    { id: 'product-mismatch', name: '套餐匹配度' },
    { id: 'product-capacity', name: '容量不足' },
  ]},
  { id: 'service', name: '服务与体验因素', children: [
    { id: 'service-quality', name: '服务质量' },
    { id: 'service-network', name: '网络质量' },
  ]},
  { id: 'market', name: '市场与政策因素', children: [
    { id: 'market-competition', name: '市场竞争' },
    { id: 'market-policy', name: '政策影响' },
  ]},
  { id: 'lifecycle', name: '生命周期因素', children: [
    { id: 'lifecycle-expire', name: '合约到期' },
    { id: 'lifecycle-silent', name: '沉默流失' },
  ]},
  { id: 'channel', name: '渠道与触点因素', children: [
    { id: 'channel-reach', name: '触达不足' },
    { id: 'channel-quality', name: '渠道质量' },
  ]},
];

// 根因 mock 数据
const mockRootCauses = [
  { id: 'RC001', name: '竞品资费低于本网同档位', category: 'price-compete', confidence: 0.88, source: '专家经验', businessScenarios: ['离网维系', '中高端客户运营'] },
  { id: 'RC002', name: '客户套餐与使用习惯不匹配', category: 'product-mismatch', confidence: 0.82, source: 'AI生成', businessScenarios: ['流量运营', '离网维系'] },
  { id: 'RC003', name: '套餐流量容量不足', category: 'product-capacity', confidence: 0.76, source: '专家经验', businessScenarios: ['流量运营'] },
  { id: 'RC004', name: '网络覆盖质量差', category: 'service-network', confidence: 0.71, source: '专家经验', businessScenarios: ['家庭运营', '增量运营'] },
  { id: 'RC005', name: '合约到期未及时续约', category: 'lifecycle-expire', confidence: 0.91, source: '专家经验', businessScenarios: ['离网维系'] },
  { id: 'RC006', name: '竞品5G套餐更具吸引力', category: 'price-compete', confidence: 0.79, source: 'AI生成', businessScenarios: ['流量运营', '增量运营'] },
  { id: 'RC007', name: '客户触达渠道覆盖不足', category: 'channel-reach', confidence: 0.65, source: '专家经验', businessScenarios: ['离网维系', '增量运营'] },
  { id: 'RC008', name: '季节性波动/正常波动', category: 'market-policy', confidence: 0.58, source: 'AI生成', businessScenarios: ['流量运营'] },
  { id: 'RC009', name: '宽带速率不达预期', category: 'service-quality', confidence: 0.73, source: '专家经验', businessScenarios: ['家庭运营'] },
  { id: 'RC010', name: '携转政策降低客户转换成本', category: 'market-competition', confidence: 0.85, source: '专家经验', businessScenarios: ['离网维系', '增量运营'] },
  { id: 'RC011', name: '沉默客户长期无互动', category: 'lifecycle-silent', confidence: 0.69, source: 'AI生成', businessScenarios: ['离网维系'] },
  { id: 'RC012', name: '重大竞品事件/系统性问题', category: 'market-competition', confidence: 0.83, source: '专家经验', businessScenarios: ['离网维系', '中高端客户运营'] },
];

const PAGE_SIZE = 10;

export interface RootCauseItem {
  id: string;
  name: string;
  category: string;
  confidence: number;
  source: string;
  businessScenarios: string[];
}

interface RootCauseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds?: string[];
  onConfirm: (rootCauses: RootCauseItem[]) => void;
  multiple?: boolean;
}

export default function RootCauseSelector({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
  multiple = true,
}: RootCauseSelectorProps) {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [innerSelected, setInnerSelected] = useState<string[]>(selectedIds ?? []);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setInnerSelected(selectedIds ?? []);
  }, [selectedIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeCategory]);

  const filteredRootCauses = useMemo(() => {
    let list = mockRootCauses;
    if (activeCategory) {
      list = list.filter((rc) => rc.category === activeCategory);
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      list = list.filter((rc) => rc.name.toLowerCase().includes(lower));
    }
    return list;
  }, [searchText, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredRootCauses.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRootCauses = filteredRootCauses.slice(
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
    const selected = mockRootCauses.filter((rc) =>
      innerSelected.includes(rc.id)
    );
    onConfirm(selected);
    onOpenChange(false);
  };

  const handleRemove = (id: string) => {
    setInnerSelected((prev) => prev.filter((x) => x !== id));
  };

  const selectedItems = mockRootCauses.filter((rc) =>
    innerSelected.includes(rc.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableMaxWidth className="w-[1000px] max-w-[95vw] h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择根因</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 flex-1 min-h-0">
          {/* 左侧分类树 */}
          <div className="w-56 border rounded-md p-3 shrink-0 flex flex-col">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              根因分类
            </div>
            <ScrollArea className="flex-1">
              <div
                className={`px-2 py-1.5 rounded cursor-pointer text-sm mb-1 ${
                  !activeCategory
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setActiveCategory('')}
              >
                全部根因
              </div>
              {rootCauseCategories.map((cat) => (
                <div key={cat.id} className="mb-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {cat.name}
                  </div>
                  {cat.children?.map((child) => (
                    <div
                      key={child.id}
                      className={`px-3 py-1.5 rounded cursor-pointer text-sm ${
                        activeCategory === child.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setActiveCategory(child.id)}
                    >
                      {child.name}
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </div>
          {/* 右侧根因列表 */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索根因名称..."
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
                    <th className="text-left py-2 px-3 font-medium w-16">ID</th>
                    <th className="text-left py-2 px-3 font-medium">根因名称</th>
                    <th className="text-left py-2 px-3 font-medium w-20">来源</th>
                    <th className="text-left py-2 px-3 font-medium w-20">置信度</th>
                    <th className="text-left py-2 px-3 font-medium w-40">业务场景</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRootCauses.map((rc) => (
                    <tr
                      key={rc.id}
                      className={`border-t cursor-pointer hover:bg-muted/30 ${
                        innerSelected.includes(rc.id) ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleToggle(rc.id)}
                    >
                      <td className="py-2 px-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            innerSelected.includes(rc.id)
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {innerSelected.includes(rc.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {rc.id}
                      </td>
                      <td className="py-2 px-3 font-medium whitespace-nowrap">{rc.name}</td>
                      <td className="py-2 px-3">
                        <Badge variant={rc.source === 'AI生成' ? 'default' : 'outline'} className="text-xs whitespace-nowrap">
                          {rc.source}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-medium ${
                          rc.confidence >= 0.8 ? 'text-green-600' : rc.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {rc.confidence}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {rc.businessScenarios.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs whitespace-nowrap">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pagedRootCauses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        未找到匹配根因
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>

            {/* 分页 */}
            {filteredRootCauses.length > 0 && (
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>共 {filteredRootCauses.length} 条</span>
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
                  <span>第 {safePage}/{totalPages} 页</span>
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

            {/* 已选根因 */}
            {selectedItems.length > 0 && (
              <div className="mt-3 border rounded-md p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  已选根因（{selectedItems.length}）
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map((rc) => (
                    <Badge
                      key={rc.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {rc.id} - {rc.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(rc.id);
                        }}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={innerSelected.length === 0}>
            确认选择（{innerSelected.length}）
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
