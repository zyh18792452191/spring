'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_REPORTS, isFavorite, MOCK_FAVORITES, REPORT_STATUS_MAP, STAT_PERIOD_MAP, countLeafColumns } from '../data/mockReportData';
import { REPORT_CATEGORIES, getCategoryById, CATEGORY_COLOR_MAP } from '../data/categoryData';
import ReportCard from '../components/ReportCard';
import {
  LayoutList, LayoutGrid, Search, Plus, Star, StarOff,
  Pencil, Eye, Copy, Trash2, MoreHorizontal, Save,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SaveAsTemplateDialog from '../components/SaveAsTemplateDialog';
import { ReportConfig } from '../data/types';

type ViewMode = 'list' | 'card';

export default function CustomReportDesignPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(
    () => new Set(MOCK_FAVORITES.filter(f => f.userId === 'current').map(f => f.reportId))
  );
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [saveAsTemplateReport, setSaveAsTemplateReport] = useState<ReportConfig | null>(null);

  const filteredReports = useMemo(() => {
    let list = MOCK_REPORTS;
    if (selectedCategory !== 'all') {
      list = list.filter(r => r.categoryId === selectedCategory);
    }
    if (showFavoritesOnly) {
      list = list.filter(r => favoriteSet.has(r.reportId));
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(r =>
        r.reportName.toLowerCase().includes(lower) ||
        r.reportDesc.toLowerCase().includes(lower) ||
        r.createdBy.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [selectedCategory, showFavoritesOnly, search, favoriteSet]);

  const toggleFavorite = (reportId: string) => {
    setFavoriteSet(prev => {
      const next = new Set(prev);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      return next;
    });
  };

  const handleView = (reportId: string) => {
    router.push(`/workspace/report-center/create?view=${reportId}`);
  };

  const handleEdit = (reportId: string) => {
    router.push(`/workspace/report-center/create?edit=${reportId}`);
  };

  const handleDuplicate = (_reportId: string) => {
    // TODO: 复制报表
  };

  const handleDelete = (_reportId: string) => {
    // TODO: 删除报表
  };

  const handleSaveAsTemplate = (report: ReportConfig) => {
    setSaveAsTemplateReport(report);
    setSaveAsTemplateOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">报表管理</h1>
            <p className="text-sm text-muted-foreground mt-1">报表实例管理，配置指标组合、区域模式与数据周期</p>
          </div>
          <button
            onClick={() => router.push('/workspace/report-center/create')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> 新建报表
          </button>
        </div>

        {/* 筛选行 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 搜索 */}
          <div className="relative flex-1 min-w-[200px] max-w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索报表名称、描述、创建人..."
              className="w-full h-9 pl-9 pr-3 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              全部
            </button>
            {REPORT_CATEGORIES.filter(c => c.status === 'active').map(cat => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategory(cat.categoryId)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  selectedCategory === cat.categoryId ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>

          {/* 收藏筛选 */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
              showFavoritesOnly ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {showFavoritesOnly ? <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> : <StarOff className="w-3.5 h-3.5" />}
            我的收藏
          </button>

          <div className="flex-1" />

          {/* 视图切换 */}
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
              title="列表视图"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
              title="卡片视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 统计栏 */}
      <div className="flex-shrink-0 px-6 py-2 border-b border-border bg-muted/20 text-xs text-muted-foreground">
        共 {filteredReports.length} 个报表
        {showFavoritesOnly && ` (收藏 ${favoriteSet.size} 个)`}
      </div>

      {/* 报表内容区 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <BarChart3Icon className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">暂无匹配的报表</p>
          </div>
        ) : viewMode === 'card' ? (
          /* 卡片视图 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map(report => (
              <ReportCard
                key={report.reportId}
                report={report}
                onFavorite={toggleFavorite}
                onView={handleView}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onSaveAsTemplate={handleSaveAsTemplate}
              />
            ))}
          </div>
        ) : (
          /* 列表视图 */
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">
                    <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} title="收藏筛选">
                      <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">报表名称</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">分类</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">统计周期</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">列数</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">创建人</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">最近访问</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => {
                  const category = getCategoryById(report.categoryId);
                  const colorMap = category ? CATEGORY_COLOR_MAP[category.color] : CATEGORY_COLOR_MAP.gray;
                  const statusInfo = REPORT_STATUS_MAP[report.status];
                  const fav = favoriteSet.has(report.reportId);
                  const colCount = countLeafColumns(report.columnConfig);
                  return (
                    <tr key={report.reportId} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleFavorite(report.reportId)}>
                          {fav ? <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleView(report.reportId)}
                          className="text-left font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {report.reportName}
                        </button>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{report.reportDesc}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colorMap.bg} ${colorMap.text} ${colorMap.border} border`}>
                          {category?.categoryName || '其他'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{STAT_PERIOD_MAP[report.statPeriod]}报</td>
                      <td className="px-4 py-3 text-muted-foreground">{colCount}</td>
                      <td className="px-4 py-3 text-muted-foreground">{report.createdBy}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">-</td>
                      <td className="px-4 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-muted rounded transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => handleView(report.reportId)}>
                              <Eye className="w-4 h-4 mr-2" /> 查看
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(report.reportId)}>
                              <Pencil className="w-4 h-4 mr-2" /> 编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(report.reportId)}>
                              <Copy className="w-4 h-4 mr-2" /> 复制
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSaveAsTemplate(report)}>
                              <Save className="w-4 h-4 mr-2" /> 另存为模板
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(report.reportId)}>
                              <Trash2 className="w-4 h-4 mr-2" /> 删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 另存为模板对话框 */}
      {saveAsTemplateReport && (
        <SaveAsTemplateDialog
          open={saveAsTemplateOpen}
          onOpenChange={setSaveAsTemplateOpen}
          report={saveAsTemplateReport}
          onSaved={(templateId) => {
            setSaveAsTemplateOpen(false);
            setSaveAsTemplateReport(null);
            // 可选：跳转到模板管理页
          }}
        />
      )}
    </div>
  );
}

function BarChart3Icon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
  );
}
