-- ============================================================
-- 页面和场景管理系统 - 初始化数据脚本
-- 版本：v1.0
-- 日期：2026-01-30
-- 说明：插入模块、场景、页面的初始化数据
-- ============================================================

-- ============================================================
-- 1. 初始化模块数据
-- ============================================================

INSERT INTO modules (module_code, module_name, icon, sort_order, status, description) VALUES
('market', '市场运营', 'bar-chart-3', 1, 'active', '市场运营模块'),
('customer', '客户运营', 'users', 2, 'active', '客户运营模块'),
('product', '产品运营', 'package', 3, 'active', '产品运营模块'),
('portal', '门户', 'home', 4, 'active', '门户模块')
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

-- 市场运营场景的页面
WITH market_scenario_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'market'
)
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    scenario_id,
    module_code,
    page_path,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market.market.overview', '市场运营概览页', 'overview', (SELECT id FROM market_scenario_id), 'market', '/workspace/insight/market/overview', 1, 'active', '市场运营概览页面'),
        ('market.market.tree.market_tree_1', '市场运营指标树1', 'tree', (SELECT id FROM market_scenario_id), 'market', '/workspace/insight/market/tree/market-tree-1', 2, 'active', '市场运营指标树1'),
        ('market.market.tree.market_tree_2', '市场运营指标树2', 'tree', (SELECT id FROM market_scenario_id), 'market', '/workspace/insight/market/tree/market-tree-2', 3, 'active', '市场运营指标树2')
) AS v(page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status, description)
ON CONFLICT (page_code) DO NOTHING;

-- 离网维系场景的页面
WITH churn_scenario_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'churn'
)
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    scenario_id,
    module_code,
    page_path,
    is_tree_page,
    tree_config_id,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market.churn.overview', '离网维系概览页', 'overview', (SELECT id FROM churn_scenario_id), 'market', '/workspace/insight/churn/overview', FALSE, NULL, 1, 'active', '离网维系概览页面'),
        ('market.churn.tree.monthly_all', '当月全量客户离网客户数', 'tree', (SELECT id FROM churn_scenario_id), 'market', '/workspace/insight/churn/tree/monthly-all', TRUE, 'monthly_all', 2, 'active', '当月全量客户离网客户数指标树'),
        ('market.churn.tree.monthly_midhighend', '当月拍照中高端客户离网客户数', 'tree', (SELECT id FROM churn_scenario_id), 'market', '/workspace/insight/churn/tree/monthly-midhighend', TRUE, 'monthly_midhighend', 3, 'active', '当月拍照中高端客户离网客户数指标树'),
        ('market.churn.tree.monthly_global', '当月拍照全球通客户离网客户数', 'tree', (SELECT id FROM churn_scenario_id), 'market', '/workspace/insight/churn/tree/monthly-global', TRUE, 'monthly_global', 4, 'active', '当月拍照全球通客户离网客户数指标树')
) AS v(page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, tree_config_id, sort_order, status, description)
ON CONFLICT (page_code) DO NOTHING;

-- 中高端客户运营场景的页面
WITH mid_high_end_scenario_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'mid_high_end'
)
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    scenario_id,
    module_code,
    page_path,
    is_tree_page,
    tree_config_id,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market.mid_high_end.overview', '中高端客户运营概览页', 'overview', (SELECT id FROM mid_high_end_scenario_id), 'market', '/workspace/insight/mid-high-end/overview', FALSE, NULL, 1, 'active', '中高端客户运营概览页面'),
        ('market.mid_high_end.tree.scale_retention', '拍照中高端客户规模保有率', 'tree', (SELECT id FROM mid_high_end_scenario_id), 'market', '/workspace/insight/mid-high-end/tree/scale-retention', TRUE, 'scale_retention', 2, 'active', '拍照中高端客户规模保有率指标树'),
        ('market.mid_high_end.tree.value_retention', '拍照中高端客户价值保有率', 'tree', (SELECT id FROM mid_high_end_scenario_id), 'market', '/workspace/insight/mid-high-end/tree/value-retention', TRUE, 'value_retention', 3, 'active', '拍照中高端客户价值保有率指标树'),
        ('market.mid_high_end.tree.decline_ratio', '中高端一降到底占比', 'tree', (SELECT id FROM mid_high_end_scenario_id), 'market', '/workspace/insight/mid-high-end/tree/decline-ratio', TRUE, 'decline_ratio', 4, 'active', '中高端一降到底占比指标树')
) AS v(page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, tree_config_id, sort_order, status, description)
ON CONFLICT (page_code) DO NOTHING;

-- 中高端流失预警场景的页面
WITH churn_warning_scenario_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'mid_high_end_warning'
)
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, tree_config_id, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    scenario_id,
    module_code,
    page_path,
    is_tree_page,
    tree_config_id,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market.churn_warning.overview', '中高端流失预警概览页', 'overview', (SELECT id FROM churn_warning_scenario_id), 'market', '/workspace/insight/churn-warning/overview', FALSE, NULL, 1, 'active', '中高端流失预警概览页面'),
        ('market.churn_warning.tree.warning_tree_1', '流失预警指标树1', 'tree', (SELECT id FROM churn_warning_scenario_id), 'market', '/workspace/insight/churn-warning/tree/warning-tree-1', TRUE, 'warning_tree_1', 2, 'active', '流失预警指标树1')
) AS v(page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, tree_config_id, sort_order, status, description)
ON CONFLICT (page_code) DO NOTHING;

-- 新入网场景的页面
WITH new_subscriptions_scenario_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'new_subscriptions'
)
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    scenario_id,
    module_code,
    page_path,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market.new_subscriptions.overview', '新入网概览页', 'overview', (SELECT id FROM new_subscriptions_scenario_id), 'market', '/workspace/insight/new-subscriptions/overview', 1, 'active', '新入网概览页面')
) AS v(page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status, description)
ON CONFLICT (page_code) DO NOTHING;

-- 集团成员客户场景的页面
WITH group_customers_scenario_id AS (
    SELECT id FROM business_scenarios WHERE scenario_code = 'group_customers'
)
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status, description)
SELECT
    page_code,
    page_name,
    page_type,
    scenario_id,
    module_code,
    page_path,
    sort_order,
    status,
    description
FROM (
    VALUES
        ('market.group_customers.overview', '集团成员客户概览页', 'overview', (SELECT id FROM group_customers_scenario_id), 'market', '/workspace/insight/group-customers/overview', 1, 'active', '集团成员客户概览页面')
) AS v(page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status, description)
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
SELECT 'page_components', COUNT(*) FROM page_components;

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

-- ============================================================
-- 完成
-- ============================================================

-- 初始化数据插入完成
-- 可以开始使用页面和场景管理功能了
