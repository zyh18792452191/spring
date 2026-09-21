-- ============================================================
-- 页面和场景管理系统 - 初始化数据脚本 v2.0
-- 版本：v2.0
-- 日期：2026-01-30
-- 说明：插入模块、场景、页面的初始化数据（业务场景改为可选）
-- ============================================================

-- ============================================================
-- 1. 初始化模块数据
-- ============================================================

INSERT INTO modules (module_code, module_name, icon, sort_order, status, description) VALUES
('market', '市场运营', 'bar-chart-3', 1, 'active', '市场运营模块'),
('customer', '客户运营', 'users', 2, 'active', '客户运营模块'),
('product', '产品运营', 'package', 3, 'active', '产品运营模块'),
('portal', '门户', 'home', 4, 'active', '门户模块'),
('system', '系统管理', 'settings', 5, 'active', '系统管理模块')
ON CONFLICT (module_code) DO NOTHING;

-- ============================================================
-- 2. 初始化场景数据
-- ============================================================

-- 一级场景
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, level, sort_order, status, description) VALUES
('public_market', '公众市场', 'market', '市场运营', 1, 1, 'active', '公众市场业务场景'),
('enterprise_market', '政企市场', 'market', '市场运营', 1, 2, 'active', '政企市场业务场景'),
('home_market', '家庭市场', 'market', '市场运营', 1, 3, 'active', '家庭市场业务场景'),
('product_market', '产品市场', 'product', '产品运营', 1, 4, 'active', '产品市场业务场景')
ON CONFLICT (scenario_code) DO NOTHING;

-- 获取一级场景ID（用于插入二级场景）
WITH public_market_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'public_market'
),
enterprise_market_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'enterprise_market'
),
home_market_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'home_market'
)

-- 二级场景：公众市场下的子场景
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, parent_scenario_id, level, sort_order, status, description)
SELECT
    scenario_code,
    scenario_name,
    module_code,
    module_name,
    parent_scenario_id,
    level,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market', '市场运营', 'market', '市场运营', (SELECT id FROM public_market_id), 2, 1, 'active', '市场运营场景'),
        ('customer', '客户运营', 'customer', '客户运营', (SELECT id FROM public_market_id), 2, 2, 'active', '客户运营场景'),
        ('product_operation', '产品运营', 'product', '产品运营', (SELECT id FROM public_market_id), 2, 3, 'active', '产品运营场景'),
        ('channel_operation', '渠道运营', 'market', '市场运营', (SELECT id FROM public_market_id), 2, 4, 'active', '渠道运营场景')
) AS v(scenario_code, scenario_name, module_code, module_name, parent_scenario_id, level, sort_order, status, description)
ON CONFLICT (scenario_code) DO NOTHING;

-- 三级场景：客户运营下的子场景
WITH customer_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'customer'
)
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, parent_scenario_id, level, sort_order, status, description)
SELECT
    scenario_code,
    scenario_name,
    module_code,
    module_name,
    parent_scenario_id,
    level,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('mid_high_end', '中高端', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 1, 'active', '中高端客户运营场景'),
        ('new_subscriptions', '新入网', 'market', '市场运营', (SELECT id FROM customer_id), 3, 2, 'active', '新入网场景'),
        ('group_customers', '集团成员客户', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 3, 'active', '集团成员客户场景'),
        ('global', '全球通', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 4, 'active', '全球通场景'),
        ('mid_high_end_warning', '中高端流失预警', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 5, 'active', '中高端流失预警场景'),
        ('international_operation', '国际业务运营', 'market', '市场运营', (SELECT id FROM customer_id), 3, 6, 'active', '国际业务运营场景'),
        ('silver_market', '银发市场', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 7, 'active', '银发市场场景'),
        ('young_market', '年轻市场', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 8, 'active', '年轻市场场景'),
        ('university_market', '高校市场', 'customer', '客户运营', (SELECT id FROM customer_id), 3, 9, 'active', '高校市场场景')
) AS v(scenario_code, scenario_name, module_code, module_name, parent_scenario_id, level, sort_order, status, description)
ON CONFLICT (scenario_code) DO NOTHING;

-- 二级场景：市场运营下的其他场景
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, level, sort_order, status, description)
VALUES
('churn', '离网维系', 'market', '市场运营', 2, 5, 'active', '离网维系场景')
ON CONFLICT (scenario_code) DO NOTHING;

-- ============================================================
-- 3. 初始化页面数据
-- ============================================================

-- ===== 有业务场景的页面 =====

-- 市场运营场景的页面
WITH market_scenario AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'market'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description)
SELECT
    'market.market.overview',
    '市场运营概览页',
    'overview',
    '/workspace/insight/market/overview',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    1,
    'active',
    '市场运营概览页面'
FROM market_scenario
ON CONFLICT (page_code) DO NOTHING;

INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    page_path,
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    TRUE,
    tree_config_id,
    sort_order,
    'active',
    description
FROM market_scenario, (
    VALUES
        ('market.market.tree.market_tree_1', '市场运营指标树1', 'tree', '/workspace/insight/market/tree/market-tree-1', 'market_tree_1', 2, '市场运营指标树1'),
        ('market.market.tree.market_tree_2', '市场运营指标树2', 'tree', '/workspace/insight/market/tree/market-tree-2', 'market_tree_2', 3, '市场运营指标树2')
) AS v(page_code, page_name, page_type, page_path, tree_config_id, sort_order, description)
ON CONFLICT (page_code) DO NOTHING;

-- 离网维系场景的页面
WITH churn_scenario AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'churn'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description)
SELECT
    'market.churn.overview',
    '离网维系概览页',
    'overview',
    '/workspace/insight/churn/overview',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    1,
    'active',
    '离网维系概览页面'
FROM churn_scenario
ON CONFLICT (page_code) DO NOTHING;

INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    page_path,
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    TRUE,
    tree_config_id,
    sort_order,
    'active',
    description
FROM churn_scenario, (
    VALUES
        ('market.churn.tree.monthly_all', '当月全量客户离网客户数', 'tree', '/workspace/insight/churn/tree/monthly-all', 'monthly_all', 2, '当月全量客户离网客户数指标树'),
        ('market.churn.tree.monthly_midhighend', '当月拍照中高端客户离网客户数', 'tree', '/workspace/insight/churn/tree/monthly-midhighend', 'monthly_midhighend', 3, '当月拍照中高端客户离网客户数指标树'),
        ('market.churn.tree.monthly_global', '当月拍照全球通客户离网客户数', 'tree', '/workspace/insight/churn/tree/monthly-global', 'monthly_global', 4, '当月拍照全球通客户离网客户数指标树')
) AS v(page_code, page_name, page_type, page_path, tree_config_id, sort_order, description)
ON CONFLICT (page_code) DO NOTHING;

-- 中高端客户运营场景的页面
WITH mid_high_end_scenario AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'mid_high_end'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description)
SELECT
    'market.mid_high_end.overview',
    '中高端客户运营概览页',
    'overview',
    '/workspace/insight/mid-high-end/overview',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    1,
    'active',
    '中高端客户运营概览页面'
FROM mid_high_end_scenario
ON CONFLICT (page_code) DO NOTHING;

INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    page_path,
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    TRUE,
    tree_config_id,
    sort_order,
    'active',
    description
FROM mid_high_end_scenario, (
    VALUES
        ('market.mid_high_end.tree.scale_retention', '拍照中高端客户规模保有率', 'tree', '/workspace/insight/mid-high-end/tree/scale-retention', 'scale_retention', 2, '拍照中高端客户规模保有率指标树'),
        ('market.mid_high_end.tree.value_retention', '拍照中高端客户价值保有率', 'tree', '/workspace/insight/mid-high-end/tree/value-retention', 'value_retention', 3, '拍照中高端客户价值保有率指标树'),
        ('market.mid_high_end.tree.decline_ratio', '中高端一降到底占比', 'tree', '/workspace/insight/mid-high-end/tree/decline-ratio', 'decline_ratio', 4, '中高端一降到底占比指标树')
) AS v(page_code, page_name, page_type, page_path, tree_config_id, sort_order, description)
ON CONFLICT (page_code) DO NOTHING;

-- 中高端流失预警场景的页面
WITH churn_warning_scenario AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'mid_high_end_warning'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description)
SELECT
    'market.churn_warning.overview',
    '中高端流失预警概览页',
    'overview',
    '/workspace/insight/churn-warning/overview',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    1,
    'active',
    '中高端流失预警概览页面'
FROM churn_warning_scenario
ON CONFLICT (page_code) DO NOTHING;

INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    'market.churn_warning.tree.warning_tree_1',
    '流失预警指标树1',
    'tree',
    '/workspace/insight/churn-warning/tree/warning-tree-1',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    TRUE,
    'warning_tree_1',
    2,
    'active',
    '流失预警指标树1'
FROM churn_warning_scenario
ON CONFLICT (page_code) DO NOTHING;

-- 新入网场景的页面
WITH new_subscriptions_scenario AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'new_subscriptions'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description)
SELECT
    'market.new_subscriptions.overview',
    '新入网概览页',
    'overview',
    '/workspace/insight/new-subscriptions/overview',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    1,
    'active',
    '新入网概览页面'
FROM new_subscriptions_scenario
ON CONFLICT (page_code) DO NOTHING;

-- 集团成员客户场景的页面
WITH group_customers_scenario AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'group_customers'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description)
SELECT
    'market.group_customers.overview',
    '集团成员客户概览页',
    'overview',
    '/workspace/insight/group-customers/overview',
    id,
    scenario_code,
    scenario_name,
    'market',
    '市场运营',
    1,
    'active',
    '集团成员客户概览页面'
FROM group_customers_scenario
ON CONFLICT (page_code) DO NOTHING;

-- ===== 无业务场景的页面（新增） =====

-- 门户模块的页面（无业务场景）
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description) VALUES
('portal.home', '门户首页', 'other', '/', NULL, NULL, NULL, 'portal', '门户', 1, 'active', '门户首页'),
('portal.profile', '个人中心', 'other', '/profile', NULL, NULL, NULL, 'portal', '门户', 2, 'active', '个人中心页面'),
('portal.settings', '系统设置', 'other', '/settings', NULL, NULL, NULL, 'portal', '门户', 3, 'active', '系统设置页面')
ON CONFLICT (page_code) DO NOTHING;

-- 系统管理模块的页面（无业务场景）
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status, description) VALUES
('system.dashboard', '系统管理首页', 'dashboard', '/workspace/system', NULL, NULL, NULL, 'system', '系统管理', 1, 'active', '系统管理首页'),
('system.page-management', '页面管理', 'other', '/workspace/system/page-management', NULL, NULL, NULL, 'system', '系统管理', 2, 'active', '页面管理页面'),
('system.rbac', '权限管理', 'other', '/workspace/system/rbac', NULL, NULL, NULL, 'system', '系统管理', 3, 'active', '权限管理页面')
ON CONFLICT (page_code) DO NOTHING;

-- ============================================================
-- 4. 验证数据
-- ============================================================

-- 统计各表的记录数
SELECT 'modules' as table_name, COUNT(*) as record_count FROM modules
UNION ALL
SELECT 'business_scenarios', COUNT(*) FROM business_scenarios
UNION ALL
SELECT 'pages', COUNT(*) FROM pages
UNION ALL
SELECT 'pages_with_scenario', COUNT(*) FROM pages WHERE scenario_id IS NOT NULL
UNION ALL
SELECT 'pages_without_scenario', COUNT(*) FROM pages WHERE scenario_id IS NULL;

-- 显示场景及其页面数量
SELECT 
    bs.scenario_code,
    bs.scenario_name,
    bs.module_name,
    bs.level,
    bs.sort_order,
    COUNT(p.id) as page_count
FROM business_scenarios bs
LEFT JOIN pages p ON bs.id = p.scenario_id AND p.status = 'active'
GROUP BY bs.id, bs.scenario_code, bs.scenario_name, bs.module_name, bs.level, bs.sort_order
ORDER BY bs.sort_order;

-- 显示无业务场景的页面
SELECT 
    page_code,
    page_name,
    page_type,
    page_path,
    module_name,
    sort_order,
    status
FROM pages
WHERE scenario_id IS NULL
ORDER BY sort_order;

-- ============================================================
-- 完成
-- ============================================================

-- 初始化数据插入完成
-- v2.0 的主要变化：
-- 1. 新增了无业务场景的页面（门户首页、个人中心、系统设置等）
-- 2. 页面可以不属于任何业务场景，更灵活
-- 3. 支持门户等全局页面
