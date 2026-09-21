'use client';

import { ReportConfig } from '../data/types';
import { getCategoryById, CATEGORY_COLOR_MAP } from '../data/categoryData';
import { REPORT_STATUS_MAP, STAT_PERIOD_MAP, isFavorite, MOCK_ACCESS_TIMES, countLeafColumns } from '../data/mockReportData';
import { Star, StarOff, Clock, BarChart3, MoreHorizontal, Eye, Pencil, Copy, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

interface ReportCardProps {
  report: ReportConfig;
  onFavorite: (reportId: string) => void;
  onView: (reportId: string) => void;
  onEdit: (reportId: string) => void;
  onDuplicate: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  onSaveAsTemplate?: (report: ReportConfig) => void;
}

export default function ReportCard({ report, onFavorite, onView, onEdit, onDuplicate, onDelete, onSaveAsTemplate }: ReportCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const category = getCategoryById(report.categoryId);
  const colorMap = category ? CATEGORY_COLOR_MAP[category.color] : CATEGORY_COLOR_MAP.gray;
  const statusInfo = REPORT_STATUS_MAP[report.status];
  const fav = isFavorite(report.reportId);
  const accessTime = MOCK_ACCESS_TIMES[report.reportId] || '-';
  const colCount = countLeafColumns(report.columnConfig);

  return (
    <div className="relative border border-border rounded-lg bg-card p-4 hover:shadow-md transition-shadow group">
      {/* 顶部分类标签 + 状态 + 收藏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colorMap.bg} ${colorMap.text} ${colorMap.border} border`}>
            {category?.categoryName || '其他'}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(report.reportId); }}
          className="p-1 hover:bg-muted rounded transition-colors"
          title={fav ? '取消收藏' : '收藏'}
        >
          {fav ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>

      {/* 报表名称 + 描述 */}
      <h3
        className="text-sm font-medium text-foreground mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
        onClick={() => onView(report.reportId)}
      >
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
        <span>{report.genPeriodType === 'repeat' ? '周期生成' : '单次生成'}</span>
        <span>{report.regionMode === 'drill' ? '单列下钻' : '多列展开'}</span>
      </div>

      {/* 底部信息 + 操作 */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <span>创建: {report.createdBy}</span>
          <span className="mx-2">|</span>
          <span>最近访问: {accessTime}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 bottom-8 z-10 w-32 bg-popover border border-border rounded-md shadow-lg py-1">
              <button
                onClick={(e) => { e.stopPropagation(); onView(report.reportId); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> 查看
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(report.reportId); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> 编辑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(report.reportId); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> 复制
              </button>
              {onSaveAsTemplate && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSaveAsTemplate(report); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> 另存为模板
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(report.reportId); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
