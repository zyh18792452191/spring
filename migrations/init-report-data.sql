-- ============================================================
-- 报告管理初始化数据
-- ============================================================

-- 插入测试报告模板
INSERT INTO report_templates (template_code, template_name, template_type, description, business_scenario, status, sort_order) VALUES
('TPL_001', '中高端客户运营分析模板', 'monthly', '中高端客户运营分析报告模板', 'mid_high_customer', 'active', 1),
('TPL_002', '离网维系分析模板', 'monthly', '离网维系分析报告模板', 'churn_retention', 'active', 2),
('TPL_003', '客户保有率分析模板', 'monthly', '客户保有率分析报告模板', 'customer_retention', 'active', 3)
ON CONFLICT (template_code) DO NOTHING;

-- 插入测试报告
INSERT INTO reports (report_code, report_name, template_id, report_type, report_period, status, metadata, sort_order) VALUES
('RPT_001', '中高端客户运营分析报告 - 2025年1月', (SELECT id FROM report_templates WHERE template_code = 'TPL_001'), '月报', '2025-01', 'generated', '{"tags": ["中高端", "客户运营"]}', 1),
('RPT_002', '离网维系分析报告 - 2025年1月', (SELECT id FROM report_templates WHERE template_code = 'TPL_002'), '月报', '2025-01', 'generated', '{"tags": ["离网", "维系"]}', 2),
('RPT_003', '客户保有率分析报告 - 2025年1月', (SELECT id FROM report_templates WHERE template_code = 'TPL_003'), '月报', '2025-01', 'generated', '{"tags": ["保有率"]}', 3)
ON CONFLICT (report_code) DO NOTHING;

-- 插入报告关联配置（让报告显示在门户离网维系指标树页面）
INSERT INTO report_associations (report_id, association_type, page_id, is_default, display_priority)
SELECT
  r.id,
  'page',
  'portal.churn.all-churn',
  true,
  1
FROM reports r
WHERE r.report_code = 'RPT_002'
ON CONFLICT DO NOTHING;

-- 插入报告关联配置（让报告显示在门户中高端客户指标树页面）
INSERT INTO report_associations (report_id, association_type, page_id, is_default, display_priority)
SELECT
  r.id,
  'page',
  'portal.churn.mid-high-churn',
  true,
  1
FROM reports r
WHERE r.report_code = 'RPT_001'
ON CONFLICT DO NOTHING;

-- 插入报告关联配置（让报告显示在工作台离网维系指标树页面）
INSERT INTO report_associations (report_id, association_type, page_id, is_default, display_priority)
SELECT
  r.id,
  'page',
  'insight.churn.tree',
  true,
  1
FROM reports r
WHERE r.report_code = 'RPT_002'
ON CONFLICT DO NOTHING;
