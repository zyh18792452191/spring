-- 创建模块表
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  module_code VARCHAR(100) UNIQUE NOT NULL,
  module_name VARCHAR(200) NOT NULL,
  icon VARCHAR(100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建业务场景表
CREATE TABLE IF NOT EXISTS business_scenarios (
  id SERIAL PRIMARY KEY,
  scenario_code VARCHAR(100) UNIQUE NOT NULL,
  scenario_name VARCHAR(200) NOT NULL,
  module_code VARCHAR(100) NOT NULL,
  module_name VARCHAR(200) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_business_scenarios_module FOREIGN KEY (module_code) REFERENCES modules(module_code) ON DELETE CASCADE
);

-- 创建页面表
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  page_code VARCHAR(100) UNIQUE NOT NULL,
  page_name VARCHAR(200) NOT NULL,
  page_type VARCHAR(50) NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  scenario_id INTEGER NOT NULL,
  scenario_code VARCHAR(100) NOT NULL,
  scenario_name VARCHAR(200) NOT NULL,
  module_code VARCHAR(100) NOT NULL,
  module_name VARCHAR(200) NOT NULL,
  is_tree_page BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_pages_scenario FOREIGN KEY (scenario_id) REFERENCES business_scenarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_pages_module FOREIGN KEY (module_code) REFERENCES modules(module_code) ON DELETE CASCADE
);

-- 创建页面区域表
CREATE TABLE IF NOT EXISTS page_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL,
  section_code VARCHAR(100) NOT NULL,
  section_name VARCHAR(200) NOT NULL,
  section_type VARCHAR(50) NOT NULL DEFAULT 'CONTENT',
  section_config TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_page_sections_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE(page_id, section_code)
);

-- 创建报告模板表
CREATE TABLE IF NOT EXISTS report_templates (
  id SERIAL PRIMARY KEY,
  template_code VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  template_config TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建报告表
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  report_code VARCHAR(100) UNIQUE NOT NULL,
  report_name VARCHAR(200) NOT NULL,
  template_id INTEGER NOT NULL,
  template_code VARCHAR(100) NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  content TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_reports_template FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE CASCADE
);

-- 创建报告关联配置表
CREATE TABLE IF NOT EXISTS report_associations (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  report_code VARCHAR(100) NOT NULL,
  report_name VARCHAR(200) NOT NULL,
  page_id VARCHAR(100) NOT NULL,
  page_name VARCHAR(200) NOT NULL,
  association_type VARCHAR(20) NOT NULL DEFAULT 'template',
  priority INTEGER NOT NULL DEFAULT 0,
  tags TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_associations_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(module_code);
CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);

CREATE INDEX IF NOT EXISTS idx_business_scenarios_code ON business_scenarios(scenario_code);
CREATE INDEX IF NOT EXISTS idx_business_scenarios_module_code ON business_scenarios(module_code);
CREATE INDEX IF NOT EXISTS idx_business_scenarios_status ON business_scenarios(status);

CREATE INDEX IF NOT EXISTS idx_pages_code ON pages(page_code);
CREATE INDEX IF NOT EXISTS idx_pages_scenario_code ON pages(scenario_code);
CREATE INDEX IF NOT EXISTS idx_pages_module_code ON pages(module_code);
CREATE INDEX IF NOT EXISTS idx_pages_is_tree_page ON pages(is_tree_page);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_status ON page_sections(status);

CREATE INDEX IF NOT EXISTS idx_report_templates_code ON report_templates(template_code);
CREATE INDEX IF NOT EXISTS idx_report_templates_status ON report_templates(status);

CREATE INDEX IF NOT EXISTS idx_reports_code ON reports(report_code);
CREATE INDEX IF NOT EXISTS idx_reports_template_id ON reports(template_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

CREATE INDEX IF NOT EXISTS idx_report_associations_report_id ON report_associations(report_id);
CREATE INDEX IF NOT EXISTS idx_report_associations_page_id ON report_associations(page_id);
CREATE INDEX IF NOT EXISTS idx_report_associations_status ON report_associations(status);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加更新时间戳的触发器
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_scenarios_updated_at BEFORE UPDATE ON business_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_associations_updated_at BEFORE UPDATE ON report_associations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建素材表
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  material_code VARCHAR(100) UNIQUE NOT NULL,
  material_name VARCHAR(500) NOT NULL,
  material_type VARCHAR(50) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'national',
  file_key VARCHAR(500) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  file_mime_type VARCHAR(100),
  cover_key VARCHAR(500),
  cover_url TEXT,
  copyright_info VARCHAR(20) NOT NULL,
  copyright_statement VARCHAR(500) NOT NULL,
  copyright_proof_key VARCHAR(500),
  copyright_proof_url TEXT,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建素材关联表
CREATE TABLE IF NOT EXISTS material_associations (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, material_id),
  CONSTRAINT fk_material_associations_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- 创建素材表索引
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(material_code);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_materials_business_type ON materials(business_type);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_created_by ON materials(created_by);

-- 创建素材关联表索引
CREATE INDEX IF NOT EXISTS idx_material_associations_task_id ON material_associations(task_id);
CREATE INDEX IF NOT EXISTS idx_material_associations_material_id ON material_associations(material_id);

-- 为素材表添加更新时间戳的触发器
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建表单模板配置表
CREATE TABLE IF NOT EXISTS form_templates (
  id SERIAL PRIMARY KEY,
  template_code VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  description TEXT,
  form_config TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建运营任务表
CREATE TABLE IF NOT EXISTS operational_tasks (
  id SERIAL PRIMARY KEY,
  task_code VARCHAR(100) UNIQUE NOT NULL,
  task_name VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_days INTEGER NOT NULL,
  form_template_id INTEGER,
  form_template_name VARCHAR(200),
  form_data TEXT NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建表单模板表索引
CREATE INDEX IF NOT EXISTS idx_form_templates_code ON form_templates(template_code);
CREATE INDEX IF NOT EXISTS idx_form_templates_status ON form_templates(status);

-- 创建运营任务表索引
CREATE INDEX IF NOT EXISTS idx_operational_tasks_code ON operational_tasks(task_code);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_status ON operational_tasks(status);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_start_time ON operational_tasks(start_time);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_end_time ON operational_tasks(end_time);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_created_by ON operational_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_form_template_id ON operational_tasks(form_template_id);

-- 为表单模板表添加更新时间戳的触发器
CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为运营任务表添加更新时间戳的触发器
CREATE TRIGGER update_operational_tasks_updated_at BEFORE UPDATE ON operational_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
