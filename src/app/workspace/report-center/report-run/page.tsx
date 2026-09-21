'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_REPORTS, MOCK_FAVORITES, REPORT_STATUS_MAP, STAT_PERIOD_MAP, countLeafColumns } from '../data/mockReportData';
import { getCategoryById, CATEGORY_COLOR_MAP } from '../data/categoryData';
import { Search, Star, Clock, Eye, BarChart3 } from 'lucide-react';

export default function ReportRunPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'favorite' | 'all'>('recent');

  const favoriteIds = useMemo(
    () => new Set(MOCK_FAVORITES.filter(f => f.userId === 'current').map(f => f.reportId)),
    []
  );

  // 最近运行：取所有已发布报表模拟
  const recentReports = useMemo(() => {
    return MOCK_REPORTS.filter(r => r.status === 'published').slice(0, 8);
  }, []);

  // 收藏报表
  const favoriteReports = useMemo(() => {
    return MOCK_REPORTS.filter(r => favoriteIds.has(r.reportId));
  }, [favoriteIds]);

  // 全部报表
  const allReports = useMemo(() => {
    let list = MOCK_REPORTS.filter(r => r.status === 'published');
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(r =>
        r.reportName.toLowerCase().includes(lower) ||
        r.reportDesc.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [search]);

  const displayList = activeTab === 'recent' ? recentReports
    : activeTab === 'favorite' ? favoriteReports
    : allReports;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">我的报表</h1>
            <p className="text-sm text-muted-foreground mt-1">浏览已发布报表，查看数据分析结果</p>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Clock className="w-4 h-4" /> 最近查看
          </button>
          <button
            onClick={() => setActiveTab('favorite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'favorite' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Star className="w-4 h-4" /> 我的收藏
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 全部报表
          </button>

          {activeTab === 'all' && (
            <div className="relative flex-1 max-w-[360px] ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索报表..."
                className="w-full h-9 pl-9 pr-3 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
        </div>
      </div>

      {/* 报表列表 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">
              {activeTab === 'favorite' ? '暂无收藏报表' : activeTab === 'recent' ? '暂无最近运行的报表' : '暂无匹配的报表'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayList.map(report => {
              const category = getCategoryById(report.categoryId);
              const colorMap = category ? CATEGORY_COLOR_MAP[category.color] : CATEGORY_COLOR_MAP.gray;
              const statusInfo = REPORT_STATUS_MAP[report.status];
              const colCount = countLeafColumns(report.columnConfig);
              const isFav = favoriteIds.has(report.reportId);

              return (
                <div
                  key={report.reportId}
                  className="border border-border rounded-lg bg-card p-4 hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => router.push(`/workspace/report-center/report-run/${report.reportId}`)}
                >
                  {/* 顶部分类 + 状态 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colorMap.bg} ${colorMap.text} ${colorMap.border} border`}>
                        {category?.categoryName || '其他'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {isFav && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>

                  {/* 报表名称 + 描述 */}
                  <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {report.reportName}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{report.reportDesc}</p>

                  {/* 统计信息 */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" />
                      {colCount}列
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {STAT_PERIOD_MAP[report.statPeriod]}报
                    </span>
                  </div>

                  {/* 运行按钮 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/workspace/report-center/report-run/${report.reportId}`); }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> 查看报表
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
