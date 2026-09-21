-- 初始化场景数据（一级）
-- 1. 首页
INSERT INTO business_scenarios (
  scenario_code,
  scenario_name,
  module_code,
  module_name,
  parent_scenario_id,
  level,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  'HOME',
  '首页',
  'PORTAL',
  '门户',
  NULL,
  1,
  1,
  'active',
  '门户首页',
  NOW(),
  NOW()
);

-- 2. 市场数智运营
INSERT INTO business_scenarios (
  scenario_code,
  scenario_name,
  module_code,
  module_name,
  parent_scenario_id,
  level,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  'MARKET_INTEL',
  '市场数智运营',
  'OPERATION',
  '运营',
  NULL,
  1,
  2,
  'active',
  '市场数智运营',
  NOW(),
  NOW()
);

-- 3. 我的工作台
INSERT INTO business_scenarios (
  scenario_code,
  scenario_name,
  module_code,
  module_name,
  parent_scenario_id,
  level,
  sort_order,
  status,
  description,
  created_at,
  updated_at
) VALUES (
  'WORKSPACE',
  '我的工作台',
  'WORKSPACE',
  '工作台',
  NULL,
  1,
  3,
  'active',
  '我的工作台',
  NOW(),
  NOW()
);
