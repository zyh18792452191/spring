// ==================== 全量用户看管关系监控 - 模拟数据 ====================

// 地州列表（新疆移动16个地市分公司）
export const CITIES = [
  '乌鲁木齐',
  '克拉玛依',
  '吐鲁番',
  '哈密',
  '昌吉',
  '博州',
  '巴州',
  '阿克苏',
  '克州',
  '喀什',
  '和田',
  '伊犁',
  '塔城',
  '阿勒泰',
  '奎屯',
  '石河子',
];

// 客户类型
export type CustomerType = 'ALL' | 'GLOBAL';

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: 'ALL', label: '全量客户' },
  { value: 'GLOBAL', label: '全球通客户' },
];

// ==================== Tab1 全量用户看管视图 ====================

// 按地州看管客户数（看管客户数合计500，与按地州统计口径一致）
export interface CityWatchItem {
  city: string;
  customerCount: number;
  globalCount: number;
}

export const CITY_WATCH_DATA: CityWatchItem[] = [
  { city: '乌鲁木齐', customerCount: 18, globalCount: 2 },
  { city: '克拉玛依', customerCount: 5, globalCount: 0 },
  { city: '吐鲁番', customerCount: 35, globalCount: 1 },
  { city: '哈密', customerCount: 19, globalCount: 0 },
  { city: '昌吉', customerCount: 42, globalCount: 3 },
  { city: '博州', customerCount: 16, globalCount: 0 },
  { city: '巴州', customerCount: 58, globalCount: 4 },
  { city: '阿克苏', customerCount: 46, globalCount: 3 },
  { city: '克州', customerCount: 27, globalCount: 2 },
  { city: '喀什', customerCount: 52, globalCount: 5 },
  { city: '和田', customerCount: 60, globalCount: 2 },
  { city: '伊犁', customerCount: 26, globalCount: 2 },
  { city: '塔城', customerCount: 38, globalCount: 3 },
  { city: '阿勒泰', customerCount: 43, globalCount: 2 },
  { city: '奎屯', customerCount: 11, globalCount: 1 },
  { city: '石河子', customerCount: 4, globalCount: 4 },
];

// 物理网格分派情况（日）—— 全疆
export interface GridDispatchStat {
  dispatchedGrids: number;
  undispatchedGrids: number;
  dispatchRate: number;
}

export const GRID_DISPATCH_STAT: GridDispatchStat = {
  dispatchedGrids: 15282,
  undispatchedGrids: 0,
  dispatchRate: 100,
};

// ==================== Tab2 物理网格分派统计 - 按地州统计 ====================

export interface CityStatRow {
  city: string;
  customerCount: number;
  globalCount: number;
  dispatchedGrids: number;
  undispatchedGrids: number;
}

export const CITY_STATS: CityStatRow[] = [
  { city: '塔城', customerCount: 38, globalCount: 3, dispatchedGrids: 1487, undispatchedGrids: 0 },
  { city: '哈密', customerCount: 19, globalCount: 0, dispatchedGrids: 779, undispatchedGrids: 0 },
  { city: '和田', customerCount: 60, globalCount: 2, dispatchedGrids: 1821, undispatchedGrids: 0 },
  { city: '阿勒泰', customerCount: 43, globalCount: 2, dispatchedGrids: 1253, undispatchedGrids: 0 },
  { city: '克州', customerCount: 27, globalCount: 2, dispatchedGrids: 713, undispatchedGrids: 0 },
  { city: '博州', customerCount: 16, globalCount: 0, dispatchedGrids: 434, undispatchedGrids: 0 },
  { city: '克拉玛依', customerCount: 5, globalCount: 0, dispatchedGrids: 125, undispatchedGrids: 0 },
  { city: '乌鲁木齐', customerCount: 18, globalCount: 2, dispatchedGrids: 450, undispatchedGrids: 0 },
  { city: '奎屯', customerCount: 11, globalCount: 1, dispatchedGrids: 454, undispatchedGrids: 0 },
  { city: '石河子', customerCount: 4, globalCount: 4, dispatchedGrids: 284, undispatchedGrids: 0 },
  { city: '昌吉', customerCount: 42, globalCount: 3, dispatchedGrids: 1100, undispatchedGrids: 0 },
  { city: '吐鲁番', customerCount: 35, globalCount: 1, dispatchedGrids: 560, undispatchedGrids: 0 },
  { city: '巴州', customerCount: 58, globalCount: 4, dispatchedGrids: 1580, undispatchedGrids: 0 },
  { city: '阿克苏', customerCount: 46, globalCount: 3, dispatchedGrids: 1350, undispatchedGrids: 0 },
  { city: '喀什', customerCount: 52, globalCount: 5, dispatchedGrids: 1650, undispatchedGrids: 0 },
  { city: '伊犁', customerCount: 26, globalCount: 2, dispatchedGrids: 1242, undispatchedGrids: 0 },
];

// ==================== Tab3 存量用户物理网格分派明细 ====================

export interface GridDetailRow {
  id: number;
  gridId: string;
  gridName: string;
  assigned: boolean;
  photoCount: number;
  microGrid: string;
  grid: string;
  district: string;
  city: string;
  account: string;
  keeperName: string;
}

export const GRID_DETAILS: GridDetailRow[] = [
  { id: 1, gridId: '9100204002', gridName: '德裕', assigned: true, photoCount: 1, microGrid: '德裕微格', grid: '六道湾网格', district: '水区', city: '乌鲁木齐', account: 'bianhuiling', keeperName: '边*玲' },
  { id: 2, gridId: '9100205005', gridName: '顺和', assigned: true, photoCount: 1, microGrid: '顺和微格', grid: '南湖北网格', district: '水区', city: '乌鲁木齐', account: 'xuyan1', keeperName: '徐*' },
  { id: 3, gridId: '9300427011', gridName: '南湾村', assigned: true, photoCount: 10, microGrid: '新城7', grid: '城区新城街道网格', district: '城区分公司', city: '石河子', account: 'shzhouwenyu', keeperName: '周*瑜' },
  { id: 4, gridId: '9300427012', gridName: '材料厂', assigned: true, photoCount: 3, microGrid: '花园镇1', grid: '城区花园镇网格', district: '城区分公司', city: '石河子', account: 'shzhuhuimin', keeperName: '朱*敏' },
  { id: 5, gridId: '9300427013', gridName: '五宫村', assigned: true, photoCount: 1, microGrid: '北泉镇1', grid: '城区北泉镇网格', district: '城区分公司', city: '石河子', account: 'shhehuiqing', keeperName: '何*卿' },
  { id: 6, gridId: '9300427018', gridName: '沙湾乌兰乌苏村', assigned: true, photoCount: 4, microGrid: '沙湾乌兰乌苏镇', grid: '沙湾西戈壁网格', district: '沙湾县', city: '塔城', account: 'shwangge', keeperName: '王*' },
  { id: 7, gridId: '9300428001', gridName: '百货大楼', assigned: true, photoCount: 2, microGrid: '向阳5', grid: '城区向阳街道网格', district: '城区分公司', city: '石河子', account: 'shliujia', keeperName: '刘*' },
  { id: 8, gridId: '9300428002', gridName: '地下街', assigned: true, photoCount: 9, microGrid: '向阳5', grid: '城区向阳街道网格', district: '城区分公司', city: '石河子', account: 'shliujia', keeperName: '刘*' },
  { id: 9, gridId: '9300428003', gridName: '供销大厦', assigned: true, photoCount: 17, microGrid: '向阳1', grid: '城区向阳街道网格', district: '城区分公司', city: '石河子', account: 'shliujia', keeperName: '刘*' },
  { id: 10, gridId: '9300428004', gridName: '西环商场', assigned: true, photoCount: 3, microGrid: '老街8', grid: '城区老街街道网格', district: '城区分公司', city: '石河子', account: 'shzhangchengyuan', keeperName: '张*媛' },
  { id: 11, gridId: '9100100101', gridName: '幸福路', assigned: false, photoCount: 0, microGrid: '幸福微格', grid: '天山区解放路网格', district: '天山区', city: '乌鲁木齐', account: 'wangmei', keeperName: '王*梅' },
  { id: 12, gridId: '9100100102', gridName: '团结路', assigned: true, photoCount: 5, microGrid: '团结微格', grid: '天山区团结路网格', district: '天山区', city: '乌鲁木齐', account: 'liting', keeperName: '李*婷' },
  { id: 13, gridId: '9100100103', gridName: '大巴扎', assigned: true, photoCount: 12, microGrid: '大巴扎微格', grid: '天山区二道桥网格', district: '天山区', city: '乌鲁木齐', account: 'zhangqiang', keeperName: '张*强' },
  { id: 14, gridId: '6501020301', gridName: '绿洲路', assigned: true, photoCount: 6, microGrid: '绿洲微格', grid: '昌吉绿洲网格', district: '昌吉市', city: '昌吉', account: 'sunli', keeperName: '孙*丽' },
  { id: 15, gridId: '6501020302', gridName: '延安北路', assigned: true, photoCount: 8, microGrid: '延安北微格', grid: '昌吉延安路网格', district: '昌吉市', city: '昌吉', account: 'zhouyan', keeperName: '周*燕' },
  { id: 16, gridId: '6502000401', gridName: '老城路', assigned: true, photoCount: 2, microGrid: '老城微格', grid: '吐鲁番老城网格', district: '高昌区', city: '吐鲁番', account: 'wuwei', keeperName: '吴*伟' },
  { id: 17, gridId: '6502000402', gridName: '葡萄沟', assigned: true, photoCount: 7, microGrid: '葡萄沟微格', grid: '吐鲁番葡萄沟网格', district: '高昌区', city: '吐鲁番', account: 'zhengfang', keeperName: '郑*芳' },
  { id: 18, gridId: '6528000501', gridName: '石化大道', assigned: false, photoCount: 0, microGrid: '石化微格', grid: '库尔勒石化网格', district: '库尔勒市', city: '巴州', account: 'liuchun', keeperName: '刘*春' },
  { id: 19, gridId: '6528000502', gridName: '孔雀公园', assigned: true, photoCount: 11, microGrid: '孔雀微格', grid: '库尔勒孔雀网格', district: '库尔勒市', city: '巴州', account: 'yangjie', keeperName: '杨*洁' },
  { id: 20, gridId: '6530000601', gridName: '解放南路', assigned: true, photoCount: 9, microGrid: '解放南微格', grid: '喀什解放路网格', district: '喀什市', city: '喀什', account: 'huangling', keeperName: '黄*玲' },
];

// ==================== Tab3 筛选联动字典 ====================

export const CITY_DISTRICTS: Record<string, string[]> = {
  乌鲁木齐: ['天山区', '水区'],
  克拉玛依: ['克拉玛依区'],
  吐鲁番: ['高昌区'],
  哈密: ['伊州区'],
  昌吉: ['昌吉市'],
  博州: ['博乐市'],
  巴州: ['库尔勒市'],
  阿克苏: ['阿克苏市'],
  克州: ['阿图什市'],
  喀什: ['喀什市'],
  和田: ['和田市'],
  伊犁: ['伊宁市'],
  塔城: ['沙湾县'],
  阿勒泰: ['阿勒泰市'],
  奎屯: ['奎屯市'],
  石河子: ['城区分公司'],
};

export const DISTRICT_GRIDS: Record<string, string[]> = {
  天山区: ['天山区解放路网格', '天山区团结路网格', '天山区二道桥网格'],
  水区: ['六道湾网格', '南湖北网格'],
  克拉玛依区: ['克拉玛依中心网格'],
  高昌区: ['吐鲁番老城网格', '吐鲁番葡萄沟网格'],
  伊州区: ['哈密伊州网格'],
  昌吉市: ['昌吉绿洲网格', '昌吉延安路网格'],
  博乐市: ['博乐中心网格'],
  库尔勒市: ['库尔勒石化网格', '库尔勒孔雀网格'],
  阿克苏市: ['阿克苏中心网格'],
  阿图什市: ['阿图什中心网格'],
  喀什市: ['喀什解放路网格'],
  和田市: ['和田中心网格'],
  伊宁市: ['伊宁中心网格'],
  沙湾县: ['沙湾西戈壁网格'],
  阿勒泰市: ['阿勒泰中心网格'],
  奎屯市: ['奎屯中心网格'],
  城区分公司: ['城区新城街道网格', '城区花园镇网格', '城区北泉镇网格', '城区向阳街道网格', '城区老街街道网格'],
};
