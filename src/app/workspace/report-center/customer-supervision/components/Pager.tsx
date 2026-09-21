'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PagerProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// 通用分页组件（Element UI 风格：条数选择 + 页码 + 前往页）
export default function Pager({ total, page, pageSize, onPageChange, onPageSizeChange }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // 页码序列（最多展示5个）
  const pages: number[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (page <= 3) {
    for (let i = 1; i <= 5; i++) pages.push(i);
  } else if (page >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = page - 2; i <= page + 2; i++) pages.push(i);
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="text-sm text-gray-600">共 {total} 条</div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1); }}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={page === p ? 'default' : 'outline'}
            className={cn('w-8 h-8 text-xs', page === p && 'bg-[#3471ff] border-[#3471ff] hover:bg-[#3471ff]/90')}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600 ml-1">共 {totalPages} 页</span>
      </div>
    </div>
  );
}
