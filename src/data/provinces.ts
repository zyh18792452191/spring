/**
 * 省份和地市枚举数据
 * 用于区域筛选功能
 * 层级：省 → 地市分公司 → 区县 → 网格
 * 
 * 新疆移动16个地市分公司（按业务规模划分，非行政区划）：
 * 14个地级行政区 + 奎屯（从伊犁独立） + 石河子（兵团第八师，独立分公司）
 */

// 省份/直辖市/自治区数据
export interface Province {
  code: string;
  name: string;
  shortName: string; // 简称，用于显示
  cities: City[];
  // 省份发展系数（用于模拟数据计算，1.0为全国平均水平）
  developmentFactor: number;
}

export interface City {
  code: string;
  name: string;
  // 地市发展系数（相对于省内平均水平）
  developmentFactor: number;
  // 区县数据
  districts?: District[];
}

export interface District {
  code: string;
  name: string;
  // 区县发展系数
  developmentFactor: number;
  // 网格数据
  grids?: Grid[];
}

export interface Grid {
  code: string;
  name: string;
  // 网格发展系数
  developmentFactor: number;
}

// 31省份数据（含下属地市）
export const provinces: Province[] = [
  {
    code: '650000',
    name: '新疆维吾尔自治区',
    shortName: '新疆',
    developmentFactor: 0.92,
    cities: [
      { code: '650100', name: '乌鲁木齐', developmentFactor: 1.1, districts: [
        { code: '650101', name: '天山区', developmentFactor: 1.15, grids: [
          { code: '65010101', name: '天山路街道', developmentFactor: 1.18 },
          { code: '65010102', name: '胜利路街道', developmentFactor: 1.12 },
          { code: '65010103', name: '团结路街道', developmentFactor: 1.10 },
          { code: '65010104', name: '解放南路街道', developmentFactor: 1.08 },
          { code: '65010105', name: '新华南路街道', developmentFactor: 1.06 },
          { code: '65010106', name: '幸福路街道', developmentFactor: 1.14 },
          { code: '65010107', name: '东泉路街道', developmentFactor: 1.02 },
          { code: '65010108', name: '翠泉路街道', developmentFactor: 1.00 },
        ]},
        { code: '650102', name: '沙依巴克区', developmentFactor: 1.1, grids: [
          { code: '65010201', name: '长江路街道', developmentFactor: 1.12 },
          { code: '65010202', name: '友好南路街道', developmentFactor: 1.08 },
          { code: '65010203', name: '扬子江路街道', developmentFactor: 1.06 },
          { code: '65010204', name: '西山街道', developmentFactor: 1.02 },
        ]},
        { code: '650103', name: '新市区', developmentFactor: 1.12, grids: [
          { code: '65010301', name: '北京路街道', developmentFactor: 1.16 },
          { code: '65010302', name: '二工街道', developmentFactor: 1.10 },
          { code: '65010303', name: '三工街道', developmentFactor: 1.08 },
          { code: '65010304', name: '迎宾路街道', developmentFactor: 1.04 },
        ]},
        { code: '650104', name: '水磨沟区', developmentFactor: 1.08, grids: [
          { code: '65010401', name: '水磨沟街道', developmentFactor: 1.10 },
          { code: '65010402', name: '六道湾街道', developmentFactor: 1.06 },
          { code: '65010403', name: '苇湖梁街道', developmentFactor: 1.02 },
        ]},
        { code: '650105', name: '头屯河区', developmentFactor: 1.05, grids: [
          { code: '65010501', name: '头屯河街道', developmentFactor: 1.06 },
          { code: '65010502', name: '火车西站街道', developmentFactor: 1.04 },
          { code: '65010503', name: '王家沟街道', developmentFactor: 1.00 },
        ]},
        { code: '650106', name: '达坂城区', developmentFactor: 0.85, grids: [
          { code: '65010601', name: '达坂城街道', developmentFactor: 0.88 },
          { code: '65010602', name: '东沟乡', developmentFactor: 0.82 },
        ]},
        { code: '650107', name: '米东区', developmentFactor: 0.95, grids: [
          { code: '65010701', name: '米东南路街道', developmentFactor: 0.98 },
          { code: '65010702', name: '古牧地镇', developmentFactor: 0.92 },
          { code: '65010703', name: '铁厂沟镇', developmentFactor: 0.88 },
        ]},
        { code: '650108', name: '乌鲁木齐县', developmentFactor: 0.8, grids: [
          { code: '65010801', name: '板房沟镇', developmentFactor: 0.82 },
          { code: '65010802', name: '水西沟镇', developmentFactor: 0.80 },
        ]},
      ]},
      { code: '650200', name: '克拉玛依', developmentFactor: 1.15, districts: [
        { code: '650201', name: '独山子区', developmentFactor: 1.1 },
        { code: '650202', name: '克拉玛依区', developmentFactor: 1.2 },
        { code: '650203', name: '白碱滩区', developmentFactor: 1.05 },
        { code: '650204', name: '乌尔禾区', developmentFactor: 0.9 },
      ]},
      { code: '650400', name: '吐鲁番', developmentFactor: 0.88, districts: [
        { code: '650401', name: '高昌区', developmentFactor: 0.92 },
        { code: '650402', name: '鄯善县', developmentFactor: 0.85 },
        { code: '650403', name: '托克逊县', developmentFactor: 0.82 },
      ]},
      { code: '650500', name: '哈密', developmentFactor: 0.86, districts: [
        { code: '650501', name: '伊州区', developmentFactor: 0.9 },
        { code: '650502', name: '巴里坤县', developmentFactor: 0.78 },
        { code: '650503', name: '伊吾县', developmentFactor: 0.75 },
      ]},
      { code: '652300', name: '昌吉', developmentFactor: 0.95, districts: [
        { code: '652301', name: '昌吉市', developmentFactor: 1.0 },
        { code: '652302', name: '阜康市', developmentFactor: 0.92 },
        { code: '652303', name: '呼图壁县', developmentFactor: 0.88 },
        { code: '652304', name: '玛纳斯县', developmentFactor: 0.85 },
      ]},
      { code: '652700', name: '博州', developmentFactor: 0.82, districts: [
        { code: '652701', name: '博乐市', developmentFactor: 0.85 },
        { code: '652702', name: '阿拉山口市', developmentFactor: 0.9 },
        { code: '652703', name: '精河县', developmentFactor: 0.78 },
      ]},
      { code: '652800', name: '巴州', developmentFactor: 0.9, districts: [
        { code: '652801', name: '库尔勒市', developmentFactor: 0.95 },
        { code: '652802', name: '轮台县', developmentFactor: 0.82 },
        { code: '652803', name: '尉犁县', developmentFactor: 0.78 },
        { code: '652804', name: '若羌县', developmentFactor: 0.72 },
      ]},
      { code: '652900', name: '阿克苏', developmentFactor: 0.88, districts: [
        { code: '652901', name: '阿克苏市', developmentFactor: 0.92 },
        { code: '652902', name: '库车市', developmentFactor: 0.88 },
        { code: '652903', name: '温宿县', developmentFactor: 0.8 },
      ]},
      { code: '653000', name: '克州', developmentFactor: 0.72, districts: [
        { code: '653001', name: '阿图什市', developmentFactor: 0.75 },
        { code: '653002', name: '阿克陶县', developmentFactor: 0.68 },
      ]},
      { code: '653100', name: '喀什', developmentFactor: 0.78, districts: [
        { code: '653101', name: '喀什市', developmentFactor: 0.85 },
        { code: '653102', name: '疏勒县', developmentFactor: 0.72 },
        { code: '653103', name: '疏附县', developmentFactor: 0.7 },
        { code: '653104', name: '莎车县', developmentFactor: 0.68 },
      ]},
      { code: '653200', name: '和田', developmentFactor: 0.7, districts: [
        { code: '653201', name: '和田市', developmentFactor: 0.78 },
        { code: '653202', name: '和田县', developmentFactor: 0.65 },
        { code: '653203', name: '墨玉县', developmentFactor: 0.62 },
      ]},
      { code: '654000', name: '伊犁', developmentFactor: 0.92, districts: [
        { code: '654001', name: '伊宁市', developmentFactor: 0.95 },
        { code: '654003', name: '霍尔果斯市', developmentFactor: 1.0 },
        { code: '654004', name: '新源县', developmentFactor: 0.82 },
        { code: '654005', name: '察布查尔县', developmentFactor: 0.78 },
      ]},
      { code: '654200', name: '塔城', developmentFactor: 0.84, districts: [
        { code: '654201', name: '塔城市', developmentFactor: 0.88 },
        { code: '654202', name: '乌苏市', developmentFactor: 0.82 },
        { code: '654203', name: '沙湾市', developmentFactor: 0.8 },
      ]},
      { code: '654300', name: '阿勒泰', developmentFactor: 0.8, districts: [
        { code: '654301', name: '阿勒泰市', developmentFactor: 0.85 },
        { code: '654302', name: '布尔津县', developmentFactor: 0.75 },
        { code: '654303', name: '富蕴县', developmentFactor: 0.72 },
      ]},
      { code: '654010', name: '奎屯', developmentFactor: 0.93, districts: [
        { code: '6540101', name: '乌鲁木齐东路街道', developmentFactor: 0.96 },
        { code: '6540102', name: '乌鲁木齐西路街道', developmentFactor: 0.94 },
        { code: '6540103', name: '北京路街道', developmentFactor: 0.92 },
        { code: '6540104', name: '火车站街道', developmentFactor: 0.90 },
      ]},
      { code: '659001', name: '石河子', developmentFactor: 0.98, districts: [
        { code: '6590011', name: '新城街道', developmentFactor: 1.0 },
        { code: '6590012', name: '向阳街道', developmentFactor: 0.95 },
        { code: '6590013', name: '红山街道', developmentFactor: 0.98 },
      ]},
    ]
  }
];

// 全疆选项
export const NATIONAL_OPTION = {
  code: '650000',
  name: '全疆',
  shortName: '全疆',
  developmentFactor: 1.0,
  cities: []
};

// 获取所有区域选项（全疆 + 16地市分公司）
export const getAllRegionOptions = () => {
  return [
    NATIONAL_OPTION,
    ...provinces.map(p => ({
      code: p.code,
      name: p.name,
      shortName: p.shortName,
      developmentFactor: p.developmentFactor,
      cities: p.cities
    }))
  ];
};

// 根据区域编码获取区域信息
export const getRegionByCode = (code: string) => {
  if (code === NATIONAL_OPTION.code) {
    return NATIONAL_OPTION;
  }
  return provinces.find(p => p.code === code) || null;
};

// 根据区域名称获取区域信息
export const getRegionByName = (name: string) => {
  if (name === '全国') {
    return NATIONAL_OPTION;
  }
  return provinces.find(p => p.name === name || p.shortName === name) || null;
};

// 判断是否是全国
export const isNational = (code: string) => {
  return code === NATIONAL_OPTION.code || code === '';
};
