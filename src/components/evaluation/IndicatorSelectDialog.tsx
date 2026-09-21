'use client';

import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

// ====== 分类定义 ======
type Category = 'traffic' | 'churn' | 'family' | 'incremental' | 'vip' | 'international';

const INDICATOR_CATEGORIES: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'traffic', label: '流量运营' },
  { key: 'churn', label: '离网维系' },
  { key: 'family', label: '家庭运营' },
  { key: 'incremental', label: '增量运营' },
  { key: 'vip', label: '中高端客户运营' },
  { key: 'international', label: '国际业务运营' },
];

export interface IndicatorOption {
  id: string;
  name: string;
  unit: string;
  category: Category;
}

interface IndicatorSelectDialogProps {
  open: boolean;
  onClose: () => void;
  indicators: IndicatorOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function IndicatorSelectDialog({
  open,
  onClose,
  indicators,
  selectedId,
  onSelect,
}: IndicatorSelectDialogProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');

  // 切换分类时重置搜索
  const handleCategoryChange = (cat: Category | 'all') => {
    setCategory(cat);
    setSearch('');
  };

  // 过滤列表
  const filteredList = useMemo(() => {
    let list = indicators;
    if (category !== 'all') {
      list = list.filter(a => a.category === category);
    }
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(kw));
    }
    return list;
  }, [indicators, category, search]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[640px]" disableMaxWidth>
        <DialogHeader>
          <DialogTitle>选择指标</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索指标名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 分类Tab */}
          <div className="flex flex-wrap gap-1.5">
            {INDICATOR_CATEGORIES.map(cat => (
              <Badge
                key={cat.key}
                variant={category === cat.key ? 'default' : 'outline'}
                className="cursor-pointer text-xs px-2.5 py-1"
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* 指标列表 */}
          <ScrollArea className="h-[360px] border rounded-md">
            {filteredList.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                {category === 'all' ? '未找到匹配的指标' : `${INDICATOR_CATEGORIES.find(c => c.key === category)?.label ?? ''}暂无指标`}
              </div>
            ) : (
              <div className="divide-y">
                {filteredList.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => handleSelect(ind.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between group ${
                      selectedId === ind.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{ind.name}</span>
                      <span className="text-xs text-muted-foreground">{ind.unit}</span>
                    </div>
                    {selectedId === ind.id && (
                      <Badge variant="default" className="text-xs">当前</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* 提示 */}
          <p className="text-xs text-muted-foreground">
            当前展示指标来源于流量运营概览与指标树，生产环境将从调度工单中自动提取关联指标
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
