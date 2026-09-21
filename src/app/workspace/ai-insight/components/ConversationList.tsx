'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  FileText,
  Table2,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  MoreHorizontal,
  Archive,
  Trash2,
  Pencil,
  MessageSquare,
  FolderOpen,
  RotateCcw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getAllConversations,
  deleteConversation,
  archiveConversation,
  reopenConversation,
  renameConversation,
  type ConversationState,
} from '../lib/conversation-storage';

/** 产出物类型图标映射 */
const outputTypeIcons: Record<string, React.ReactNode> = {
  report: <FileText className="h-3.5 w-3.5" />,
  excel: <Table2 className="h-3.5 w-3.5" />,
  summary: <ClipboardList className="h-3.5 w-3.5" />,
  charts: <BarChart3 className="h-3.5 w-3.5" />,
  dashboard: <LayoutDashboard className="h-3.5 w-3.5" />,
};

function getTimeGroup(item: ConversationState): string {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const d = new Date(item.updatedAt);
  if (d >= today) return '今天';
  if (d >= yesterday) return '昨天';
  if (d >= weekAgo) return '本周';
  return '更早';
}

interface ConversationListProps {
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onReopen?: (id: string) => void;
  className?: string;
}

export default function ConversationList({
  activeId,
  onSelect,
  onNew,
  onArchive,
  onDelete,
  onRename,
  onReopen,
  className,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationState[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ConversationState | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ConversationState | null>(null);

  // 从 conversation-storage 加载对话列表
  const loadConversations = useCallback(() => {
    const all = getAllConversations();
    setConversations(all);
  }, []);

  useEffect(() => {
    loadConversations();
    // 监听 storage 变化（其他标签页或组件可能修改了数据）
    const handleStorage = () => loadConversations();
    window.addEventListener('storage', handleStorage);
    // 自定义事件：其他组件保存对话后通知刷新列表
    const handleRefresh = () => loadConversations();
    window.addEventListener('conversations-updated', handleRefresh as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('conversations-updated', handleRefresh as EventListener);
    };
  }, [loadConversations]);

  const handleRename = () => {
    if (renameTarget && renameValue.trim()) {
      renameConversation(renameTarget.id, renameValue.trim());
      onRename?.(renameTarget.id, renameValue.trim());
      loadConversations(); // 刷新列表
    }
    setRenameDialogOpen(false);
    setRenameTarget(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteConversation(deleteTarget.id);
      onDelete?.(deleteTarget.id);
      loadConversations(); // 刷新列表
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleArchive = (id: string) => {
    archiveConversation(id);
    onArchive?.(id);
    loadConversations(); // 刷新列表
  };

  const handleReopen = (id: string) => {
    reopenConversation(id);
    onReopen?.(id);
    loadConversations(); // 刷新列表
  };

  // 过滤和分组
  const filtered = searchQuery
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const activeItems = filtered.filter((c) => c.reportStatus !== 'final' && c.reportStatus !== 'archived');
  const archivedItems = filtered.filter((c) => c.reportStatus === 'final' || c.reportStatus === 'archived');

  // 按时间分组
  const groupedActive: Record<string, ConversationState[]> = {};
  activeItems.forEach((item) => {
    const group = getTimeGroup(item);
    if (!groupedActive[group]) groupedActive[group] = [];
    groupedActive[group].push(item);
  });

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  };

  const renderConversationItem = (conv: ConversationState, isArchived?: boolean) => (
    <div
      key={conv.id}
      onClick={() => onSelect(conv.id)}
      className={`group flex items-center gap-2 px-3 py-2 mx-1 rounded-md cursor-pointer transition-colors text-sm ${
        activeId === conv.id
          ? 'bg-accent text-accent-foreground'
          : isArchived
            ? 'hover:bg-muted/50 text-foreground/60'
            : 'hover:bg-muted/50 text-foreground/80'
      }`}
    >
      <span className="shrink-0">
        {conv.outputFormat
          ? outputTypeIcons[conv.outputFormat as keyof typeof outputTypeIcons]
          : <MessageSquare className="h-3.5 w-3.5" />}
      </span>
      <span className="flex-1 truncate text-[13px]">{conv.title}</span>
      <span className="text-[10px] text-muted-foreground/60 shrink-0">
        {formatTime(conv.updatedAt)}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setRenameTarget(conv);
              setRenameValue(conv.title);
              setRenameDialogOpen(true);
            }}
          >
            <Pencil className="h-3 w-3 mr-2" /> 重命名
          </DropdownMenuItem>
          {!isArchived && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleArchive(conv.id);
              }}
            >
              <Archive className="h-3 w-3 mr-2" /> 归档
            </DropdownMenuItem>
          )}
          {isArchived && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleReopen(conv.id);
              }}
            >
              <RotateCcw className="h-3 w-3 mr-2" /> 重新打开
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(conv);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-3 w-3 mr-2" /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const renderGroup = (label: string, items: ConversationState[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-1">
        <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
          {label}
        </div>
        {items.map((conv) => renderConversationItem(conv))}
      </div>
    );
  };

  const timeGroupOrder = ['今天', '昨天', '本周', '更早'];

  return (
    <div className={`flex flex-col h-full bg-muted/30 border-r ${className || ''}`}>
      {/* 顶部新建按钮 */}
      <div className="p-3 border-b">
        <Button
          onClick={onNew}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" /> 新建对话
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-7 bg-background"
          />
        </div>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* 进行中 */}
        {activeItems.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              进行中
            </div>
            {timeGroupOrder.map((g) => renderGroup(g, groupedActive[g] || []))}
          </div>
        )}

        {/* 已归档 */}
        {archivedItems.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <FolderOpen className="h-3 w-3" />
              已归档
            </div>
            {archivedItems.map((conv) => renderConversationItem(conv, true))}
          </div>
        )}

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-xs">
              {searchQuery ? '未找到匹配的对话' : '暂无对话'}
            </p>
            {!searchQuery && (
              <p className="text-xs mt-1">点击上方按钮新建对话</p>
            )}
          </div>
        )}
      </div>

      {/* 重命名弹窗 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>重命名对话</DialogTitle>
            <DialogDescription>输入新的对话名称</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="对话名称"
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRename}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后无法恢复，确认要删除「{deleteTarget?.title}」吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
