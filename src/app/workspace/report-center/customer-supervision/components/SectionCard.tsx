'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// 卡片容器（Element UI 风格：标题左侧蓝色竖条 + 右上角操作区）
export default function SectionCard({ title, action, children, className }: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-[#3471ff] rounded-sm" />
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      <CardContent className="pt-5 pb-5">{children}</CardContent>
    </Card>
  );
}
