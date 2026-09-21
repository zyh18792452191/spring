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

// 产品分类
const productCategories = [
  { id: 'base', name: '基础套餐', children: [
    { id: 'base-4g', name: '4G套餐' },
    { id: 'base-5g', name: '5G套餐' },
  ]},
  { id: 'addon', name: '叠加包', children: [
    { id: 'addon-data', name: '流量包' },
    { id: 'addon-voice', name: '语音包' },
  ]},
  { id: 'broadband', name: '宽带产品', children: [
    { id: 'bb-single', name: '单宽带' },
    { id: 'bb-converge', name: '融合宽带' },
  ]},
  { id: 'value', name: '增值业务', children: [
    { id: 'value-hd', name: '高清业务' },
    { id: 'value-security', name: '安全业务' },
  ]},
];

// 产品 mock 数据
const mockProducts = [
  { id: 'PROD001', code: '5G-CX-199', name: '5G畅享199套餐', description: '含60GB流量+1000分钟通话', category: 'base-5g', price: 199 },
  { id: 'PROD002', code: '5G-CX-129', name: '5G畅享129套餐', description: '含30GB流量+500分钟通话', category: 'base-5g', price: 129 },
  { id: 'PROD003', code: '5G-CX-99', name: '5G畅享99套餐', description: '含20GB流量+300分钟通话', category: 'base-5g', price: 99 },
  { id: 'PROD004', code: '4G-FX-79', name: '4G飞享79套餐', description: '含10GB流量+200分钟通话', category: 'base-4g', price: 79 },
  { id: 'PROD005', code: '4G-FX-59', name: '4G飞享59套餐', description: '含5GB流量+100分钟通话', category: 'base-4g', price: 59 },
  { id: 'PROD006', code: 'LL-10GB', name: '10GB流量加油包', description: '当月有效10GB流量', category: 'addon-data', price: 30 },
  { id: 'PROD007', code: 'LL-20GB', name: '20GB流量加油包', description: '当月有效20GB流量', category: 'addon-data', price: 50 },
  { id: 'PROD008', code: 'YY-100M', name: '100分钟语音包', description: '当月有效100分钟通话', category: 'addon-voice', price: 15 },
  { id: 'PROD009', code: 'BB-300M', name: '300M单宽带', description: '300M宽带月租', category: 'bb-single', price: 80 },
  { id: 'PROD010', code: 'BB-500M', name: '500M单宽带', description: '500M宽带月租', category: 'bb-single', price: 120 },
  { id: 'PROD011', code: 'RH-199', name: '融合199套餐', description: '含60GB流量+1000分钟+300M宽带', category: 'bb-converge', price: 199 },
  { id: 'PROD012', code: 'RH-299', name: '融合299套餐', description: '含100GB流量+2000分钟+500M宽带+高清TV', category: 'bb-converge', price: 299 },
  { id: 'PROD013', code: 'HD-BASIC', name: '高清基础包', description: '含50+高清频道', category: 'value-hd', price: 20 },
  { id: 'PROD014', code: 'SEC-PKG', name: '安全防护包', description: '含防诈骗+隐私保护', category: 'value-security', price: 10 },
];

const PAGE_SIZE = 10;

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

interface ProductSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds?: string[];
  onConfirm: (products: ProductItem[]) => void;
  multiple?: boolean;
}

export default function ProductSelector({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
  multiple = true,
}: ProductSelectorProps) {
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

  const filteredProducts = useMemo(() => {
    let list = mockProducts as typeof mockProducts;
    if (activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.code.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [searchText, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = filteredProducts.slice(
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
    const selected = mockProducts.filter((p) =>
      innerSelected.includes(p.id)
    );
    onConfirm(selected);
    onOpenChange(false);
  };

  const handleRemove = (id: string) => {
    setInnerSelected((prev) => prev.filter((x) => x !== id));
  };

  const selectedItems = mockProducts.filter((p) =>
    innerSelected.includes(p.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent disableMaxWidth className="w-[1000px] max-w-[95vw] h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择产品</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 flex-1 min-h-0">
          {/* 左侧分类树 */}
          <div className="w-56 border rounded-md p-3 shrink-0 flex flex-col">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              产品分类
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
                全部产品
              </div>
              {productCategories.map((cat) => (
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

          {/* 右侧产品列表 */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索产品名称或编码..."
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
                    <th className="text-left py-2 px-3 font-medium w-28">产品编码</th>
                    <th className="text-left py-2 px-3 font-medium">产品名称</th>
                    <th className="text-left py-2 px-3 font-medium w-48">描述</th>
                    <th className="text-right py-2 px-3 font-medium w-20">月费(元)</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t cursor-pointer hover:bg-muted/30 ${
                        innerSelected.includes(p.id) ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleToggle(p.id)}
                    >
                      <td className="py-2 px-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            innerSelected.includes(p.id)
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {innerSelected.includes(p.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {p.code}
                      </td>
                      <td className="py-2 px-3 font-medium whitespace-nowrap">{p.name}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs max-w-[200px] truncate" title={p.description}>
                        {p.description}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">{p.price}</td>
                    </tr>
                  ))}
                  {pagedProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        未找到匹配产品
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>

            {/* 分页 */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>共 {filteredProducts.length} 条</span>
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

            {/* 已选产品 */}
            {selectedItems.length > 0 && (
              <div className="mt-3 border rounded-md p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  已选产品（{selectedItems.length}）
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {p.code} - {p.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(p.id);
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
