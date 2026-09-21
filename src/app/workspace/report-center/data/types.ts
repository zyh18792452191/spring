// ==================== 预警执行分析配置化模块 - 类型定义 ====================

// ---------- 报表分类 ----------
export interface ReportCategory {
  categoryId: string;
  categoryName: string;
  color: string;       // Tailwind 颜色 key: blue/green/orange/red/purple/cyan/gray
  sortOrder: number;
  status: 'active' | 'inactive';
}

// ---------- 指标定义 ----------
export type DataType = 'integer' | 'decimal' | 'percent';
export type TimeBucketType = 'fast_response' | 'standard_response' | 'long_cycle';
export type IndicatorStatus = 'active' | 'inactive';
export type RegionDimension = 'province' | 'city' | 'district' | 'grid' | 'microgrid';

export interface IndicatorDefinition {
  indicatorCode: string;
  indicatorName: string;
  categoryId: string;
  categoryName: string;
  caliber: string;                        // 口径说明
  applicableDimensions: RegionDimension[];
  dataType: DataType;
  dataSource: string;                     // 数据来源系统
  computeLogic: string;                   // 计算逻辑
  unit: string;                           // 单位
  timeBucketType?: TimeBucketType;        // 时效分档类型
  parentGroupId?: string;                 // 所属指标组
  isGroupHeader: boolean;                 // 是否分组表头
  applicableScenario?: string[];          // 适用场景
  status: IndicatorStatus;
}

// ---------- 指标分类树节点 ----------
export interface IndicatorCategoryNode {
  id: string;
  name: string;
  count: number;
  children?: IndicatorCategoryNode[];
}

// ---------- 区域模式配置 ----------

/** 区域展示模式：drill=单列下钻(点击区域名称整表替换), flat=多列展开(地州/区县/网格/微格并排) */
export type RegionMode = 'drill' | 'flat';

/** 区域层级选项（有序，从高到低） */
export const REGION_DIMENSION_OPTIONS: RegionDimension[] = ['province', 'city', 'district', 'grid', 'microgrid'];

/** 区域层级标签映射 */
export const REGION_LEVEL_LABELS: Record<RegionDimension, string> = {
  province: '全疆',
  city: '地州',
  district: '区县',
  grid: '网格',
  microgrid: '微格',
};

/** flat模式下可选的区域层级（从地州开始，到用户选择的最深层级） */
export const FLAT_REGION_LEVELS: RegionDimension[] = ['city', 'district', 'grid', 'microgrid'];

/** drill模式下可下钻的层级路径 */
export const DRILL_REGION_LEVELS: RegionDimension[] = ['province', 'city', 'district', 'grid'];

// ---------- 报表配置 ----------
export type ReportStatus = 'draft' | 'published' | 'disabled';
export type StatPeriod = 'day' | 'week' | 'month';
export type GenPeriodType = 'once' | 'repeat';

export interface ReportConfig {
  reportId: string;
  reportName: string;
  reportDesc: string;
  categoryId: string;
  dataStartDate: string;
  dataEndDate: string;
  statPeriod: StatPeriod;
  genPeriodType: GenPeriodType;
  regionMode: RegionMode;                // 区域展示模式
  regionDimensions: RegionDimension[];   // drill模式=可下钻层级范围, flat模式=展示哪些层级列
  columnConfig: ColumnConfigNode[];      // 不含区域列，区域列由regionMode+regionDimensions运行时动态生成
  filterConfig: FilterConfig[];          // 筛选条件配置列表
  templateId?: string;
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- 列配置节点 ----------
export type ColumnType = 'region' | 'indicator' | 'group' | 'action';

/** 数据显示格式 */
export type DataFormat = 'number' | 'percent' | 'permille' | 'text';

export interface ColumnConfigNode {
  id: string;
  type: ColumnType;
  title: string;
  indicatorCode?: string;           // type=indicator 时
  tooltip?: string;                  // 口径说明
  rowSpan?: number;                  // 叶节点自动计算
  fixed?: 'left' | 'right';         // 固定列
  required?: boolean;                // 不可删除
  highlighted?: boolean;             // 高亮标记
  children?: ColumnConfigNode[];     // type=group 时

  // --- 数据格式（type=indicator 时有效）---
  dataFormat?: DataFormat;           // 显示格式，默认'number'
  decimalPlaces?: number;            // 小数位数，默认2
  useThousandSeparator?: boolean;    // 千分位逗号，默认true（number类型）

  // --- 对齐方式（通常由dataFormat自动推断，此字段可覆盖）---
  align?: 'left' | 'center' | 'right';
}

// ---------- 报表模板 ----------
export type TemplateSource = 'system' | 'user';

export interface ReportTemplate {
  templateId: string;
  templateName: string;
  templateDesc: string;
  categoryId: string;
  source: TemplateSource;             // system=系统预置, user=用户创建
  sourceReportId?: string;                // 来源报表ID（user类型时有值）
  regionMode: RegionMode;                // 区域展示模式
  regionDimensions: RegionDimension[];   // drill模式=可下钻层级范围, flat模式=展示哪些层级列
  columnConfig: ColumnConfigNode[];      // 不含区域列，区域列由regionMode+regionDimensions运行时动态生成
  filterConfig: FilterConfig[];          // 筛选条件配置列表
  usageCount: number;                    // 被引用次数（基于此模板创建的报表数量）
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- 用户收藏 ----------
export interface UserFavorite {
  userId: string;
  reportId: string;
  createdAt: string;
}

// ---------- 用户视图 ----------
export interface UserReportView {
  viewId: string;
  userId: string;
  reportId: string;
  viewName: string;
  visibleColumns: string[];          // 可见列ID列表
  columnOrder?: string[];            // 列顺序
  filterState?: Record<string, unknown>;
  drillState?: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
}

// ---------- 用户访问记录 ----------
export interface UserReportAccess {
  id: number;
  userId: string;
  reportId: string;
  accessTime: string;
}

// ---------- 筛选条件配置 ----------
/** 筛选条件控件类型 */
export type FilterControlType = 'select' | 'multiSelect' | 'dateRange' | 'date' | 'cascader' | 'text';

/** 选项来源 */
export type FilterOptionSource = 'static' | 'system' | 'dict';

/** 筛选条件配置 */
export interface FilterConfig {
  id: string;                          // 条件标识，如 'execution_mode'
  label: string;                       // 显示名称
  type: FilterControlType;             // 控件类型
  required: boolean;                   // 是否必填
  defaultValue?: string;               // 默认值

  // 选项来源
  optionSource: FilterOptionSource;

  // static: 静态选项
  staticOptions?: Array<{ value: string; label: string }>;

  // dict: 数据字典编码（后端接口根据此编码获取选项）
  dictCode?: string;

  // cascader: 级联数据源标识
  cascaderSource?: 'region';

  // dateRange: 时间字段映射
  dateFieldStart?: string;
  dateFieldEnd?: string;

  // 级联依赖（预留）
  dependsOn?: string;

  // 排序权重（筛选栏中的排列顺序）
  order: number;
}

// ---------- 筛选条件运行时值 ----------
export interface ReportFilterValues {
  [key: string]: string | string[] | undefined;
}

// ---------- 下钻路径节点 ----------
export interface DrillPathNode {
  code: string;
  name: string;
  level: 'province' | 'city' | 'district' | 'grid';
}

// ---------- 工具函数 ----------

/** 根据 ColumnConfigNode 推断对齐方式 */
export function getAlignForColumn(col: ColumnConfigNode): 'left' | 'center' | 'right' {
  if (col.align) return col.align;
  if (col.type === 'region') return 'left';
  if (col.type === 'action') return 'center';
  if (col.type === 'indicator') {
    const fmt = col.dataFormat || 'number';
    if (fmt === 'text') return 'left';
    return 'right'; // number/percent/permille → 右对齐
  }
  return 'left';
}

/** 格式化单元格数值 */
export function formatCellValue(value: unknown, col: ColumnConfigNode): string {
  if (value === null || value === undefined || value === '') return '-';
  const fmt = col.dataFormat || 'number';
  if (fmt === 'text') return String(value);
  
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  
  const decimalPlaces = col.decimalPlaces ?? 2;
  const useThousand = col.useThousandSeparator ?? true;
  
  if (fmt === 'percent') {
    const displayVal = num * 100;
    const formatted = displayVal.toFixed(decimalPlaces);
    return useThousand ? addThousandSeparator(formatted) + '%' : formatted + '%';
  }
  
  if (fmt === 'permille') {
    const displayVal = num * 1000;
    const formatted = displayVal.toFixed(decimalPlaces);
    return useThousand ? addThousandSeparator(formatted) + '‰' : formatted + '‰';
  }
  
  // number
  const formatted = num.toFixed(decimalPlaces);
  return useThousand ? addThousandSeparator(formatted) : formatted;
}

function addThousandSeparator(numStr: string): string {
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
