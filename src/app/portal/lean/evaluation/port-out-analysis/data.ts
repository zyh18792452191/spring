// 携转预警情况分析报表 - 数据定义与模拟数据

// ==================== 类型定义 ====================

/** 列定义（树形结构，支持1~3层表头） */
export interface ColumnDef {
  id?: string;           // 叶节点列的唯一key（有children的不需要）
  title: string;         // 显示名称
  children?: ColumnDef[]; // 子列
  tooltip?: string;      // 带标记的列的提示说明
  width?: number;        // 建议列宽(px)
}

/** 数据记录 */
export interface PortOutRecord {
  regionCode: string;
  regionName: string;
  parentCode: string;
  regionLevel: 'province' | 'city' | 'district' | 'grid';
  [key: string]: string | number;
}

/** 面包屑路径节点 */
export interface BreadcrumbNode {
  code: string;
  name: string;
  level: 'province' | 'city' | 'district' | 'grid';
}

// ==================== 完整列定义（70列 = 1地州 + 6基础 + 19在线 + 12网格经理 + 11(10088) + 8政企 + 11装维 + 1携出 + 1操作） ====================

export const ALL_COLUMNS: ColumnDef[] = [
  // ===== 第一部分：基础指标（7列，仅一级表头，rowSpan=3） =====
  { id: 'regionName', title: '地州', width: 100 },
  { id: 'warningTriggerCount', title: '预警触发数', tooltip: '触发携转预警的客户总数' },
  { id: 'executionCompleteCount', title: '执行完成数', tooltip: '工单执行完成数（含成功+拒绝）' },
  { id: 'executionSuccessCount', title: '执行成功数', tooltip: '维系成功的客户数' },
  { id: 'executingCount', title: '执行中', tooltip: '正在执行中的工单数' },
  { id: 'notExecutedCount', title: '未执行', tooltip: '未开始执行的工单数' },
  { id: 'preRetainedPortOutCount', title: '维系前已携转客户数', tooltip: '工单下发前客户已办理携转的记录数' },

  // ===== 第二部分：在线执行情况（19列） =====
  {
    title: '在线执行情况',
    children: [
      {
        title: '在线执行统计',
        children: [
          { id: 'onlineOrderCount', title: '工单数', tooltip: '通过在线渠道下发的预警工单总数' },
          { id: 'onlineNotExecutedCount', title: '未执行数', tooltip: '已下发但尚未开始执行的工单数' },
          { id: 'onlineExecutingCount', title: '执行中数', tooltip: '正在执行中的在线渠道工单数' },
          { id: 'onlineCompleteCount', title: '执行完成数', tooltip: '已反馈执行结果的在线渠道工单数（含成功+拒绝+未接通）' },
          { id: 'onlineSuccessCount', title: '执行成功数', tooltip: '在线渠道维系成功（客户接受方案且未携转）的工单数' },
          { id: 'onlineRejectCount', title: '拒绝数', tooltip: '在线渠道客户明确拒绝维系方案的工单数' },
        ],
      },
      {
        title: '外显10086执行情况',
        children: [
          { id: 'outward10086SuccessCount', title: '执行成功数', tooltip: '外显10086渠道执行成功的工单数。口径：通过10086外呼触达客户且客户接受维系方案（含套餐变更、优惠挽留、承诺在网等）的工单数' },
          { id: 'outward10086NotConnectedCount', title: '未接通', tooltip: '外显10086渠道拨打未接通的工单数。口径：10086外呼后客户未接听（含振铃未接、关机、停机、占线等）的工单数' },
          { id: 'outward10086RejectCount', title: '拒绝数', tooltip: '外显10086渠道客户拒绝维系的工单数。口径：10086外呼触达客户后，客户明确拒绝维系方案的工单数' },
        ],
      },
      {
        title: '特定专席渠道执行情况',
        children: [
          { id: 'specialSeatSuccessCount', title: '执行成功数', tooltip: '特定专席渠道执行成功的工单数。口径：通过特定专席（如携转专席、VIP专席）外呼触达客户且客户接受维系方案的工单数' },
          { id: 'specialSeatNotConnectedCount', title: '未接通', tooltip: '特定专席渠道拨打未接通的工单数。口径：特定专席外呼后客户未接听（含振铃未接、关机、停机、占线等）的工单数' },
          { id: 'specialSeatRejectCount', title: '拒绝数', tooltip: '特定专席渠道客户拒绝维系的工单数。口径：特定专席外呼触达客户后，客户明确拒绝维系方案的工单数' },
        ],
      },
      { id: 'duplicateOrderCount', title: '重复工单数', tooltip: '在线返回重复工单与在线登记数量之和。口径：同一预警客户在统计周期内被在线渠道返回（因重复下发、已在处理中等原因退回）的工单数 + 在线渠道登记的重复工单数量' },
      {
        title: '在线预警工单执行时效统计',
        children: [
          { id: 'onlineTimeLe30min', title: '≤30分钟', tooltip: '从工单下发起至首次触达客户，间隔≤30分钟的工单数' },
          { id: 'onlineTime30to60min', title: '30分钟-60分钟', tooltip: '从工单下发起至首次触达客户，间隔30~60分钟的工单数' },
          { id: 'onlineTime60to120min', title: '60分钟-120分钟', tooltip: '从工单下发起至首次触达客户，间隔60~120分钟的工单数' },
          { id: 'onlineTime2to12h', title: '2小时-12小时', tooltip: '从工单下发起至首次触达客户，间隔2~12小时的工单数' },
          { id: 'onlineTime12to24h', title: '12小时-24小时', tooltip: '从工单下发起至首次触达客户，间隔12~24小时的工单数' },
          { id: 'onlineTimeGt24h', title: '24小时以上', tooltip: '从工单下发起至首次触达客户，间隔超过24小时的工单数' },
        ],
      },
    ],
  },

  // ===== 第三部分：网格经理执行情况（12列） =====
  {
    title: '网格经理执行情况',
    children: [
      {
        title: '网格经理执行统计',
        children: [
          { id: 'gridManagerOrderCount', title: '工单数', tooltip: '分配给网格经理的预警工单总数' },
          { id: 'gridManagerNotExecutedCount', title: '未执行数', tooltip: '网格经理已接收但尚未执行的工单数' },
          { id: 'gridManagerExecutingCount', title: '执行中数', tooltip: '网格经理正在执行的工单数' },
          { id: 'gridManagerCompleteCount', title: '执行完成数', tooltip: '网格经理已反馈结果的工单数（含成功+拒绝+转派）' },
          { id: 'gridManagerSuccessCount', title: '执行成功数', tooltip: '网格经理维系成功的工单数' },
          { id: 'gridManagerTransferCount', title: '转派数', tooltip: '网格经理转派给其他人员处理的工单数' },
          { id: 'gridManagerRejectCount', title: '拒绝数', tooltip: '网格经理客户拒绝维系的工单数' },
        ],
      },
      {
        title: '网格经理预警工单执行时效统计',
        children: [
          { id: 'gridManagerTimeLe2h', title: '≤2小时', tooltip: '从工单分配起至网格经理首次触达客户，间隔≤2小时的工单数' },
          { id: 'gridManagerTime2to6h', title: '2-6小时内', tooltip: '从工单分配起至网格经理首次触达客户，间隔2~6小时的工单数' },
          { id: 'gridManagerTime6to24h', title: '6-24小时内', tooltip: '从工单分配起至网格经理首次触达客户，间隔6~24小时的工单数' },
          { id: 'gridManagerTime24to48h', title: '24-48小时内', tooltip: '从工单分配起至网格经理首次触达客户，间隔24~48小时的工单数' },
          { id: 'gridManagerTimeGt48h', title: '>48小时', tooltip: '从工单分配起至网格经理首次触达客户，间隔超过48小时的工单数' },
        ],
      },
    ],
  },

  // ===== 第四部分：10088执行情况（11列） =====
  {
    title: '10088执行情况',
    children: [
      {
        title: '10088执行统计',
        children: [
          { id: 'tel10088OrderCount', title: '工单数', tooltip: '分配给10088客服的预警工单总数' },
          { id: 'tel10088NotExecutedCount', title: '未执行数', tooltip: '10088已接收但尚未执行的工单数' },
          { id: 'tel10088ExecutingCount', title: '执行中数', tooltip: '10088正在执行的工单数' },
          { id: 'tel10088CompleteCount', title: '执行完成数', tooltip: '10088已反馈结果的工单数（含成功+拒绝+未接通）' },
          { id: 'tel10088SuccessCount', title: '执行成功数', tooltip: '10088渠道维系成功的工单数' },
          { id: 'tel10088RejectCount', title: '拒绝数', tooltip: '10088渠道客户拒绝维系的工单数' },
        ],
      },
      {
        title: '10088预警工单执行时效统计',
        children: [
          { id: 'tel10088TimeLe2h', title: '≤2小时', tooltip: '从工单分配起至10088首次触达客户，间隔≤2小时的工单数' },
          { id: 'tel10088Time2to6h', title: '2-6小时内', tooltip: '从工单分配起至10088首次触达客户，间隔2~6小时的工单数' },
          { id: 'tel10088Time6to24h', title: '6-24小时内', tooltip: '从工单分配起至10088首次触达客户，间隔6~24小时的工单数' },
          { id: 'tel10088Time24to48h', title: '24-48小时内', tooltip: '从工单分配起至10088首次触达客户，间隔24~48小时的工单数' },
          { id: 'tel10088TimeGt48h', title: '>48小时', tooltip: '从工单分配起至10088首次触达客户，间隔超过48小时的工单数' },
        ],
      },
    ],
  },

  // ===== 第五部分：政企客户经理执行情况（8列） =====
  {
    title: '政企客户经理执行情况',
    children: [
      {
        title: '政企客户经理执行统计',
        children: [
          { id: 'enterpriseManagerOrderCount', title: '工单数', tooltip: '分配给政企客户经理的预警工单总数' },
          { id: 'enterpriseManagerNoFeedbackCount', title: '未反馈数', tooltip: '政企客户经理已接收但尚未反馈的工单数' },
          { id: 'enterpriseManagerFeedbackCount', title: '反馈数', tooltip: '政企客户经理已反馈执行结果的工单数' },
        ],
      },
      {
        title: '政企客户经理预警工单执行时效统计',
        children: [
          { id: 'enterpriseManagerTimeLe2h', title: '≤2小时', tooltip: '从工单分配起至政企客户经理首次触达客户，间隔≤2小时的工单数' },
          { id: 'enterpriseManagerTime2to6h', title: '2-6小时内', tooltip: '从工单分配起至政企客户经理首次触达客户，间隔2~6小时的工单数' },
          { id: 'enterpriseManagerTime6to24h', title: '6-24小时内', tooltip: '从工单分配起至政企客户经理首次触达客户，间隔6~24小时的工单数' },
          { id: 'enterpriseManagerTime24to48h', title: '24-48小时内', tooltip: '从工单分配起至政企客户经理首次触达客户，间隔24~48小时的工单数' },
          { id: 'enterpriseManagerTimeGt48h', title: '>48小时', tooltip: '从工单分配起至政企客户经理首次触达客户，间隔超过48小时的工单数' },
        ],
      },
    ],
  },

  // ===== 第六部分：装维人员执行情况（11列） =====
  {
    title: '装维人员执行情况',
    children: [
      {
        title: '装维人员执行统计',
        children: [
          { id: 'installerOrderCount', title: '工单数', tooltip: '分配给装维人员的预警工单总数' },
          { id: 'installerNotExecutedCount', title: '未执行数', tooltip: '装维人员已接收但尚未执行的工单数' },
          { id: 'installerExecutingCount', title: '执行中数', tooltip: '装维人员正在执行的工单数' },
          { id: 'installerCompleteCount', title: '执行完成数', tooltip: '装维人员已反馈结果的工单数（含成功+拒绝）' },
          { id: 'installerSuccessCount', title: '执行成功数', tooltip: '装维人员维系成功的工单数' },
          { id: 'installerRejectCount', title: '拒绝数', tooltip: '装维人员客户拒绝维系的工单数' },
        ],
      },
      {
        title: '装维人员预警工单执行时效统计',
        children: [
          { id: 'installerTimeLe2h', title: '≤2小时', tooltip: '从工单分配起至装维人员首次触达客户，间隔≤2小时的工单数' },
          { id: 'installerTime2to6h', title: '2-6小时内', tooltip: '从工单分配起至装维人员首次触达客户，间隔2~6小时的工单数' },
          { id: 'installerTime6to24h', title: '6-24小时内', tooltip: '从工单分配起至装维人员首次触达客户，间隔6~24小时的工单数' },
          { id: 'installerTime24to48h', title: '24-48小时内', tooltip: '从工单分配起至装维人员首次触达客户，间隔24~48小时的工单数' },
          { id: 'installerTimeGt48h', title: '>48小时', tooltip: '从工单分配起至装维人员首次触达客户，间隔超过48小时的工单数' },
        ],
      },
    ],
  },

  // ===== 第七部分：携出客户数（1列，仅一级表头） =====
  { id: 'portOutCustomerCount', title: '携出客户数', tooltip: '统计期内已完成携号转网转出的客户数' },

  // ===== 第八部分：操作（1列，仅一级表头） =====
  { id: '_action', title: '操作', width: 140 },
];

// ==================== 工具函数 ====================

/** 获取叶节点列列表 */
export function getLeafColumns(columns: ColumnDef[]): ColumnDef[] {
  const leaves: ColumnDef[] = [];
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      leaves.push(...getLeafColumns(col.children));
    } else {
      leaves.push(col);
    }
  }
  return leaves;
}

/** 获取树的最大深度 */
export function getMaxDepth(columns: ColumnDef[]): number {
  let max = 1;
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      max = Math.max(max, 1 + getMaxDepth(col.children));
    }
  }
  return max;
}

/** 获取列的叶节点数（colSpan） */
export function getLeafCount(col: ColumnDef): number {
  if (!col.children || col.children.length === 0) return 1;
  return col.children.reduce((sum: number, child) => sum + getLeafCount(child), 0);
}

/** 构建表头行数据（每行是 ColumnDef[]，已计算 colSpan/rowSpan） */
export interface HeaderCell {
  title: string;
  colSpan: number;
  rowSpan: number;
  tooltip?: string;
  id?: string;
}

export function buildHeaderRows(columns: ColumnDef[], maxDepth: number): HeaderCell[][] {
  const rows: HeaderCell[][] = [];
  for (let i = 0; i < maxDepth; i++) {
    rows.push([]);
  }

  function walk(cols: ColumnDef[], level: number) {
    for (const col of cols) {
      if (col.children && col.children.length > 0) {
        rows[level].push({
          title: col.title,
          colSpan: getLeafCount(col),
          rowSpan: 1,
          tooltip: col.tooltip,
          id: col.id,
        });
        walk(col.children, level + 1);
      } else {
        rows[level].push({
          title: col.title,
          colSpan: 1,
          rowSpan: maxDepth - level,
          tooltip: col.tooltip,
          id: col.id,
        });
      }
    }
  }

  walk(columns, 0);
  return rows;
}

// ==================== 新疆区域数据 ====================

export interface RegionInfo {
  code: string;
  name: string;
  parentCode: string;
  level: 'province' | 'city' | 'district' | 'grid';
}

export const PROVINCE_ROW: RegionInfo = { code: '650000', name: '全疆', parentCode: '', level: 'province' };

export const CITY_LIST: RegionInfo[] = [
  { code: '650100', name: '乌鲁木齐', parentCode: '650000', level: 'city' },
  { code: '650200', name: '克拉玛依', parentCode: '650000', level: 'city' },
  { code: '650400', name: '吐鲁番', parentCode: '650000', level: 'city' },
  { code: '650500', name: '哈密', parentCode: '650000', level: 'city' },
  { code: '652300', name: '昌吉', parentCode: '650000', level: 'city' },
  { code: '652700', name: '博州', parentCode: '650000', level: 'city' },
  { code: '652800', name: '巴州', parentCode: '650000', level: 'city' },
  { code: '652900', name: '阿克苏', parentCode: '650000', level: 'city' },
  { code: '653000', name: '克州', parentCode: '650000', level: 'city' },
  { code: '653100', name: '喀什', parentCode: '650000', level: 'city' },
  { code: '653200', name: '和田', parentCode: '650000', level: 'city' },
  { code: '654000', name: '伊犁', parentCode: '650000', level: 'city' },
  { code: '654200', name: '塔城', parentCode: '650000', level: 'city' },
  { code: '654300', name: '阿勒泰', parentCode: '650000', level: 'city' },
  { code: '654001', name: '奎屯', parentCode: '650000', level: 'city' },
  { code: '659001', name: '石河子', parentCode: '650000', level: 'city' },
];

// 区县数据（每个地市2-5个区县）
export const DISTRICT_MAP: Record<string, RegionInfo[]> = {
  '650100': [
    { code: '650102', name: '天山区', parentCode: '650100', level: 'district' },
    { code: '650103', name: '沙依巴克区', parentCode: '650100', level: 'district' },
    { code: '650104', name: '新市区', parentCode: '650100', level: 'district' },
    { code: '650105', name: '水磨沟区', parentCode: '650100', level: 'district' },
    { code: '650106', name: '头屯河区', parentCode: '650100', level: 'district' },
  ],
  '650200': [
    { code: '650202', name: '独山子区', parentCode: '650200', level: 'district' },
    { code: '650203', name: '克拉玛依区', parentCode: '650200', level: 'district' },
    { code: '650204', name: '白碱滩区', parentCode: '650200', level: 'district' },
  ],
  '650400': [
    { code: '650402', name: '高昌区', parentCode: '650400', level: 'district' },
    { code: '650421', name: '鄯善县', parentCode: '650400', level: 'district' },
  ],
  '650500': [
    { code: '650502', name: '伊州区', parentCode: '650500', level: 'district' },
    { code: '650521', name: '巴里坤县', parentCode: '650500', level: 'district' },
  ],
  '652300': [
    { code: '652301', name: '昌吉市', parentCode: '652300', level: 'district' },
    { code: '652302', name: '阜康市', parentCode: '652300', level: 'district' },
    { code: '652323', name: '呼图壁县', parentCode: '652300', level: 'district' },
  ],
  '652700': [
    { code: '652701', name: '博乐市', parentCode: '652700', level: 'district' },
    { code: '652702', name: '阿拉山口市', parentCode: '652700', level: 'district' },
  ],
  '652800': [
    { code: '652801', name: '库尔勒市', parentCode: '652800', level: 'district' },
    { code: '652822', name: '轮台县', parentCode: '652800', level: 'district' },
    { code: '652823', name: '尉犁县', parentCode: '652800', level: 'district' },
  ],
  '652900': [
    { code: '652901', name: '阿克苏市', parentCode: '652900', level: 'district' },
    { code: '652902', name: '库车市', parentCode: '652900', level: 'district' },
    { code: '652922', name: '温宿县', parentCode: '652900', level: 'district' },
  ],
  '653000': [
    { code: '653001', name: '阿图什市', parentCode: '653000', level: 'district' },
    { code: '653022', name: '阿克陶县', parentCode: '653000', level: 'district' },
  ],
  '653100': [
    { code: '653101', name: '喀什市', parentCode: '653100', level: 'district' },
    { code: '653121', name: '疏附县', parentCode: '653100', level: 'district' },
    { code: '653122', name: '疏勒县', parentCode: '653100', level: 'district' },
  ],
  '653200': [
    { code: '653201', name: '和田市', parentCode: '653200', level: 'district' },
    { code: '653221', name: '和田县', parentCode: '653200', level: 'district' },
  ],
  '654000': [
    { code: '654002', name: '伊宁市', parentCode: '654000', level: 'district' },
    { code: '654003', name: '奎屯市', parentCode: '654000', level: 'district' },
    { code: '654004', name: '霍尔果斯市', parentCode: '654000', level: 'district' },
  ],
  '654200': [
    { code: '654201', name: '塔城市', parentCode: '654200', level: 'district' },
    { code: '654202', name: '乌苏市', parentCode: '654200', level: 'district' },
  ],
  '654300': [
    { code: '654301', name: '阿勒泰市', parentCode: '654300', level: 'district' },
    { code: '654321', name: '布尔津县', parentCode: '654300', level: 'district' },
  ],
  '654001': [
    { code: '65400101', name: '奎屯市区', parentCode: '654001', level: 'district' },
  ],
  '659001': [
    { code: '65900101', name: '石河子市区', parentCode: '659001', level: 'district' },
  ],
};

// 网格数据（每个区县2-3个网格）
export const GRID_MAP: Record<string, RegionInfo[]> = Object.fromEntries(
  Object.entries(DISTRICT_MAP).flatMap(([_cityCode, districts]) =>
    districts.map((d) => [
      d.code,
      [
        { code: `${d.code}01`, name: `${d.name}网格1`, parentCode: d.code, level: 'grid' as const },
        { code: `${d.code}02`, name: `${d.name}网格2`, parentCode: d.code, level: 'grid' as const },
        { code: `${d.code}03`, name: `${d.name}网格3`, parentCode: d.code, level: 'grid' as const },
      ],
    ])
  )
);

// ==================== 确定性伪随机数生成器（避免 SSR Hydration 不匹配） ====================

/** 种子随机数生成器（Mulberry32），每次调用 createSeededRandom 都从指定种子开始 */
function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 基于 rng 的整数工具 */
function rngInt(rng: () => number, max: number): number {
  return Math.floor(rng() * max);
}

function rngRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min)) + min;
}

// ==================== 模拟数据生成 ====================

/** 叶节点列ID列表（排除 regionName 和 _action） */
const LEAF_IDS = getLeafColumns(ALL_COLUMNS)
  .map((c) => c.id)
  .filter((id): id is string => !!id && id !== 'regionName' && id !== '_action');

/** 为单个区域生成模拟数据行（使用传入的 rng 保证序列一致） */
function generateRow(region: RegionInfo, rng: () => number): PortOutRecord {
  const row: PortOutRecord = {
    regionCode: region.code,
    regionName: region.name,
    parentCode: region.parentCode,
    regionLevel: region.level,
  };

  // 基础指标
  const warningTrigger = rngRange(rng, 10, 210);
  const executionComplete = Math.floor(warningTrigger * (0.3 + rng() * 0.5));
  const executionSuccess = Math.floor(executionComplete * (0.5 + rng() * 0.4));
  const executing = rngInt(rng, Math.max(1, warningTrigger - executionComplete));
  const notExecuted = Math.max(0, warningTrigger - executionComplete - executing);

  row.warningTriggerCount = warningTrigger;
  row.executionCompleteCount = executionComplete;
  row.executionSuccessCount = executionSuccess;
  row.executingCount = executing;
  row.notExecutedCount = notExecuted;
  row.preRetainedPortOutCount = rngInt(rng, 5);

  // 在线执行统计
  const onlineTotal = Math.floor(warningTrigger * (0.4 + rng() * 0.3));
  const onlineComplete = Math.floor(onlineTotal * (0.3 + rng() * 0.4));
  const onlineSuccess = Math.floor(onlineComplete * (0.5 + rng() * 0.4));
  const onlineExecuting = rngInt(rng, Math.max(1, onlineTotal - onlineComplete));
  const onlineNotExecuted = Math.max(0, onlineTotal - onlineComplete - onlineExecuting);

  row.onlineOrderCount = onlineTotal;
  row.onlineNotExecutedCount = onlineNotExecuted;
  row.onlineExecutingCount = onlineExecuting;
  row.onlineCompleteCount = onlineComplete;
  row.onlineSuccessCount = onlineSuccess;
  row.onlineRejectCount = onlineComplete - onlineSuccess;

  // 外显10086
  const outward10086Success = Math.floor(onlineSuccess * (0.3 + rng() * 0.3));
  const outward10086NotConnected = rngInt(rng, 10);
  const outward10086Reject = rngInt(rng, 8);
  row.outward10086SuccessCount = outward10086Success;
  row.outward10086NotConnectedCount = outward10086NotConnected;
  row.outward10086RejectCount = outward10086Reject;

  // 特定专席渠道
  const specialSeatSuccess = onlineSuccess - outward10086Success;
  const specialSeatNotConnected = rngInt(rng, 5);
  const specialSeatReject = rngInt(rng, 3);
  row.specialSeatSuccessCount = Math.max(0, specialSeatSuccess);
  row.specialSeatNotConnectedCount = specialSeatNotConnected;
  row.specialSeatRejectCount = specialSeatReject;

  // 重复工单
  row.duplicateOrderCount = rngInt(rng, 5);

  // 在线执行时效
  const onlineTimeTotal = onlineComplete;
  row.onlineTimeLe30min = Math.floor(onlineTimeTotal * 0.2);
  row.onlineTime30to60min = Math.floor(onlineTimeTotal * 0.15);
  row.onlineTime60to120min = Math.floor(onlineTimeTotal * 0.2);
  row.onlineTime2to12h = Math.floor(onlineTimeTotal * 0.2);
  row.onlineTime12to24h = Math.floor(onlineTimeTotal * 0.15);
  row.onlineTimeGt24h = Math.max(0, onlineTimeTotal - (row.onlineTimeLe30min as number) - (row.onlineTime30to60min as number) - (row.onlineTime60to120min as number) - (row.onlineTime2to12h as number) - (row.onlineTime12to24h as number));

  // 网格经理执行统计
  const gmTotal = Math.floor(warningTrigger * (0.2 + rng() * 0.2));
  const gmComplete = Math.floor(gmTotal * (0.3 + rng() * 0.4));
  const gmSuccess = Math.floor(gmComplete * (0.5 + rng() * 0.4));
  const gmExecuting = rngInt(rng, Math.max(1, gmTotal - gmComplete));
  const gmNotExecuted = Math.max(0, gmTotal - gmComplete - gmExecuting);

  row.gridManagerOrderCount = gmTotal;
  row.gridManagerNotExecutedCount = gmNotExecuted;
  row.gridManagerExecutingCount = gmExecuting;
  row.gridManagerCompleteCount = gmComplete;
  row.gridManagerSuccessCount = gmSuccess;
  row.gridManagerTransferCount = rngInt(rng, 5);
  row.gridManagerRejectCount = gmComplete - gmSuccess;

  // 网格经理时效
  const gmTimeTotal = gmComplete;
  row.gridManagerTimeLe2h = Math.floor(gmTimeTotal * 0.3);
  row.gridManagerTime2to6h = Math.floor(gmTimeTotal * 0.25);
  row.gridManagerTime6to24h = Math.floor(gmTimeTotal * 0.2);
  row.gridManagerTime24to48h = Math.floor(gmTimeTotal * 0.15);
  row.gridManagerTimeGt48h = Math.max(0, gmTimeTotal - (row.gridManagerTimeLe2h as number) - (row.gridManagerTime2to6h as number) - (row.gridManagerTime6to24h as number) - (row.gridManagerTime24to48h as number));

  // 10088执行统计
  const t10088Total = Math.floor(warningTrigger * (0.1 + rng() * 0.15));
  const t10088Complete = Math.floor(t10088Total * (0.3 + rng() * 0.4));
  const t10088Success = Math.floor(t10088Complete * (0.5 + rng() * 0.4));
  const t10088Executing = rngInt(rng, Math.max(1, t10088Total - t10088Complete));
  const t10088NotExecuted = Math.max(0, t10088Total - t10088Complete - t10088Executing);

  row.tel10088OrderCount = t10088Total;
  row.tel10088NotExecutedCount = t10088NotExecuted;
  row.tel10088ExecutingCount = t10088Executing;
  row.tel10088CompleteCount = t10088Complete;
  row.tel10088SuccessCount = t10088Success;
  row.tel10088RejectCount = t10088Complete - t10088Success;

  // 10088时效
  const t10088TimeTotal = t10088Complete;
  row.tel10088TimeLe2h = Math.floor(t10088TimeTotal * 0.3);
  row.tel10088Time2to6h = Math.floor(t10088TimeTotal * 0.25);
  row.tel10088Time6to24h = Math.floor(t10088TimeTotal * 0.2);
  row.tel10088Time24to48h = Math.floor(t10088TimeTotal * 0.15);
  row.tel10088TimeGt48h = Math.max(0, t10088TimeTotal - (row.tel10088TimeLe2h as number) - (row.tel10088Time2to6h as number) - (row.tel10088Time6to24h as number) - (row.tel10088Time24to48h as number));

  // 政企客户经理执行统计
  const emTotal = Math.floor(warningTrigger * (0.05 + rng() * 0.1));
  const emFeedback = Math.floor(emTotal * (0.5 + rng() * 0.3));

  row.enterpriseManagerOrderCount = emTotal;
  row.enterpriseManagerNoFeedbackCount = emTotal - emFeedback;
  row.enterpriseManagerFeedbackCount = emFeedback;

  // 政企客户经理时效
  const emTimeTotal = emFeedback;
  row.enterpriseManagerTimeLe2h = Math.floor(emTimeTotal * 0.3);
  row.enterpriseManagerTime2to6h = Math.floor(emTimeTotal * 0.25);
  row.enterpriseManagerTime6to24h = Math.floor(emTimeTotal * 0.2);
  row.enterpriseManagerTime24to48h = Math.floor(emTimeTotal * 0.15);
  row.enterpriseManagerTimeGt48h = Math.max(0, emTimeTotal - (row.enterpriseManagerTimeLe2h as number) - (row.enterpriseManagerTime2to6h as number) - (row.enterpriseManagerTime6to24h as number) - (row.enterpriseManagerTime24to48h as number));

  // 装维人员执行统计
  const instTotal = Math.floor(warningTrigger * (0.1 + rng() * 0.15));
  const instComplete = Math.floor(instTotal * (0.3 + rng() * 0.4));
  const instSuccess = Math.floor(instComplete * (0.5 + rng() * 0.4));
  const instExecuting = rngInt(rng, Math.max(1, instTotal - instComplete));
  const instNotExecuted = Math.max(0, instTotal - instComplete - instExecuting);

  row.installerOrderCount = instTotal;
  row.installerNotExecutedCount = instNotExecuted;
  row.installerExecutingCount = instExecuting;
  row.installerCompleteCount = instComplete;
  row.installerSuccessCount = instSuccess;
  row.installerRejectCount = instComplete - instSuccess;

  // 装维人员时效
  const instTimeTotal = instComplete;
  row.installerTimeLe2h = Math.floor(instTimeTotal * 0.3);
  row.installerTime2to6h = Math.floor(instTimeTotal * 0.25);
  row.installerTime6to24h = Math.floor(instTimeTotal * 0.2);
  row.installerTime24to48h = Math.floor(instTimeTotal * 0.15);
  row.installerTimeGt48h = Math.max(0, instTimeTotal - (row.installerTimeLe2h as number) - (row.installerTime2to6h as number) - (row.installerTime6to24h as number) - (row.installerTime24to48h as number));

  // 携出客户数
  row.portOutCustomerCount = rngInt(rng, 10);

  return row;
}

/** 汇总子行数据到父行 */
function sumRows(parent: PortOutRecord, children: PortOutRecord[]): PortOutRecord {
  const result: PortOutRecord = {
    regionCode: parent.regionCode,
    regionName: parent.regionName,
    parentCode: parent.parentCode,
    regionLevel: parent.regionLevel,
  };

  for (const id of LEAF_IDS) {
    result[id] = children.reduce((sum: number, child) => sum + (Number(child[id]) || 0), 0);
  }
  return result;
}

/** 生成全部模拟数据（每次调用从固定种子开始，确保 SSR/CSR 一致） */
export function generateAllMockData(): {
  cityRows: PortOutRecord[];
  districtRows: PortOutRecord[];
  gridRows: PortOutRecord[];
} {
  // 每次调用都从 seed=42 开始，避免服务端多次请求共享可变状态
  const rng = createSeededRandom(42);

  // 生成地市级数据
  const cityDataRows = CITY_LIST.map((city) => generateRow(city, rng));
  const provinceRow = sumRows(
    { regionCode: '650000', regionName: '全疆', parentCode: '', regionLevel: 'province' },
    cityDataRows
  );

  // 生成区县级数据
  const districtDataRows = Object.values(DISTRICT_MAP)
    .flat()
    .map((d) => generateRow(d, rng));

  // 生成网格级数据
  const gridDataRows = Object.values(GRID_MAP)
    .flat()
    .map((g) => generateRow(g, rng));

  return {
    cityRows: [provinceRow, ...cityDataRows],
    districtRows: districtDataRows,
    gridRows: gridDataRows,
  };
}

/** 获取某个区域下钻的子行数据 */
export function getChildRows(
  parentCode: string,
  level: 'city' | 'district',
  districtRows: PortOutRecord[],
  gridRows: PortOutRecord[]
): PortOutRecord[] {
  if (level === 'city') {
    // 下钻到区县
    return districtRows.filter((r) => r.parentCode === parentCode);
  }
  if (level === 'district') {
    // 下钻到网格
    return gridRows.filter((r) => r.parentCode === parentCode);
  }
  return [];
}

/** 获取某个父区域自身的汇总行 */
export function getParentSummaryRow(
  regionCode: string,
  cityRows: PortOutRecord[],
  districtRows: PortOutRecord[],
  gridRows: PortOutRecord[]
): PortOutRecord | undefined {
  const inCity = cityRows.find((r) => r.regionCode === regionCode);
  if (inCity) return inCity;
  const inDistrict = districtRows.find((r) => r.regionCode === regionCode);
  if (inDistrict) return inDistrict;
  const inGrid = gridRows.find((r) => r.regionCode === regionCode);
  return inGrid;
}

// ==================== 兼容旧导出 ====================

export type SummaryRow = PortOutRecord;
export type DistrictRow = PortOutRecord;

export const XINJIANG_CITIES = CITY_LIST.map((c) => ({ code: c.code, name: c.name }));

export const TABLE1_COLUMNS = ALL_COLUMNS;
export const TABLE2_COLUMNS = ALL_COLUMNS;
export const TABLE3_COLUMNS = ALL_COLUMNS;
export const TABLE4_COLUMNS = ALL_COLUMNS;
export const TABLE5_COLUMNS = ALL_COLUMNS;
