-- 初始化区域数据（三级到七级）
-- 运营总览页面的区域
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'OPERATION_OVERVIEW'),
  'OPERATION_OVERVIEW',
  'MARKET_OPERATION_OVERVIEW',
  '市场运营总览',
  NULL,
  1,
  'active',
  '市场运营总览区域',
  NOW(),
  NOW()
);

-- 客户运营页面的区域
-- 第一级：存量运营
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'EXISTING_CUSTOMER',
  '存量运营',
  NULL,
  1,
  'active',
  '存量运营区域',
  NOW(),
  NOW()
);

-- 第二级：中高端客户运营（属于存量运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'HIGH_END_CUSTOMER',
  '中高端客户运营',
  (SELECT id FROM page_sections WHERE section_code = 'EXISTING_CUSTOMER'),
  1,
  'active',
  '中高端客户运营区域',
  NOW(),
  NOW()
);

-- 第三级：中高端客户运营概览（属于中高端客户运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'HIGH_END_OVERVIEW',
  '中高端客户运营概览',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_CUSTOMER'),
  1,
  'active',
  '中高端客户运营概览区域',
  NOW(),
  NOW()
);

-- 第四级：整体指标（属于中高端客户运营概览）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'OVERALL_METRICS',
  '整体指标',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_OVERVIEW'),
  1,
  'active',
  '整体指标区域',
  NOW(),
  NOW()
);

-- 第四级：价值提升（属于中高端客户运营概览）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'VALUE_ENHANCEMENT',
  '价值提升',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_OVERVIEW'),
  2,
  'active',
  '价值提升区域',
  NOW(),
  NOW()
);

-- 第五级：正向提值（属于价值提升）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'POSITIVE_VALUE_INCREASE',
  '正向提值',
  (SELECT id FROM page_sections WHERE section_code = 'VALUE_ENHANCEMENT'),
  1,
  'active',
  '正向提值组件',
  NOW(),
  NOW()
);

-- 第五级：逆向控损（属于价值提升）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'REVERSE_LOSS_CONTROL',
  '逆向控损',
  (SELECT id FROM page_sections WHERE section_code = 'VALUE_ENHANCEMENT'),
  2,
  'active',
  '逆向控损组件',
  NOW(),
  NOW()
);

-- 第四级：规模发展（属于中高端客户运营概览）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'SCALE_DEVELOPMENT',
  '规模发展',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_OVERVIEW'),
  3,
  'active',
  '规模发展区域',
  NOW(),
  NOW()
);

-- 第四级：融合加固（属于中高端客户运营概览）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'CONVERGENCE_STRENGTHENING',
  '融合加固',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_OVERVIEW'),
  4,
  'active',
  '融合加固区域',
  NOW(),
  NOW()
);

-- 第四级：客群看管（属于中高端客户运营概览）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'CUSTOMER_GROUP_MANAGEMENT',
  '客群看管',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_OVERVIEW'),
  5,
  'active',
  '客群看管区域',
  NOW(),
  NOW()
);

-- 第三级：拍照中高端客户规模保有率（属于中高端客户运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'HIGH_END_SCALE_RETENTION',
  '拍照中高端客户规模保有率',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_CUSTOMER'),
  2,
  'active',
  '拍照中高端客户规模保有率区域',
  NOW(),
  NOW()
);

-- 第三级：拍照中高端客户价值保有率（属于中高端客户运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'HIGH_END_VALUE_RETENTION',
  '拍照中高端客户价值保有率',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_CUSTOMER'),
  3,
  'active',
  '拍照中高端客户价值保有率区域',
  NOW(),
  NOW()
);

-- 第三级：中高端一降到底占比（属于中高端客户运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'HIGH_END_DECLINE_RATIO',
  '中高端一降到底占比',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_CUSTOMER'),
  4,
  'active',
  '中高端一降到底占比区域',
  NOW(),
  NOW()
);

-- 第三级：策略匹配（属于中高端客户运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'STRATEGY_MATCHING',
  '策略匹配',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_CUSTOMER'),
  5,
  'active',
  '策略匹配区域',
  NOW(),
  NOW()
);

-- 第三级：调度派发（属于中高端客户运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'DISPATCH_DISTRIBUTION',
  '调度派发',
  (SELECT id FROM page_sections WHERE section_code = 'HIGH_END_CUSTOMER'),
  6,
  'active',
  '调度派发区域',
  NOW(),
  NOW()
);

-- 第二级：离网维系（属于存量运营）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'CHURN_MANAGEMENT',
  '离网维系',
  (SELECT id FROM page_sections WHERE section_code = 'EXISTING_CUSTOMER'),
  2,
  'active',
  '离网维系区域',
  NOW(),
  NOW()
);

-- 第三级：当月全量客户离网客户数（属于离网维系）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'MONTHLY_ALL_CHURN_COUNT',
  '当月全量客户离网客户数',
  (SELECT id FROM page_sections WHERE section_code = 'CHURN_MANAGEMENT'),
  1,
  'active',
  '当月全量客户离网客户数区域',
  NOW(),
  NOW()
);

-- 第三级：当月拍照中高端客户离网客户数（属于离网维系）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'MONTHLY_HIGH_END_CHURN_COUNT',
  '当月拍照中高端客户离网客户数',
  (SELECT id FROM page_sections WHERE section_code = 'CHURN_MANAGEMENT'),
  2,
  'active',
  '当月拍照中高端客户离网客户数区域',
  NOW(),
  NOW()
);

-- 第三级：当月拍照全球通客户离网客户数（属于离网维系）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'MONTHLY_GLOBAL_CHURN_COUNT',
  '当月拍照全球通客户离网客户数',
  (SELECT id FROM page_sections WHERE section_code = 'CHURN_MANAGEMENT'),
  3,
  'active',
  '当月拍照全球通客户离网客户数区域',
  NOW(),
  NOW()
);

-- 第三级：策略匹配（属于离网维系）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'CHURN_STRATEGY_MATCHING',
  '策略匹配',
  (SELECT id FROM page_sections WHERE section_code = 'CHURN_MANAGEMENT'),
  4,
  'active',
  '策略匹配区域',
  NOW(),
  NOW()
);

-- 第三级：调度派发（属于离网维系）
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'CUSTOMER_OPERATION'),
  'CUSTOMER_OPERATION',
  'CHURN_DISPATCH_DISTRIBUTION',
  '调度派发',
  (SELECT id FROM page_sections WHERE section_code = 'CHURN_MANAGEMENT'),
  5,
  'active',
  '调度派发区域',
  NOW(),
  NOW()
);

-- 工作台首页页面的区域
INSERT INTO page_sections (
  page_id,
  page_code,
  section_code,
  section_name,
  parent_section_id,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM pages WHERE page_code = 'WORKSPACE_HOME'),
  'WORKSPACE_HOME',
  'WORKSPACE_HOME_SECTION',
  '工作台首页',
  NULL,
  1,
  'active',
  '工作台首页区域',
  NOW(),
  NOW()
);
