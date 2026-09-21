// 5级区域下钻数据
// 区域层级：全疆(L1) → 地州(L2) → 区县(L3) → 网格(L4) → 微格(L5)
// 数据来源：新疆移动组织架构 + 模拟数据

import type { RegionNode, RegionLevel, RegionIndicatorRow } from './types';

// ===== 区域树结构 =====
// 16地市分公司 + 下辖区县 + 网格 + 微格

const CITY_DISTRICTS: Record<string, { name: string; grids: string[] }[]> = {
  '乌鲁木齐': [
    { name: '天山区', grids: ['天山中心网格', '天山南网格', '天山北网格'] },
    { name: '沙依巴克区', grids: ['沙区中心网格', '沙区西网格'] },
    { name: '新市区', grids: ['新市东网格', '新市西网格', '新市南网格'] },
    { name: '水磨沟区', grids: ['水区中心网格', '水区北网格'] },
    { name: '头屯河区', grids: ['头区网格'] },
    { name: '达坂城区', grids: ['达坂城网格'] },
    { name: '米东区', grids: ['米东中心网格', '米东北网格'] },
    { name: '乌鲁木齐县', grids: ['乌县网格'] },
  ],
  '克拉玛依': [
    { name: '独山子区', grids: ['独山子网格'] },
    { name: '克拉玛依区', grids: ['克区中心网格', '克区南网格'] },
    { name: '白碱滩区', grids: ['白碱滩网格'] },
    { name: '乌尔禾区', grids: ['乌尔禾网格'] },
  ],
  '吐鲁番': [
    { name: '高昌区', grids: ['高昌中心网格', '高昌东网格'] },
    { name: '鄯善县', grids: ['鄯善网格'] },
    { name: '托克逊县', grids: ['托克逊网格'] },
  ],
  '哈密': [
    { name: '伊州区', grids: ['伊州中心网格', '伊州东网格'] },
    { name: '巴里坤县', grids: ['巴里坤网格'] },
    { name: '伊吾县', grids: ['伊吾网格'] },
  ],
  '昌吉': [
    { name: '昌吉市', grids: ['昌吉中心网格', '昌吉东网格'] },
    { name: '阜康市', grids: ['阜康网格'] },
    { name: '呼图壁县', grids: ['呼图壁网格'] },
    { name: '玛纳斯县', grids: ['玛纳斯网格'] },
    { name: '奇台县', grids: ['奇台网格'] },
    { name: '吉木萨尔县', grids: ['吉木萨尔网格'] },
    { name: '木垒县', grids: ['木垒网格'] },
  ],
  '博州': [
    { name: '博乐市', grids: ['博乐中心网格', '博乐东网格'] },
    { name: '阿拉山口市', grids: ['阿拉山口网格'] },
    { name: '精河县', grids: ['精河网格'] },
    { name: '温泉县', grids: ['温泉网格'] },
  ],
  '巴州': [
    { name: '库尔勒市', grids: ['库尔勒中心网格', '库尔勒南网格', '库尔勒北网格'] },
    { name: '轮台县', grids: ['轮台网格'] },
    { name: '尉犁县', grids: ['尉犁网格'] },
    { name: '若羌县', grids: ['若羌网格'] },
    { name: '且末县', grids: ['且末网格'] },
    { name: '焉耆县', grids: ['焉耆网格'] },
    { name: '和静县', grids: ['和静网格'] },
    { name: '和硕县', grids: ['和硕网格'] },
    { name: '博湖县', grids: ['博湖网格'] },
  ],
  '阿克苏': [
    { name: '阿克苏市', grids: ['阿克苏中心网格', '阿克苏东网格'] },
    { name: '库车市', grids: ['库车网格'] },
    { name: '温宿县', grids: ['温宿网格'] },
    { name: '沙雅县', grids: ['沙雅网格'] },
    { name: '新和县', grids: ['新和网格'] },
    { name: '拜城县', grids: ['拜城网格'] },
    { name: '乌什县', grids: ['乌什网格'] },
    { name: '阿瓦提县', grids: ['阿瓦提网格'] },
    { name: '柯坪县', grids: ['柯坪网格'] },
  ],
  '克州': [
    { name: '阿图什市', grids: ['阿图什网格'] },
    { name: '阿克陶县', grids: ['阿克陶网格'] },
    { name: '阿合奇县', grids: ['阿合奇网格'] },
    { name: '乌恰县', grids: ['乌恰网格'] },
  ],
  '喀什': [
    { name: '喀什市', grids: ['喀什中心网格', '喀什东网格'] },
    { name: '疏附县', grids: ['疏附网格'] },
    { name: '疏勒县', grids: ['疏勒网格'] },
    { name: '英吉沙县', grids: ['英吉沙网格'] },
    { name: '莎车县', grids: ['莎车网格'] },
    { name: '叶城县', grids: ['叶城网格'] },
    { name: '麦盖提县', grids: ['麦盖提网格'] },
    { name: '岳普湖县', grids: ['岳普湖网格'] },
    { name: '伽师县', grids: ['伽师网格'] },
    { name: '巴楚县', grids: ['巴楚网格'] },
    { name: '塔什库尔干县', grids: ['塔县网格'] },
  ],
  '和田': [
    { name: '和田市', grids: ['和田中心网格'] },
    { name: '和田县', grids: ['和县网格'] },
    { name: '墨玉县', grids: ['墨玉网格'] },
    { name: '皮山县', grids: ['皮山网格'] },
    { name: '洛浦县', grids: ['洛浦网格'] },
    { name: '策勒县', grids: ['策勒网格'] },
    { name: '于田县', grids: ['于田网格'] },
    { name: '民丰县', grids: ['民丰网格'] },
  ],
  '伊犁': [
    { name: '伊宁市', grids: ['伊宁中心网格', '伊宁东网格'] },
    { name: '奎屯市', grids: ['奎屯中心网格'] },
    { name: '霍尔果斯市', grids: ['霍尔果斯网格'] },
    { name: '伊宁县', grids: ['伊宁县网格'] },
    { name: '察布查尔县', grids: ['察县网格'] },
    { name: '霍城县', grids: ['霍城网格'] },
    { name: '巩留县', grids: ['巩留网格'] },
    { name: '新源县', grids: ['新源网格'] },
    { name: '昭苏县', grids: ['昭苏网格'] },
    { name: '特克斯县', grids: ['特克斯网格'] },
    { name: '尼勒克县', grids: ['尼勒克网格'] },
  ],
  '塔城': [
    { name: '塔城市', grids: ['塔城网格'] },
    { name: '乌苏市', grids: ['乌苏网格'] },
    { name: '额敏县', grids: ['额敏网格'] },
    { name: '沙湾市', grids: ['沙湾网格'] },
    { name: '托里县', grids: ['托里网格'] },
    { name: '裕民县', grids: ['裕民网格'] },
    { name: '和布克赛尔县', grids: ['和丰网格'] },
  ],
  '阿勒泰': [
    { name: '阿勒泰市', grids: ['阿勒泰网格'] },
    { name: '布尔津县', grids: ['布尔津网格'] },
    { name: '富蕴县', grids: ['富蕴网格'] },
    { name: '福海县', grids: ['福海网格'] },
    { name: '哈巴河县', grids: ['哈巴河网格'] },
    { name: '青河县', grids: ['青河网格'] },
    { name: '吉木乃县', grids: ['吉木乃网格'] },
  ],
  '奎屯': [
    { name: '奎屯市区', grids: ['奎屯中心网格', '奎屯东网格', '奎屯西网格'] },
    { name: '独山子区', grids: ['独山子网格'] },
  ],
  '石河子': [
    { name: '石河子市区', grids: ['石河子中心网格', '石河子东网格', '石河子北网格'] },
    { name: '开发区', grids: ['开发区网格'] },
  ],
};

const CITIES_16 = ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子'];

// 构建区域树
function buildRegionTree(): RegionNode {
  const province: RegionNode = {
    code: '650000',
    name: '全疆',
    level: 'province' as RegionLevel,
    parentCode: null,
    children: [],
  };

  CITIES_16.forEach((cityName, cityIdx) => {
    const cityCode = `65${String(cityIdx + 1).padStart(2, '0')}`;
    const cityNode: RegionNode = {
      code: cityCode,
      name: cityName,
      level: 'city' as RegionLevel,
      parentCode: '650000',
      children: [],
    };

    const districts = CITY_DISTRICTS[cityName] || [];
    districts.forEach((dist, distIdx) => {
      const distCode = `${cityCode}${String(distIdx + 1).padStart(2, '0')}`;
      const distNode: RegionNode = {
        code: distCode,
        name: dist.name,
        level: 'district' as RegionLevel,
        parentCode: cityCode,
        children: [],
      };

      dist.grids.forEach((gridName, gridIdx) => {
        const gridCode = `${distCode}${String(gridIdx + 1).padStart(2, '0')}`;
        const gridNode: RegionNode = {
          code: gridCode,
          name: gridName,
          level: 'grid' as RegionLevel,
          parentCode: distCode,
          children: [
            {
              code: `${gridCode}01`,
              name: `${gridName}一微格`,
              level: 'microgrid' as RegionLevel,
              parentCode: gridCode,
              children: [],
            },
            {
              code: `${gridCode}02`,
              name: `${gridName}二微格`,
              level: 'microgrid' as RegionLevel,
              parentCode: gridCode,
              children: [],
            },
          ],
        };
        distNode.children.push(gridNode);
      });

      cityNode.children.push(distNode);
    });

    province.children.push(cityNode);
  });

  return province;
}

export const regionTree: RegionNode = buildRegionTree();

// ===== 区域下钻指标模拟数据 =====
// 核心设计原则：
// 1. 率值型指标(unit='%')：各地州值也在率值范围内，不是按比例拆分
//    例如保拓率103.03%，各地州也在95%~105%之间，不是22%
// 2. 绝对值指标(unit='户'/'万元'/'GB'等)：各地州值按比例拆分+波动
//    例如出账客户892万，乌鲁木齐约22%=196万
// 3. 环比值是独立数据，不是从当前值推算
//    例如保拓率103.03%的环比是+0.24pp，不是103.03×100

// 各地州占比系数（用于绝对值指标的拆分）
const cityMultipliers: Record<string, number> = {
  '乌鲁木齐': 0.22, '克拉玛依': 0.03, '吐鲁番': 0.05, '哈密': 0.04,
  '昌吉': 0.07, '博州': 0.03, '巴州': 0.06, '阿克苏': 0.08,
  '克州': 0.02, '喀什': 0.10, '和田': 0.05, '伊犁': 0.09,
  '塔城': 0.04, '阿勒泰': 0.03, '奎屯': 0.04, '石河子': 0.05,
};

// 确定性伪随机（基于seed，避免每次渲染数据跳动）
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function seededFluctuation(base: number, range: number, seed: number): number {
  const r = seededRandom(seed);
  return base * (1 + (r * 2 - 1) * range);
}

// 判断指标是否为率值型（百分比指标，各地州也在率值范围）
function isRateIndicator(unit: string): boolean {
  return unit === '%';
}

// 格式化指标值
function formatValue(v: number, unit: string): string {
  if (unit === '%') {
    return v.toFixed(2) + '%';
  }
  if (unit === 'pp') {
    return (v >= 0 ? '+' : '') + v.toFixed(2) + 'pp';
  }
  if (unit === '户') {
    if (Math.abs(v) >= 10000) return (v / 10000).toFixed(2) + '万户';
    return v.toFixed(0) + '户';
  }
  if (unit === '万元') {
    if (Math.abs(v) >= 10000) return (v / 10000).toFixed(2) + '亿';
    return v.toFixed(2) + '万';
  }
  if (unit === 'GB') {
    return v.toFixed(2) + 'GB';
  }
  // 通用
  if (Math.abs(v) >= 10000) return (v / 10000).toFixed(2) + '万';
  return v.toFixed(v % 1 === 0 ? 0 : 2);
}

// 格式化环比值
// 率值指标的环比单位是pp，绝对值指标的环比单位是%
function formatChangeValue(change: number, mainUnit: string): string {
  if (mainUnit === '%') {
    // 率值指标的环比用pp
    return (change >= 0 ? '+' : '') + change.toFixed(2) + 'pp';
  }
  // 绝对值指标的环比用%
  return (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
}

// 生成某指标在某区域层级下的所有下级区域指标行
export function generateRegionIndicatorRows(
  indicatorId: string,
  currentRegion: RegionNode,
  mainValue: number,
  mainUnit: string,
  mainChangeValue: string | undefined,
  subIndicatorDefs: { name: string; unit: string; value: number; hasChange: boolean; changeValue?: string }[]
): RegionIndicatorRow[] {
  const rows: RegionIndicatorRow[] = [];
  const seed = hashCode(indicatorId + currentRegion.code);

  // 解析主指标环比值
  const mainChangeNum = parseChangeNumber(mainChangeValue);
  const mainDirection: 'up' | 'down' | 'flat' = mainChangeNum > 0 ? 'up' : mainChangeNum < 0 ? 'down' : 'flat';

  // 当前区域汇总行
  rows.push({
    regionCode: currentRegion.code,
    regionName: currentRegion.name,
    mainValue: formatValue(mainValue, mainUnit),
    mainChange: mainChangeValue || '',
    mainChangeDirection: mainDirection,
    mainIsPositive: mainChangeNum >= 0,
    subValues: subIndicatorDefs.map(s => {
      const subChange = s.hasChange
        ? (s.changeValue
            ? { formatted: s.changeValue, direction: (parseChangeNumber(s.changeValue) > 0 ? 'up' : parseChangeNumber(s.changeValue) < 0 ? 'down' : 'flat') as 'up'|'down'|'flat', isPositive: parseChangeNumber(s.changeValue) >= 0 }
            : generateSubChange(s.value, s.unit, seed + hashCode(s.name)))
        : undefined;
      return {
        name: s.name,
        unit: s.unit,
        value: formatValue(s.value, s.unit),
        ...(subChange !== undefined ? {
          change: subChange.formatted,
          direction: subChange.direction,
          isPositive: subChange.isPositive,
        } : {}),
      };
    }),
  });

  // 下级区域行
  currentRegion.children.forEach((child, idx) => {
    const childSeed = seed + idx * 137;
    let childMainValue: number;

    if (isRateIndicator(mainUnit)) {
      // 率值指标：各地州在率值附近波动（±5%的绝对值波动）
      // 例如保拓率103.03%，各地州在98%~108%之间
      const fluctuationRange = Math.max(Math.abs(mainValue) * 0.05, 2);
      childMainValue = seededFluctuation(mainValue, fluctuationRange / mainValue, childSeed);
    } else {
      // 绝对值指标：按比例拆分+波动
      const multiplier = child.level === 'city'
        ? (cityMultipliers[child.name] || 0.05)
        : (1 / (currentRegion.children.length || 1));
      childMainValue = seededFluctuation(mainValue * multiplier, 0.15, childSeed);
    }

    // 子指标的区域值
    const childSubValues = subIndicatorDefs.map(s => {
      let childSubValue: number;
      if (isRateIndicator(s.unit)) {
        // 率值子指标：在原值附近波动
        const fluctRange = Math.max(Math.abs(s.value) * 0.05, 1);
        childSubValue = seededFluctuation(s.value, fluctRange / Math.abs(s.value || 1), childSeed + hashCode(s.name));
      } else if (s.unit === 'pp') {
        // pp值子指标：在原值附近小波动
        childSubValue = seededFluctuation(s.value, 0.3, childSeed + hashCode(s.name));
      } else {
        // 绝对值子指标：按比例拆分
        const mult = child.level === 'city'
          ? (cityMultipliers[child.name] || 0.05)
          : (1 / (currentRegion.children.length || 1));
        childSubValue = seededFluctuation(s.value * mult, 0.2, childSeed + hashCode(s.name));
      }

      const subChange = s.hasChange
        ? generateSubChange(childSubValue, s.unit, childSeed + hashCode(s.name) + 999)
        : undefined;

      return {
        name: s.name,
        unit: s.unit,
        value: formatValue(childSubValue, s.unit),
        ...(subChange !== undefined ? {
          change: subChange.formatted,
          direction: subChange.direction,
          isPositive: subChange.isPositive,
        } : {}),
      };
    });

    // 主指标环比：仅当主指标有较月同期时才生成子区域的环比值
    let childMainChange = '';
    let childDirection: 'up' | 'down' | 'flat' = 'flat';
    let childIsPositive = true;
    if (mainChangeValue) {
      if (mainChangeNum !== 0) {
        const childChangeNum = seededFluctuation(mainChangeNum, 0.3, childSeed + 777);
        childMainChange = formatChangeValue(childChangeNum, mainUnit);
      } else {
        const childChangeNum = seededFluctuation(0, 0.5, childSeed + 777);
        childMainChange = formatChangeValue(childChangeNum, mainUnit);
      }
      childDirection = parseChangeNumber(childMainChange) > 0 ? 'up' : parseChangeNumber(childMainChange) < 0 ? 'down' : 'flat';
      childIsPositive = childDirection === 'up';
    }

    rows.push({
      regionCode: child.code,
      regionName: child.name,
      mainValue: formatValue(childMainValue, mainUnit),
      mainChange: childMainChange,
      mainChangeDirection: childDirection,
      mainIsPositive: childIsPositive,
      subValues: childSubValues,
    });
  });

  return rows;
}

// 生成子指标的环比值
function generateSubChange(
  subValue: number,
  subUnit: string,
  seed: number
): { formatted: string; direction: 'up' | 'down' | 'flat'; isPositive: boolean } | undefined {
  // pp值的子指标没有环比（它本身就是变化量）
  if (subUnit === 'pp') return undefined;

  // 生成一个合理的环比值
  let changeNum: number;
  if (isRateIndicator(subUnit)) {
    // 率值子指标的环比：pp级别的波动（0~2pp）
    changeNum = (seededRandom(seed) * 2 - 1) * 2;
  } else {
    // 绝对值子指标的环比：百分比波动
    changeNum = (seededRandom(seed) * 2 - 1) * 10;
  }

  const formatted = formatChangeValue(changeNum, subUnit);
  const direction: 'up' | 'down' | 'flat' = changeNum > 0 ? 'up' : changeNum < 0 ? 'down' : 'flat';

  return {
    formatted,
    direction,
    isPositive: direction !== 'down',
  };
}

// 解析changeValue字符串为数字
// "+0.24pp" → 0.24, "-2.78%" → -2.78, "" → 0
function parseChangeNumber(changeStr: string | undefined): number {
  if (!changeStr) return 0;
  const match = changeStr.match(/([+-]?\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

// 简单hash函数（用于生成确定性seed）
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ===== 面包屑路径查找 =====
export function findRegionPath(tree: RegionNode, targetCode: string): RegionNode[] {
  if (tree.code === targetCode) return [tree];
  for (const child of tree.children) {
    const path = findRegionPath(child, targetCode);
    if (path.length > 0) return [tree, ...path];
  }
  return [];
}

// ===== 在区域树中查找节点 =====
export function findRegionNode(tree: RegionNode, code: string): RegionNode | null {
  if (tree.code === code) return tree;
  for (const child of tree.children) {
    const found = findRegionNode(child, code);
    if (found) return found;
  }
  return null;
}
