-- ============================================================
-- 初始化页面数据
-- ============================================================

-- 1. 插入模块
INSERT INTO modules (module_code, module_name, icon, sort_order, status) VALUES
('PORTAL', '门户首页', 'home', 1, 'active'),
('CHURN_RETENTION', '离网维系', 'users', 2, 'active'),
('MID_HIGH_CUSTOMER', '中高端客户运营', 'trending-up', 3, 'active'),
('STRATEGY', '策略管理', 'target', 4, 'active'),
('DISPATCH', '调度管理', 'send', 5, 'active'),
('WORKSPACE', '工作台', 'layout', 6, 'active')
ON CONFLICT (module_code) DO NOTHING;

-- 2. 插入业务场景
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, level, sort_order, status) VALUES
-- 门户首页场景
('SCENARIO_PORTAL_HOME', '门户首页', 'PORTAL', '门户首页', 1, 1, 'active'),
('SCENARIO_PORTAL_OVERVIEW', '运营总览', 'PORTAL', '门户首页', 1, 2, 'active'),

-- 离网维系场景
('SCENARIO_CHURN_OVERVIEW', '离网维系概览', 'CHURN_RETENTION', '离网维系', 1, 1, 'active'),
('SCENARIO_CHURN_ALL', '当月全量客户离网客户数', 'CHURN_RETENTION', '离网维系', 1, 2, 'active'),
('SCENARIO_CHURN_MID_HIGH', '当月拍照中高端客户离网客户数', 'CHURN_RETENTION', '离网维系', 1, 3, 'active'),
('SCENARIO_CHURN_GLOBAL', '当月拍照全球通客户离网客户数', 'CHURN_RETENTION', '离网维系', 1, 4, 'active'),

-- 中高端客户运营场景
('SCENARIO_MID_HIGH_OVERVIEW', '中高端客户运营概览', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 1, 'active'),
('SCENARIO_MID_HIGH_VALUE', '拍照中高端价值保有率', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 2, 'active'),
('SCENARIO_OVER_PLAN', '超套客户规模', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 3, 'active'),
('SCENARIO_BROADBAND_MOBILE', '宽移融合率', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 4, 'active'),
('SCENARIO_INTERNET_ROAMING', '国际漫游客户', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 5, 'active'),
('SCENARIO_SEGMENT_MARKET', '细分市场客群', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 6, 'active'),
('SCENARIO_FAMILY_BROADBAND', '家庭宽带业务', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 7, 'active'),
('SCENARIO_5G_CUSTOMER', '5G用户发展', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 8, 'active'),
('SCENARIO_ENTERPRISE', '政企客户', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 9, 'active'),
('SCENARIO_CHANNEL', '渠道运营', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 10, 'active'),
('SCENARIO_SATISFACTION', '客户满意度', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 11, 'active'),
('SCENARIO_VALUE_ADDED', '增值业务', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 12, 'active'),
('SCENARIO_INTERNET_BUSINESS', '国际业务收入', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 13, 'active'),
('SCENARIO_STOCK_CUSTOMER', '存量客户运营', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 14, 'active'),
('SCENARIO_NEW_BUSINESS', '新业务拓展', 'MID_HIGH_CUSTOMER', '中高端客户运营', 1, 15, 'active'),

-- 策略管理场景
('SCENARIO_STRATEGY_METRICS', '指标策略', 'STRATEGY', '策略管理', 1, 1, 'active'),
('SCENARIO_STRATEGY_LIST', '策略列表', 'STRATEGY', '策略管理', 1, 2, 'active'),

-- 调度管理场景
('SCENARIO_DISPATCH_SUBMIT', '工单提交', 'DISPATCH', '调度管理', 1, 1, 'active'),
('SCENARIO_DISPATCH_PROCESS', '工单处理', 'DISPATCH', '调度管理', 1, 2, 'active'),
('SCENARIO_DISPATCH_QUERY', '工单查询', 'DISPATCH', '调度管理', 1, 3, 'active'),
('SCENARIO_DISPATCH_CONFIG', '工单配置', 'DISPATCH', '调度管理', 1, 4, 'active'),

-- 工作台场景
('SCENARIO_WORKSPACE_HOME', '工作台首页', 'WORKSPACE', '工作台', 1, 1, 'active'),
('SCENARIO_CHURN_OVERVIEW_WORKSPACE', '离网维系概览（工作台）', 'WORKSPACE', '工作台', 1, 2, 'active'),
('SCENARIO_CHURN_TREE', '离网维系指标树', 'WORKSPACE', '工作台', 1, 3, 'active'),
('SCENARIO_MARKET_OVERVIEW', '市场总览', 'WORKSPACE', '工作台', 1, 4, 'active')
ON CONFLICT (scenario_code) DO NOTHING;

-- 3. 插入页面
-- 门户首页
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, sort_order, status) VALUES
('PAGE_PORTAL_HOME', '门户首页', 'PORTAL', '/', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_PORTAL_HOME'), 'SCENARIO_PORTAL_HOME', '门户首页', 'PORTAL', '门户首页', false, 1, 'active'),
('PAGE_PORTAL_OVERVIEW', '运营总览', 'OVERVIEW', '/portal', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_PORTAL_OVERVIEW'), 'SCENARIO_PORTAL_OVERVIEW', '运营总览', 'PORTAL', '门户首页', false, 2, 'active')
ON CONFLICT (page_code) DO NOTHING;

-- 离网维系页面
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, sort_order, status) VALUES
('PAGE_CHURN_RETENTION', '离网维系', 'OVERVIEW', '/portal/churn-retention', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHURN_OVERVIEW'), 'SCENARIO_CHURN_OVERVIEW', '离网维系概览', 'CHURN_RETENTION', '离网维系', false, 1, 'active'),
('PAGE_CHURN_ALL', '当月全量客户离网客户数指标树', 'TREE', '/portal/churn-retention#all-churn', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHURN_ALL'), 'SCENARIO_CHURN_ALL', '当月全量客户离网客户数', 'CHURN_RETENTION', '离网维系', true, 2, 'active'),
('PAGE_CHURN_MID_HIGH', '当月拍照中高端客户离网客户数指标树', 'TREE', '/portal/churn-retention#mid-high-churn', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHURN_MID_HIGH'), 'SCENARIO_CHURN_MID_HIGH', '当月拍照中高端客户离网客户数', 'CHURN_RETENTION', '离网维系', true, 3, 'active'),
('PAGE_CHURN_GLOBAL', '当月拍照全球通客户离网客户数指标树', 'TREE', '/portal/churn-retention#global-churn', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHURN_GLOBAL'), 'SCENARIO_CHURN_GLOBAL', '当月拍照全球通客户离网客户数', 'CHURN_RETENTION', '离网维系', true, 4, 'active')
ON CONFLICT (page_code) DO NOTHING;

-- 中高端客户运营页面
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, sort_order, status) VALUES
('PAGE_MID_HIGH_CUSTOMER', '中高端客户运营', 'OVERVIEW', '/portal/mid-high-customer-operations', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_MID_HIGH_OVERVIEW'), 'SCENARIO_MID_HIGH_OVERVIEW', '中高端客户运营概览', 'MID_HIGH_CUSTOMER', '中高端客户运营', false, 1, 'active'),
('PAGE_MID_HIGH_VALUE', '拍照中高端价值保有率指标树', 'TREE', '/portal/mid-high-customer-operations#tree', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_MID_HIGH_VALUE'), 'SCENARIO_MID_HIGH_VALUE', '拍照中高端价值保有率', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 2, 'active'),
('PAGE_OVER_PLAN', '超套客户规模指标树', 'TREE', '/portal/mid-high-customer-operations#over-plan', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_OVER_PLAN'), 'SCENARIO_OVER_PLAN', '超套客户规模', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 3, 'active'),
('PAGE_BROADBAND_MOBILE', '宽移融合率指标树', 'TREE', '/portal/mid-high-customer-operations#broadband-mobile', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_BROADBAND_MOBILE'), 'SCENARIO_BROADBAND_MOBILE', '宽移融合率', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 4, 'active'),
('PAGE_INTERNET_ROAMING', '国际漫游客户指标树', 'TREE', '/portal/mid-high-customer-operations#internet-roaming', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_INTERNET_ROAMING'), 'SCENARIO_INTERNET_ROAMING', '国际漫游客户', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 5, 'active'),
('PAGE_SEGMENT_MARKET', '细分市场客群指标树', 'TREE', '/portal/mid-high-customer-operations#segment-market', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_SEGMENT_MARKET'), 'SCENARIO_SEGMENT_MARKET', '细分市场客群', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 6, 'active'),
('PAGE_FAMILY_BROADBAND', '家庭宽带业务指标树', 'TREE', '/portal/mid-high-customer-operations#family-broadband', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_FAMILY_BROADBAND'), 'SCENARIO_FAMILY_BROADBAND', '家庭宽带业务', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 7, 'active'),
('PAGE_5G_CUSTOMER', '5G用户发展指标树', 'TREE', '/portal/mid-high-customer-operations#5g-customer', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_5G_CUSTOMER'), 'SCENARIO_5G_CUSTOMER', '5G用户发展', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 8, 'active'),
('PAGE_ENTERPRISE', '政企客户指标树', 'TREE', '/portal/mid-high-customer-operations#enterprise', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_ENTERPRISE'), 'SCENARIO_ENTERPRISE', '政企客户', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 9, 'active'),
('PAGE_CHANNEL', '渠道运营指标树', 'TREE', '/portal/mid-high-customer-operations#channel', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHANNEL'), 'SCENARIO_CHANNEL', '渠道运营', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 10, 'active'),
('PAGE_SATISFACTION', '客户满意度指标树', 'TREE', '/portal/mid-high-customer-operations#satisfaction', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_SATISFACTION'), 'SCENARIO_SATISFACTION', '客户满意度', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 11, 'active'),
('PAGE_VALUE_ADDED', '增值业务指标树', 'TREE', '/portal/mid-high-customer-operations#value-added', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_VALUE_ADDED'), 'SCENARIO_VALUE_ADDED', '增值业务', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 12, 'active'),
('PAGE_INTERNET_BUSINESS', '国际业务收入指标树', 'TREE', '/portal/mid-high-customer-operations#internet-business', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_INTERNET_BUSINESS'), 'SCENARIO_INTERNET_BUSINESS', '国际业务收入', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 13, 'active'),
('PAGE_STOCK_CUSTOMER', '存量客户运营指标树', 'TREE', '/portal/mid-high-customer-operations#stock-customer', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_STOCK_CUSTOMER'), 'SCENARIO_STOCK_CUSTOMER', '存量客户运营', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 14, 'active'),
('PAGE_NEW_BUSINESS', '新业务拓展指标树', 'TREE', '/portal/mid-high-customer-operations#new-business', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_NEW_BUSINESS'), 'SCENARIO_NEW_BUSINESS', '新业务拓展', 'MID_HIGH_CUSTOMER', '中高端客户运营', true, 15, 'active')
ON CONFLICT (page_code) DO NOTHING;

-- 策略管理页面
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, sort_order, status) VALUES
('PAGE_STRATEGY_METRICS', '指标策略', 'LIST', '/workspace/strategy/metrics', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_STRATEGY_METRICS'), 'SCENARIO_STRATEGY_METRICS', '指标策略', 'STRATEGY', '策略管理', false, 1, 'active'),
('PAGE_STRATEGY_LIST', '策略列表', 'LIST', '/workspace/strategy/list', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_STRATEGY_LIST'), 'SCENARIO_STRATEGY_LIST', '策略列表', 'STRATEGY', '策略管理', false, 2, 'active')
ON CONFLICT (page_code) DO NOTHING;

-- 调度管理页面
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, sort_order, status) VALUES
('PAGE_DISPATCH_SUBMIT', '工单提交', 'FORM', '/workspace/dispatch/submit', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_DISPATCH_SUBMIT'), 'SCENARIO_DISPATCH_SUBMIT', '工单提交', 'DISPATCH', '调度管理', false, 1, 'active'),
('PAGE_DISPATCH_PROCESS', '工单处理', 'LIST', '/workspace/dispatch/process', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_DISPATCH_PROCESS'), 'SCENARIO_DISPATCH_PROCESS', '工单处理', 'DISPATCH', '调度管理', false, 2, 'active'),
('PAGE_DISPATCH_QUERY', '工单查询', 'LIST', '/workspace/dispatch/query', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_DISPATCH_QUERY'), 'SCENARIO_DISPATCH_QUERY', '工单查询', 'DISPATCH', '调度管理', false, 3, 'active'),
('PAGE_DISPATCH_CONFIG_TYPE', '工单类型管理', 'FORM', '/workspace/dispatch/config/type', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_DISPATCH_CONFIG'), 'SCENARIO_DISPATCH_CONFIG', '工单配置', 'DISPATCH', '调度管理', false, 4, 'active'),
('PAGE_DISPATCH_CONFIG_PROCESS', '流程配置', 'FORM', '/workspace/dispatch/config/process', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_DISPATCH_CONFIG'), 'SCENARIO_DISPATCH_CONFIG', '工单配置', 'DISPATCH', '调度管理', false, 5, 'active')
ON CONFLICT (page_code) DO NOTHING;

-- 工作台页面
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, sort_order, status) VALUES
('PAGE_WORKSPACE_HOME', '工作台首页', 'DASHBOARD', '/workspace', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_WORKSPACE_HOME'), 'SCENARIO_WORKSPACE_HOME', '工作台首页', 'WORKSPACE', '工作台', false, 1, 'active'),
('PAGE_CHURN_OVERVIEW_WORKSPACE', '离网维系概览（工作台）', 'OVERVIEW', '/workspace/insight/churn/overview', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHURN_OVERVIEW_WORKSPACE'), 'SCENARIO_CHURN_OVERVIEW_WORKSPACE', '离网维系概览（工作台）', 'WORKSPACE', '工作台', false, 2, 'active'),
('PAGE_CHURN_TREE_WORKSPACE', '离网维系指标树（工作台）', 'TREE', '/workspace/insight/churn/tree', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_CHURN_TREE'), 'SCENARIO_CHURN_TREE', '离网维系指标树', 'WORKSPACE', '工作台', true, 3, 'active'),
('PAGE_MARKET_OVERVIEW_WORKSPACE', '市场总览（工作台）', 'OVERVIEW', '/workspace/insight/market/overview', (SELECT id FROM business_scenarios WHERE scenario_code = 'SCENARIO_MARKET_OVERVIEW'), 'SCENARIO_MARKET_OVERVIEW', '市场总览', 'WORKSPACE', '工作台', false, 4, 'active')
ON CONFLICT (page_code) DO NOTHING;

-- 4. 更新报告关联配置（使用新的page_code）
UPDATE report_associations SET page_id = 'PAGE_CHURN_ALL' WHERE page_id = 'portal.churn.all-churn';
UPDATE report_associations SET page_id = 'PAGE_CHURN_MID_HIGH' WHERE page_id = 'portal.churn.mid-high-churn';
UPDATE report_associations SET page_id = 'PAGE_CHURN_TREE_WORKSPACE' WHERE page_id = 'insight.churn.tree';
