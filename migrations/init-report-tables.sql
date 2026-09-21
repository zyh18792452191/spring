-- ============================================================
-- 报告管理数据库表
-- ============================================================

-- 报告模板表
CREATE TABLE IF NOT EXISTS report_templates (
  id BIGSERIAL PRIMARY KEY,
  template_code VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  description TEXT,
  business_scenario VARCHAR(100),
  content_config JSONB,
  status VARCHAR(20) DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by BIGINT,
  updated_by BIGINT
);

-- 报告表
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  report_code VARCHAR(100) UNIQUE NOT NULL,
  report_name VARCHAR(200) NOT NULL,
  template_id BIGINT REFERENCES report_templates(id),
  report_type VARCHAR(50),
  report_period VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  content TEXT,
  content_config JSONB,
  schedule_config JSONB,
  generated_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by BIGINT,
  updated_by BIGINT
);

-- 报告关联配置表
CREATE TABLE IF NOT EXISTS report_associations (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT REFERENCES reports(id) ON DELETE CASCADE,
  template_id BIGINT REFERENCES report_templates(id) ON DELETE CASCADE,
  association_type VARCHAR(50) NOT NULL,
  page_id VARCHAR(100),
  target_id VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  display_priority INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by BIGINT,
  updated_by BIGINT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_report_templates_code ON report_templates(template_code);
CREATE INDEX IF NOT EXISTS idx_report_templates_status ON report_templates(status);
CREATE INDEX IF NOT EXISTS idx_report_templates_scenario ON report_templates(business_scenario);

CREATE INDEX IF NOT EXISTS idx_reports_code ON reports(report_code);
CREATE INDEX IF NOT EXISTS idx_reports_template_id ON reports(template_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);

CREATE INDEX IF NOT EXISTS idx_report_associations_report_id ON report_associations(report_id);
CREATE INDEX IF NOT EXISTS idx_report_associations_template_id ON report_associations(template_id);
CREATE INDEX IF NOT EXISTS idx_report_associations_type ON report_associations(association_type);
CREATE INDEX IF NOT EXISTS idx_report_associations_page_id ON report_associations(page_id);
CREATE INDEX IF NOT EXISTS idx_report_associations_target_id ON report_associations(target_id);
