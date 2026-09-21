// ==================== 报表运行页 - 模拟数据生成 ====================
import { ColumnConfigNode, RegionMode, RegionDimension, REGION_LEVEL_LABELS, DataFormat, getAlignForColumn } from './types';
import { CITY_LIST, DISTRICT_MAP, GRID_MAP } from './regionData';
import { getIndicatorByCode, mapDataTypeToFormat } from './indicatorData';

/** 获取列对齐的 Tailwind 类名 */
export function getAlignClass(col: ColumnConfigNode): string {
  const align = getAlignForColumn(col);
  return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}

// ==================== 区域列动态生成 ====================

/** 根据区域模式+层级配置，动态生成区域列定义 */
export function buildRegionColumns(mode: RegionMode, dimensions: RegionDimension[]): ColumnConfigNode[] {
  if (mode === 'drill') {
    // 单列下钻模式：生成1个"区域"列
    return [
      { id: 'region_drill', type: 'region', title: '区域', fixed: 'left', required: true },
    ];
  } else {
    // 多列展开模式：按维度生成多个区域列
    return dimensions.map((dim, i) => ({
      id: `region_${dim}`,
      type: 'region' as const,
      title: REGION_LEVEL_LABELS[dim],
      fixed: i === 0 ? 'left' as const : undefined,
      required: i === 0,
    }));
  }
}

/** 为指标节点注入 dataFormat（从指标库中查找） */
function enrichIndicatorFormat(nodes: ColumnConfigNode[]): ColumnConfigNode[] {
  return nodes.map(node => {
    if (node.type === 'indicator' && node.indicatorCode && !node.dataFormat) {
      const meta = getIndicatorByCode(node.indicatorCode);
      if (meta) {
        return { ...node, dataFormat: mapDataTypeToFormat(meta.dataType) };
      }
    }
    if (node.children) {
      return { ...node, children: enrichIndicatorFormat(node.children) };
    }
    return node;
  });
}

/** 构建完整列配置 = 区域列 + 指标列(注入dataFormat) + 操作列 */
export function buildFullColumnConfig(
  mode: RegionMode,
  dimensions: RegionDimension[],
  dataColumns: ColumnConfigNode[],
  hasAction: boolean = true,
): ColumnConfigNode[] {
  const regionCols = buildRegionColumns(mode, dimensions);
  const enrichedDataCols = enrichIndicatorFormat(dataColumns);
  const actionCol: ColumnConfigNode[] = hasAction
    ? [{ id: 'act1', type: 'action', title: '操作', fixed: 'right', required: true }]
    : [];
  return [...regionCols, ...enrichedDataCols, ...actionCol];
}

// Mulberry32 种子随机数(解决 SSR/CSR hydration)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** 提取叶节点列(实际数据列) */
export function getLeafColumns(nodes: ColumnConfigNode[]): ColumnConfigNode[] {
  const leaves: ColumnConfigNode[] = [];
  function walk(node: ColumnConfigNode) {
    if (node.children && node.children.length > 0) {
      node.children.forEach(walk);
    } else {
      leaves.push(node);
    }
  }
  nodes.forEach(walk);
  return leaves;
}

/** 获取指标的数据格式 */
function getIndicatorFormat(col: ColumnConfigNode): 'number' | 'percent' | 'permille' | 'text' {
  if (col.dataFormat) return col.dataFormat;
  // 兼容旧的 dataType 字段
  if ((col as unknown as Record<string, unknown>).dataType === 'percent') return 'percent';
  return 'number';
}

/** 格式化单元格显示值 */
export function formatCellValue(value: string | number | undefined, col: ColumnConfigNode): string {
  if (value === undefined || value === null || value === '') return '-';
  
  const format = getIndicatorFormat(col);
  
  if (format === 'text') return String(value);
  
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  
  const decimalPlaces = col.decimalPlaces ?? (format === 'number' ? 0 : 2);
  const useThousand = col.useThousandSeparator ?? (format === 'number');
  
  if (format === 'percent') {
    const formatted = num.toFixed(decimalPlaces);
    return useThousand ? Number(formatted).toLocaleString('zh-CN', { minimumFractionDigits: decimalPlaces }) + '%' : formatted + '%';
  }
  
  if (format === 'permille') {
    const formatted = num.toFixed(decimalPlaces);
    return formatted + '‰';
  }
  
  // number
  if (useThousand) {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
  }
  return num.toFixed(decimalPlaces);
}

/** 生成单行模拟数据 */
function generateRow(leafColumns: ColumnConfigNode[], regionName: string, regionCode: string, seed: number): Record<string, string | number> {
  const rng = mulberry32(seed);
  const row: Record<string, string | number> = {};

  for (const col of leafColumns) {
    if (col.type === 'region') {
      row[col.id] = regionName;
      row[`${col.id}_code`] = regionCode;
    } else if (col.type === 'action') {
      row[col.id] = '详情';
    } else if (col.indicatorCode) {
      const format = getIndicatorFormat(col);
      if (format === 'percent') {
        // 百分比原始值：0.00 ~ 1.00 之间
        row[col.id] = Math.round(rng() * 950 + 50) / 100; // 0.50 ~ 10.00
      } else if (format === 'permille') {
        // 千分比原始值
        row[col.id] = Math.round(rng() * 95 + 5) / 100; // 0.05 ~ 1.00
      } else {
        // 整数/数值
        row[col.id] = Math.floor(rng() * 5000 + 100);
      }
    }
  }
  return row;
}

/** 生成某层级下的汇总行 */
function generateSummaryRow(leafColumns: ColumnConfigNode[], regionName: string, regionCode: string, childRows: Record<string, string | number>[]): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  for (const col of leafColumns) {
    if (col.type === 'region') {
      row[col.id] = regionName;
      row[`${col.id}_code`] = regionCode;
    } else if (col.type === 'action') {
      row[col.id] = '详情';
    } else {
      const sum = childRows.reduce((acc, r) => {
        const v = r[col.id];
        return acc + (typeof v === 'number' ? v : 0);
      }, 0);
      row[col.id] = sum;
    }
  }
  return row;
}

export type RegionLevel = 'province' | 'city' | 'district' | 'grid';

/** 生成单列下钻模式的报表数据 */
function generateDrillModeData(
  columnConfig: ColumnConfigNode[],
  level: RegionLevel = 'city',
  parentCode?: string,
): { rows: Record<string, string | number>[]; regionColumns: ColumnConfigNode[] } {
  const leafColumns = getLeafColumns(columnConfig);
  const regionColumns = leafColumns.filter(c => c.type === 'region');

  const rows: Record<string, string | number>[] = [];

  if (level === 'province') {
    const cityRows: Record<string, string | number>[] = [];
    CITY_LIST.forEach(city => {
      const seed = hashCode(city.code + '20250612');
      const row = generateRow(leafColumns, city.name, city.code, seed);
      cityRows.push(row);
    });
    const summaryRow = generateSummaryRow(leafColumns, '全疆', '650000', cityRows);
    rows.push(summaryRow, ...cityRows);
  } else if (level === 'city') {
    const cityCode = parentCode || '650100';
    const cityName = CITY_LIST.find(c => c.code === cityCode)?.name || '乌鲁木齐';
    const districts = DISTRICT_MAP[cityCode] || [];
    const districtRows: Record<string, string | number>[] = [];
    districts.forEach(d => {
      const seed = hashCode(d.code + '20250612');
      const row = generateRow(leafColumns, d.name, d.code, seed);
      districtRows.push(row);
    });
    const summaryRow = generateSummaryRow(leafColumns, cityName, cityCode, districtRows);
    rows.push(summaryRow, ...districtRows);
  } else if (level === 'district') {
    const districtCode = parentCode || '650102';
    const grids = GRID_MAP[districtCode] || [];
    const gridRows: Record<string, string | number>[] = [];
    grids.forEach(g => {
      const seed = hashCode(g.code + '20250612');
      const row = generateRow(leafColumns, g.name, g.code, seed);
      gridRows.push(row);
    });
    const districtName = Object.values(DISTRICT_MAP).flat().find(d => d.code === districtCode)?.name || districtCode;
    const summaryRow = generateSummaryRow(leafColumns, districtName, districtCode, gridRows);
    rows.push(summaryRow, ...gridRows);
  } else if (level === 'grid') {
    const gridCode = parentCode || '6501020101';
    const seed = hashCode(gridCode + '20250612');
    const gridName = Object.values(GRID_MAP).flat().find(g => g.code === gridCode)?.name || gridCode;
    const row = generateRow(leafColumns, gridName, gridCode, seed);
    rows.push(row);
  }

  return { rows, regionColumns };
}

/** 生成多列展开模式的报表数据 */
function generateFlatModeData(
  columnConfig: ColumnConfigNode[],
  dimensions: RegionDimension[],
  targetLevel: RegionLevel = 'city',
  parentCode?: string,
): { rows: Record<string, string | number>[]; regionColumns: ColumnConfigNode[] } {
  const leafColumns = getLeafColumns(columnConfig);
  const regionColumns = leafColumns.filter(c => c.type === 'region');
  const maxDim = dimensions[dimensions.length - 1]; // 最深层级

  const rows: Record<string, string | number>[] = [];

  // 确定起始层级和目标区域
  if (targetLevel === 'province' || !parentCode) {
    // 全疆视图：遍历所有地市
    CITY_LIST.forEach(city => {
      if (maxDim === 'city') {
        // 只到地市
        const seed = hashCode(city.code + '20250612');
        const row = generateRow(leafColumns, city.name, city.code, seed);
        fillFlatRegionFields(row, regionColumns, dimensions, city.code);
        rows.push(row);
      } else if (maxDim === 'district') {
        // 到区县
        const districts = DISTRICT_MAP[city.code] || [];
        districts.forEach(d => {
          const seed = hashCode(d.code + '20250612');
          const row = generateRow(leafColumns, d.name, d.code, seed);
          fillFlatRegionFields(row, regionColumns, dimensions, city.code, d.code);
          rows.push(row);
        });
      } else if (maxDim === 'grid') {
        // 到网格
        const districts = DISTRICT_MAP[city.code] || [];
        districts.forEach(d => {
          const grids = GRID_MAP[d.code] || [];
          grids.forEach(g => {
            const seed = hashCode(g.code + '20250612');
            const row = generateRow(leafColumns, g.name, g.code, seed);
            fillFlatRegionFields(row, regionColumns, dimensions, city.code, d.code, g.code);
            rows.push(row);
          });
        });
      }
    });
  } else if (targetLevel === 'city') {
    // 某地市下
    const cityCode = parentCode;
    const cityName = CITY_LIST.find(c => c.code === cityCode)?.name || '';
    if (maxDim === 'district') {
      const districts = DISTRICT_MAP[cityCode] || [];
      districts.forEach(d => {
        const seed = hashCode(d.code + '20250612');
        const row = generateRow(leafColumns, d.name, d.code, seed);
        fillFlatRegionFields(row, regionColumns, dimensions, cityCode, d.code);
        rows.push(row);
      });
    } else if (maxDim === 'grid') {
      const districts = DISTRICT_MAP[cityCode] || [];
      districts.forEach(d => {
        const grids = GRID_MAP[d.code] || [];
        grids.forEach(g => {
          const seed = hashCode(g.code + '20250612');
          const row = generateRow(leafColumns, g.name, g.code, seed);
          fillFlatRegionFields(row, regionColumns, dimensions, cityCode, d.code, g.code);
          rows.push(row);
        });
      });
    }
  }

  return { rows, regionColumns };
}

/** 填充多列展开模式下的区域字段 */
function fillFlatRegionFields(
  row: Record<string, string | number>,
  regionColumns: ColumnConfigNode[],
  dimensions: RegionDimension[],
  cityCode?: string,
  districtCode?: string,
  gridCode?: string,
) {
  for (const col of regionColumns) {
    if (col.id === 'region_city') {
      const city = CITY_LIST.find(c => c.code === cityCode);
      row[col.id] = city?.name || '';
      row[`${col.id}_code`] = cityCode || '';
    } else if (col.id === 'region_district') {
      const district = cityCode ? (DISTRICT_MAP[cityCode] || []).find(d => d.code === districtCode) : null;
      row[col.id] = district?.name || '';
      row[`${col.id}_code`] = districtCode || '';
    } else if (col.id === 'region_grid') {
      const grid = districtCode ? (GRID_MAP[districtCode] || []).find(g => g.code === gridCode) : null;
      row[col.id] = grid?.name || '';
      row[`${col.id}_code`] = gridCode || '';
    } else if (col.id === 'region_microgrid') {
      row[col.id] = `微格${gridCode || ''}`;
      row[`${col.id}_code`] = gridCode ? `${gridCode}01` : '';
    }
  }
}

/** 生成报表运行页数据（统一入口） */
export function generateReportData(
  columnConfig: ColumnConfigNode[],
  level: RegionLevel = 'city',
  parentCode?: string,
  regionMode: RegionMode = 'drill',
  regionDimensions: RegionDimension[] = ['city'],
): { rows: Record<string, string | number>[]; regionColumns: ColumnConfigNode[] } {
  if (regionMode === 'drill') {
    return generateDrillModeData(columnConfig, level, parentCode);
  } else {
    return generateFlatModeData(columnConfig, regionDimensions, level, parentCode);
  }
}
