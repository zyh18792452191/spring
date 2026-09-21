import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// SimplePagination component for root-node based pagination
interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function SimplePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        显示 {startItem} 至 {endItem} 条，共 {totalItems} 条
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>
        <span className="text-sm">
          第 {currentPage} 页，共 {totalPages} 页
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          下一页
        </Button>
        <Select
          value={pageSize.toString()}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10条/页</SelectItem>
            <SelectItem value="20">20条/页</SelectItem>
            <SelectItem value="50">50条/页</SelectItem>
            <SelectItem value="100">100条/页</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Shadcn/UI-style Pagination components for overview page
export function Pagination({ children }: { children?: React.ReactNode }) {
  return <nav className="flex flex-wrap items-center gap-2">{children}</nav>;
}

export function PaginationContent({ children }: { children?: React.ReactNode }) {
  return <ul className="flex flex-wrap items-center gap-1">{children}</ul>;
}

export function PaginationItem({ children }: { children?: React.ReactNode }) {
  return <li>{children}</li>;
}

interface PaginationLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function PaginationLink({ children, onClick, isActive = false, className = '' }: PaginationLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center text-sm rounded-md transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
}

interface PaginationPreviousProps {
  onClick?: () => void;
  className?: string;
}

export function PaginationPrevious({ onClick, className = '' }: PaginationPreviousProps) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-md border hover:bg-accent ${className}`}
    >
      ←
    </button>
  );
}

interface PaginationNextProps {
  onClick?: () => void;
  className?: string;
}

export function PaginationNext({ onClick, className = '' }: PaginationNextProps) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-md border hover:bg-accent ${className}`}
    >
      →
    </button>
  );
}
