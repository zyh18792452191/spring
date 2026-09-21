// ==================== 报表分类数据 ====================
import { ReportCategory } from './types';

export const REPORT_CATEGORIES: ReportCategory[] = [
  { categoryId: 'CAT01', categoryName: '携转预警类', color: 'blue', sortOrder: 1, status: 'active' },
  { categoryId: 'CAT02', categoryName: '宽带预警类', color: 'green', sortOrder: 2, status: 'active' },
  { categoryId: 'CAT03', categoryName: '全球通预警类', color: 'orange', sortOrder: 3, status: 'active' },
  { categoryId: 'CAT04', categoryName: '投诉工单类', color: 'red', sortOrder: 4, status: 'active' },
  { categoryId: 'CAT05', categoryName: '商机类', color: 'purple', sortOrder: 5, status: 'active' },
  { categoryId: 'CAT06', categoryName: '异动类', color: 'cyan', sortOrder: 6, status: 'active' },
  { categoryId: 'CAT99', categoryName: '其他', color: 'gray', sortOrder: 99, status: 'active' },
];

/** 分类颜色映射到 Tailwind class */
export const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800' },
  green:  { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-300',  border: 'border-green-200 dark:border-green-800' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  red:    { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-300',      border: 'border-red-200 dark:border-red-800' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  cyan:   { bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-700 dark:text-cyan-300',    border: 'border-cyan-200 dark:border-cyan-800' },
  gray:   { bg: 'bg-muted',                            text: 'text-muted-foreground',               border: 'border-border' },
};

export function getCategoryById(id: string): ReportCategory | undefined {
  return REPORT_CATEGORIES.find(c => c.categoryId === id);
}
