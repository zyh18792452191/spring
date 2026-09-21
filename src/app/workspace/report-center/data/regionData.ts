// ==================== 区域数据（新疆） ====================

export const CITY_LIST = [
  { code: '650100', name: '乌鲁木齐' },
  { code: '650200', name: '克拉玛依' },
  { code: '650400', name: '吐鲁番' },
  { code: '650500', name: '哈密' },
  { code: '652300', name: '昌吉' },
  { code: '652700', name: '博州' },
  { code: '652800', name: '巴州' },
  { code: '652900', name: '阿克苏' },
  { code: '653000', name: '克州' },
  { code: '653100', name: '喀什' },
  { code: '653200', name: '和田' },
  { code: '654000', name: '伊犁' },
  { code: '654200', name: '塔城' },
  { code: '654300', name: '阿勒泰' },
  { code: '654201', name: '奎屯' },
  { code: '659001', name: '石河子' },
] as const;

export const DISTRICT_MAP: Record<string, { code: string; name: string }[]> = {
  '650100': [
    { code: '650102', name: '天山区' }, { code: '650103', name: '沙依巴克区' },
    { code: '650104', name: '新市区' }, { code: '650105', name: '水磨沟区' },
    { code: '650106', name: '头屯河区' }, { code: '650107', name: '达坂城区' },
    { code: '650109', name: '米东区' }, { code: '650121', name: '乌鲁木齐县' },
  ],
  '650200': [
    { code: '650202', name: '独山子区' }, { code: '650203', name: '克拉玛依区' },
    { code: '650204', name: '白碱滩区' }, { code: '650205', name: '乌尔禾区' },
  ],
  '650400': [
    { code: '650402', name: '高昌区' }, { code: '650421', name: '鄯善县' },
    { code: '650422', name: '托克逊县' },
  ],
  '650500': [
    { code: '650502', name: '伊州区' }, { code: '650521', name: '巴里坤县' },
    { code: '650522', name: '伊吾县' },
  ],
  '652300': [
    { code: '652301', name: '昌吉市' }, { code: '652302', name: '阜康市' },
    { code: '652323', name: '呼图壁县' }, { code: '652324', name: '玛纳斯县' },
    { code: '652325', name: '奇台县' }, { code: '652327', name: '吉木萨尔县' },
    { code: '652328', name: '木垒县' },
  ],
  '652700': [
    { code: '652701', name: '博乐市' }, { code: '652702', name: '阿拉山口市' },
    { code: '652722', name: '精河县' }, { code: '652723', name: '温泉县' },
  ],
  '652800': [
    { code: '652801', name: '库尔勒市' }, { code: '652822', name: '轮台县' },
    { code: '652823', name: '尉犁县' }, { code: '652824', name: '若羌县' },
    { code: '652825', name: '且末县' }, { code: '652826', name: '焉耆县' },
    { code: '652827', name: '和静县' }, { code: '652828', name: '和硕县' },
    { code: '652829', name: '博湖县' },
  ],
  '652900': [
    { code: '652901', name: '阿克苏市' }, { code: '652902', name: '库车市' },
    { code: '652922', name: '温宿县' }, { code: '652924', name: '沙雅县' },
    { code: '652925', name: '新和县' }, { code: '652926', name: '拜城县' },
    { code: '652927', name: '乌什县' }, { code: '652928', name: '阿瓦提县' },
    { code: '652929', name: '柯坪县' },
  ],
  '653000': [
    { code: '653001', name: '阿图什市' }, { code: '653022', name: '阿克陶县' },
    { code: '653023', name: '阿合奇县' }, { code: '653024', name: '乌恰县' },
  ],
  '653100': [
    { code: '653101', name: '喀什市' }, { code: '653121', name: '疏附县' },
    { code: '653122', name: '疏勒县' }, { code: '653123', name: '英吉沙县' },
    { code: '653124', name: '泽普县' }, { code: '653125', name: '莎车县' },
    { code: '653126', name: '叶城县' }, { code: '653127', name: '麦盖提县' },
    { code: '653128', name: '岳普湖县' }, { code: '653129', name: '伽师县' },
    { code: '653130', name: '巴楚县' }, { code: '653131', name: '塔什库尔干县' },
  ],
  '653200': [
    { code: '653201', name: '和田市' }, { code: '653221', name: '和田县' },
    { code: '653222', name: '墨玉县' }, { code: '653223', name: '皮山县' },
    { code: '653224', name: '洛浦县' }, { code: '653225', name: '策勒县' },
    { code: '653226', name: '于田县' }, { code: '653227', name: '民丰县' },
  ],
  '654000': [
    { code: '654002', name: '伊宁市' }, { code: '654003', name: '奎屯市' },
    { code: '654004', name: '霍尔果斯市' }, { code: '654021', name: '伊宁县' },
    { code: '654022', name: '察布查尔县' }, { code: '654023', name: '霍城县' },
    { code: '654024', name: '巩留县' }, { code: '654025', name: '新源县' },
    { code: '654026', name: '昭苏县' }, { code: '654027', name: '特克斯县' },
    { code: '654028', name: '尼勒克县' },
  ],
  '654200': [
    { code: '654201', name: '塔城市' }, { code: '654202', name: '乌苏市' },
    { code: '654221', name: '额敏县' }, { code: '654223', name: '沙湾市' },
    { code: '654224', name: '托里县' }, { code: '654225', name: '裕民县' },
    { code: '654226', name: '和布克赛尔县' },
  ],
  '654300': [
    { code: '654301', name: '阿勒泰市' }, { code: '654321', name: '布尔津县' },
    { code: '654322', name: '富蕴县' }, { code: '654323', name: '福海县' },
    { code: '654324', name: '哈巴河县' }, { code: '654325', name: '青河县' },
    { code: '654326', name: '吉木乃县' },
  ],
  '654201': [
    { code: '65420101', name: '奎屯市区' }, { code: '65420102', name: '开干齐乡' },
  ],
  '659001': [
    { code: '65900101', name: '新城街道' }, { code: '65900102', name: '向阳街道' },
    { code: '65900103', name: '红山街道' }, { code: '65900104', name: '老街街道' },
    { code: '65900105', name: '东城街道' }, { code: '65900106', name: '北泉镇' },
  ],
};

// 每个区县下的网格(简化)
export const GRID_MAP: Record<string, { code: string; name: string }[]> = {};
// 动态生成网格数据
Object.entries(DISTRICT_MAP).forEach(([cityCode, districts]) => {
  districts.forEach(d => {
    const gridCount = Math.min(3 + Math.floor(d.code.charCodeAt(d.code.length - 1) % 5), 6);
    const grids: { code: string; name: string }[] = [];
    for (let i = 1; i <= gridCount; i++) {
      grids.push({ code: `${d.code}${String(i).padStart(2, '0')}`, name: `${d.name}网格${i}` });
    }
    GRID_MAP[d.code] = grids;
  });
});
