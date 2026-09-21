-- ============================================================
-- 页面和场景管理系统 - 数据库初始化脚本
-- 版本：v1.0
-- 日期：2026-01-30
-- 说明：创建业务场景、页面、模块相关的表结构
-- ============================================================

-- ============================================================
-- 1. 模块表（可选，用于统一管理模块）
-- ============================================================

CREATE TABLE IF NOT EXISTS modules (
    id BIGSERIAL PRIMARY KEY,
    module_code VARCHAR(50) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_modules_module_code ON modules(module_code);
CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_sort_order ON modules(sort_order);

-- ============================================================
-- 2. 业务场景表
-- ============================================================

CREATE TABLE IF NOT EXISTS business_scenarios (
    id BIGSERIAL PRIMARY KEY,
    scenario_code VARCHAR(50) NOT NULL UNIQUE,
    scenario_name VARCHAR(100) NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    parent_scenario_id BIGINT,
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_scenario_parent FOREIGN KEY (parent_scenario_id) REFERENCES business_scenarios(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_business_scenarios_module_code ON business_scenarios(module_code);
CREATE INDEX IF NOT EXISTS idx_business_scenarios_parent_id ON business_scenarios(parent_scenario_id);
CREATE INDEX IF NOT EXISTS idx_business_scenarios_status ON business_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_business_scenarios_sort_order ON business_scenarios(sort_order);

-- ============================================================
-- 3. 页面表
-- ============================================================

CREATE TABLE IF NOT EXISTS pages (
    id BIGSERIAL PRIMARY KEY,
    page_code VARCHAR(100) NOT NULL UNIQUE,
    page_name VARCHAR(200) NOT NULL,
    page_type VARCHAR(50) NOT NULL,
    scenario_id BIGINT NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    page_path VARCHAR(500) NOT NULL,
    is_tree_page BOOLEAN DEFAULT FALSE,
    tree_config_id VARCHAR(100),
    has_components BOOLEAN DEFAULT FALSE,
    component_config JSONB,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_page_scenario FOREIGN KEY (scenario_id) REFERENCES business_scenarios(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_pages_scenario_id ON pages(scenario_id);
CREATE INDEX IF NOT EXISTS idx_pages_module_code ON pages(module_code);
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_sort_order ON pages(sort_order);
CREATE INDEX IF NOT EXISTS idx_pages_page_code ON pages(page_code);

-- ============================================================
-- 4. 页面组件表（未来扩展）
-- ============================================================

CREATE TABLE IF NOT EXISTS page_components (
    id BIGSERIAL PRIMARY KEY,
    component_code VARCHAR(100) NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    page_id BIGINT NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    parent_component_id BIGINT,
    component_config JSONB,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_component_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    CONSTRAINT fk_component_parent FOREIGN KEY (parent_component_id) REFERENCES page_components(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_page_components_page_id ON page_components(page_id);
CREATE INDEX IF NOT EXISTS idx_page_components_parent_id ON page_components(parent_component_id);
CREATE INDEX IF NOT EXISTS idx_page_components_status ON page_components(status);
CREATE INDEX IF NOT EXISTS idx_page_components_sort_order ON page_components(sort_order);

-- ============================================================
-- 5. 创建视图（便于查询）
-- ============================================================

-- 场景统计视图
CREATE OR REPLACE VIEW scenario_stats AS
SELECT 
    bs.id,
    bs.scenario_code,
    bs.scenario_name,
    bs.module_code,
    bs.module_name,
    bs.parent_scenario_id,
    bs.level,
    bs.sort_order,
    bs.status,
    COUNT(p.id) AS page_count,
    bs.created_at,
    bs.updated_at
FROM business_scenarios bs
LEFT JOIN pages p ON bs.id = p.scenario_id AND p.status = 'active'
GROUP BY bs.id;

-- 页面完整信息视图
CREATE OR REPLACE VIEW page_full_info AS
SELECT 
    p.id,
    p.page_code,
    p.page_name,
    p.page_type,
    p.scenario_id,
    bs.scenario_code,
    bs.scenario_name,
    p.module_code,
    p.page_path,
    p.is_tree_page,
    p.tree_config_id,
    p.has_components,
    p.sort_order,
    p.status,
    p.description,
    p.metadata,
    p.created_at,
    p.updated_at
FROM pages p
JOIN business_scenarios bs ON p.scenario_id = bs.id;

-- ============================================================
-- 6. 创建函数（自动更新 updated_at）
-- ============================================================

-- 模块表更新时间函数
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_modules_updated_at
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_modules_updated_at();

-- 场景表更新时间函数
CREATE OR REPLACE FUNCTION update_business_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_scenarios_updated_at
BEFORE UPDATE ON business_scenarios
FOR EACH ROW
EXECUTE FUNCTION update_business_scenarios_updated_at();

-- 页面表更新时间函数
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pages_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE FUNCTION update_pages_updated_at();

-- 页面组件表更新时间函数
CREATE OR REPLACE FUNCTION update_page_components_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_page_components_updated_at
BEFORE UPDATE ON page_components
FOR EACH ROW
EXECUTE FUNCTION update_page_components_updated_at();

-- ============================================================
-- 完成
-- ============================================================

COMMENT ON TABLE modules IS '模块表';
COMMENT ON TABLE business_scenarios IS '业务场景表';
COMMENT ON TABLE pages IS '页面表';
COMMENT ON TABLE page_components IS '页面组件表（未来扩展）';
COMMENT ON VIEW scenario_stats IS '场景统计视图';
COMMENT ON VIEW page_full_info IS '页面完整信息视图';
