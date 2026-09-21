# 页面和场景管理系统 - 数据库设计

## 背景

当前页面和场景的关联关系硬编码在 `src/lib/report-association/page-groups.ts` 中，缺乏后台管理界面。需要设计一套完整的数据库表结构和管理界面，支持：
- 场景管理（新增、编辑、删除）
- 页面管理（新增、编辑、删除）
- 页面-场景关联配置
- 页面元数据管理

## 数据库设计

### 1. 业务场景表（business_scenarios）

```sql
-- 业务场景表
CREATE TABLE business_scenarios (
    id BIGSERIAL PRIMARY KEY,
    scenario_code VARCHAR(50) NOT NULL UNIQUE COMMENT '场景编码',
    scenario_name VARCHAR(100) NOT NULL COMMENT '场景名称',
    module_code VARCHAR(50) NOT NULL COMMENT '模块编码',
    module_name VARCHAR(100) NOT NULL COMMENT '模块名称',
    parent_scenario_id BIGINT COMMENT '父场景ID，支持层级结构',
    level INTEGER DEFAULT 1 COMMENT '场景层级，1-一级，2-二级，3-三级',
    sort_order INTEGER DEFAULT 0 COMMENT '排序号',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-启用，inactive-停用',
    description TEXT COMMENT '场景描述',
    metadata JSONB COMMENT '扩展元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID'
);

-- 索引
CREATE INDEX idx_business_scenarios_module_code ON business_scenarios(module_code);
CREATE INDEX idx_business_scenarios_parent_id ON business_scenarios(parent_scenario_id);
CREATE INDEX idx_business_scenarios_status ON business_scenarios(status);
CREATE INDEX idx_business_scenarios_sort_order ON business_scenarios(sort_order);
```

**字段说明**：
- `scenario_code`: 场景编码，如 `churn`, `mid_high_end`
- `scenario_name`: 场景名称，如 `离网维系`, `中高端客户运营`
- `module_code`: 模块编码，如 `market`
- `module_name`: 模块名称，如 `市场运营`
- `parent_scenario_id`: 支持层级结构（如：公众市场 → 客户运营 → 中高端）
- `level`: 场景层级，用于排序和展示
- `sort_order`: 排序号
- `status`: 状态控制
- `metadata`: JSONB格式，存储扩展信息

### 2. 页面表（pages）

```sql
-- 页面表
CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    page_code VARCHAR(100) NOT NULL UNIQUE COMMENT '页面编码，如：market.churn.overview',
    page_name VARCHAR(200) NOT NULL COMMENT '页面名称',
    page_type VARCHAR(50) NOT NULL COMMENT '页面类型：overview-概览页，tree-指标树，dashboard-仪表板',
    scenario_id BIGINT NOT NULL COMMENT '所属场景ID',
    module_code VARCHAR(50) NOT NULL COMMENT '所属模块编码',
    page_path VARCHAR(500) NOT NULL COMMENT '页面路径，如：/workspace/insight/churn/overview',
    is_tree_page BOOLEAN DEFAULT FALSE COMMENT '是否为指标树页面',
    tree_config_id VARCHAR(100) COMMENT '指标树配置ID',
    has_components BOOLEAN DEFAULT FALSE COMMENT '是否有子组件（未来扩展）',
    component_config JSONB COMMENT '组件配置（未来扩展）',
    sort_order INTEGER DEFAULT 0 COMMENT '排序号',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-启用，inactive-停用',
    description TEXT COMMENT '页面描述',
    metadata JSONB COMMENT '扩展元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    FOREIGN KEY (scenario_id) REFERENCES business_scenarios(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_pages_scenario_id ON pages(scenario_id);
CREATE INDEX idx_pages_module_code ON pages(module_code);
CREATE INDEX idx_pages_page_type ON pages(page_type);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_sort_order ON pages(sort_order);
CREATE INDEX idx_pages_page_code ON pages(page_code);
```

**字段说明**：
- `page_code`: 页面编码，格式：`{module}.{scenario}.{page_type}.{unique_id}`，如 `market.churn.overview`
- `page_name`: 页面名称，如 `离网维系概览页`
- `page_type`: 页面类型（概览页、指标树、仪表板）
- `scenario_id`: 关联场景ID
- `module_code`: 所属模块编码
- `page_path`: 页面访问路径
- `is_tree_page`: 是否为指标树页面
- `tree_config_id`: 指标树配置ID（如果是指标树页面）
- `has_components`: 是否有子组件（未来扩展组件级别）
- `component_config`: 组件配置（JSONB格式，未来扩展）
- `sort_order`: 排序号
- `status`: 状态控制
- `metadata`: JSONB格式，存储扩展信息

### 3. 页面组件表（page_components） - 未来扩展

```sql
-- 页面组件表（未来扩展）
CREATE TABLE page_components (
    id BIGSERIAL PRIMARY KEY,
    component_code VARCHAR(100) NOT NULL COMMENT '组件编码',
    component_name VARCHAR(200) NOT NULL COMMENT '组件名称',
    page_id BIGINT NOT NULL COMMENT '所属页面ID',
    component_type VARCHAR(50) NOT NULL COMMENT '组件类型：metrics-指标，chart-图表，table-表格，custom-自定义',
    parent_component_id BIGINT COMMENT '父组件ID，支持组件嵌套',
    component_config JSONB COMMENT '组件配置',
    sort_order INTEGER DEFAULT 0 COMMENT '排序号',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-启用，inactive-停用',
    description TEXT COMMENT '组件描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_page_components_page_id ON page_components(page_id);
CREATE INDEX idx_page_components_parent_id ON page_components(parent_component_id);
CREATE INDEX idx_page_components_status ON page_components(status);
CREATE INDEX idx_page_components_sort_order ON page_components(sort_order);
```

### 4. 模块表（modules） - 可选

```sql
-- 模块表（可选，用于统一管理模块）
CREATE TABLE modules (
    id BIGSERIAL PRIMARY KEY,
    module_code VARCHAR(50) NOT NULL UNIQUE COMMENT '模块编码',
    module_name VARCHAR(100) NOT NULL COMMENT '模块名称',
    icon VARCHAR(50) COMMENT '模块图标',
    sort_order INTEGER DEFAULT 0 COMMENT '排序号',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-启用，inactive-停用',
    description TEXT COMMENT '模块描述',
    metadata JSONB COMMENT '扩展元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID'
);

-- 索引
CREATE INDEX idx_modules_module_code ON modules(module_code);
CREATE INDEX idx_modules_status ON modules(status);
CREATE INDEX idx_modules_sort_order ON modules(sort_order);
```

## 初始化数据

### 1. 初始化模块数据

```sql
INSERT INTO modules (module_code, module_name, icon, sort_order, status) VALUES
('market', '市场运营', 'bar-chart-3', 1, 'active'),
('customer', '客户运营', 'users', 2, 'active'),
('product', '产品运营', 'package', 3, 'active'),
('portal', '门户', 'home', 4, 'active');
```

### 2. 初始化场景数据

```sql
-- 一级场景：公众市场
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, level, sort_order, status) VALUES
('public_market', '公众市场', 'market', '市场运营', 1, 1, 'active'),
('enterprise_market', '政企市场', 'market', '市场运营', 1, 2, 'active'),
('home_market', '家庭市场', 'market', '市场运营', 1, 3, 'active');

-- 二级场景：公众市场下的子场景
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, parent_scenario_id, level, sort_order, status) VALUES
('market', '市场运营', 'market', '市场运营', 1, 2, 1, 'active'),
('customer', '客户运营', 'customer', '客户运营', 1, 2, 2, 'active'),
('mid_high_end', '中高端', 'customer', '客户运营', 2, 3, 3, 'active'),
('churn', '离网维系', 'market', '市场运营', 1, 2, 4, 'active'),
('churn_warning', '中高端流失预警', 'customer', '客户运营', 2, 3, 5, 'active'),
('new_subscriptions', '新入网', 'market', '市场运营', 1, 2, 6, 'active'),
('group_customers', '集团成员客户', 'customer', '客户运营', 2, 3, 7, 'active');
```

### 3. 初始化页面数据

```sql
-- 获取场景ID（需要先查询）
-- 假设：market-场景ID=1, churn-场景ID=4, mid_high_end-场景ID=3

-- 市场运营场景的页面
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status) VALUES
('market.market.overview', '市场运营概览页', 'overview', 1, 'market', '/workspace/insight/market/overview', 1, 'active'),
('market.market.tree.market_tree_1', '市场运营指标树1', 'tree', 1, 'market', '/workspace/insight/market/tree/market-tree-1', 2, 'active'),
('market.market.tree.market_tree_2', '市场运营指标树2', 'tree', 1, 'market', '/workspace/insight/market/tree/market-tree-2', 3, 'active');

-- 离网维系场景的页面
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, sort_order, status) VALUES
('market.churn.overview', '离网维系概览页', 'overview', 4, 'market', '/workspace/insight/churn/overview', FALSE, 1, 'active'),
('market.churn.tree.monthly_all', '当月全量客户离网客户数', 'tree', 4, 'market', '/workspace/insight/churn/tree/monthly-all', TRUE, 2, 'active'),
('market.churn.tree.monthly_midhighend', '当月拍照中高端客户离网客户数', 'tree', 4, 'market', '/workspace/insight/churn/tree/monthly-midhighend', TRUE, 3, 'active'),
('market.churn.tree.monthly_global', '当月拍照全球通客户离网客户数', 'tree', 4, 'market', '/workspace/insight/churn/tree/monthly-global', TRUE, 4, 'active');

-- 中高端客户运营场景的页面
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, sort_order, status) VALUES
('market.mid_high_end.overview', '中高端客户运营概览页', 'overview', 3, 'market', '/workspace/insight/mid-high-end/overview', FALSE, 1, 'active'),
('market.mid_high_end.tree.scale_retention', '拍照中高端客户规模保有率', 'tree', 3, 'market', '/workspace/insight/mid-high-end/tree/scale-retention', TRUE, 2, 'active'),
('market.mid_high_end.tree.value_retention', '拍照中高端客户价值保有率', 'tree', 3, 'market', '/workspace/insight/mid-high-end/tree/value-retention', TRUE, 3, 'active'),
('market.mid_high_end.tree.decline_ratio', '中高端一降到底占比', 'tree', 3, 'market', '/workspace/insight/mid-high-end/tree/decline-ratio', TRUE, 4, 'active');

-- 中高端流失预警场景的页面
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, is_tree_page, sort_order, status) VALUES
('market.churn_warning.overview', '中高端流失预警概览页', 'overview', 5, 'market', '/workspace/insight/churn-warning/overview', FALSE, 1, 'active'),
('market.churn_warning.tree.warning_tree_1', '流失预警指标树1', 'tree', 5, 'market', '/workspace/insight/churn-warning/tree/warning-tree-1', TRUE, 2, 'active');

-- 新入网场景的页面
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status) VALUES
('market.new_subscriptions.overview', '新入网概览页', 'overview', 6, 'market', '/workspace/insight/new-subscriptions/overview', 1, 'active');

-- 集团成员客户场景的页面
INSERT INTO pages (page_code, page_name, page_type, scenario_id, module_code, page_path, sort_order, status) VALUES
('market.group_customers.overview', '集团成员客户概览页', 'overview', 7, 'market', '/workspace/insight/group-customers/overview', 1, 'active');
```

## 管理界面设计

### 1. 场景管理页面

**路径**：`/workspace/system/page-management/scenarios`

**功能**：
- 场景列表（表格展示）
- 新增场景（弹窗或新页面）
- 编辑场景
- 删除场景（级联检查，有关联页面则不允许删除）
- 启用/停用场景

**列表字段**：
- 场景编码
- 场景名称
- 所属模块
- 层级
- 排序
- 状态
- 页面数量（统计）
- 操作（编辑、删除）

**新增/编辑表单字段**：
- 场景编码（唯一）
- 场景名称
- 所属模块（下拉选择）
- 父场景（下拉选择，支持层级）
- 排序
- 状态
- 描述

### 2. 页面管理页面

**路径**：`/workspace/system/page-management/pages`

**功能**：
- 页面列表（按场景分组展示）
- 新增页面
- 编辑页面
- 删除页面
- 启用/停用页面
- 批量操作

**列表展示**：
- 按场景分组（折叠面板）
- 每个场景下显示该场景的所有页面
- 支持搜索（页面名称、编码）
- 支持筛选（页面类型、状态）

**列表字段**：
- 页面编码
- 页面名称
- 页面类型
- 所属场景
- 页面路径
- 是否指标树
- 排序
- 状态
- 操作（编辑、删除）

**新增/编辑表单字段**：
- 页面编码（唯一）
- 页面名称
- 所属场景（下拉选择，按模块分组）
- 页面类型（概览页、指标树、仪表板）
- 页面路径
- 是否指标树（如果是指标树类型）
- 指标树配置ID（如果是指标树）
- 排序
- 状态
- 描述

### 3. 菜单结构

```
系统管理
└── 页面管理
    ├── 场景管理
    └── 页面管理
```

## API接口设计

### 1. 场景管理API

```
GET    /api/scenarios                    # 获取场景列表
POST   /api/scenarios                    # 新增场景
GET    /api/scenarios/:id                # 获取场景详情
PUT    /api/scenarios/:id                # 更新场景
DELETE /api/scenarios/:id                # 删除场景
GET    /api/scenarios/tree               # 获取场景树（层级结构）
```

### 2. 页面管理API

```
GET    /api/pages                        # 获取页面列表（支持分页、筛选）
POST   /api/pages                        # 新增页面
GET    /api/pages/:id                    # 获取页面详情
PUT    /api/pages/:id                    # 更新页面
DELETE /api/pages/:id                    # 删除页面
GET    /api/pages/by-scenario/:scenarioId  # 获取某个场景下的页面列表
GET    /api/pages/grouped                # 获取按场景分组的页面列表
```

### 3. 页面分组API（用于选择器）

```
GET    /api/pages/associations/groups    # 获取用于关联选择的页面分组
```

**响应格式**：
```json
{
  "success": true,
  "data": [
    {
      "scenarioId": "churn",
      "scenarioName": "离网维系",
      "moduleName": "市场运营",
      "pages": [
        {
          "pageId": "market.churn.overview",
          "pageName": "离网维系概览页",
          "pageType": "overview",
          "pagePath": "/workspace/insight/churn/overview"
        },
        {
          "pageId": "market.churn.tree.monthly_all",
          "pageName": "当月全量客户离网客户数",
          "pageType": "tree",
          "pagePath": "/workspace/insight/churn/tree/monthly-all"
        }
      ]
    }
  ]
}
```

## 实施步骤

### 阶段1：数据库创建
1. 创建数据库表
2. 插入初始化数据
3. 创建索引和约束

### 阶段2：API开发
1. 实现场景管理API
2. 实现页面管理API
3. 实现页面分组API（用于选择器）

### 阶段3：管理界面开发
1. 开发场景管理页面
2. 开发页面管理页面
3. 集成到菜单系统

### 阶段4：集成到选择器
1. 修改 `SimpleReportAssociationSelector` 组件
2. 从API获取页面分组数据
3. 移除硬编码的MOCK数据

### 阶段5：测试和优化
1. 功能测试
2. 性能优化
3. 用户验收测试

## 注意事项

1. **数据一致性**：
   - 场景删除时检查是否有关联的页面
   - 页面删除时检查是否有关联的报告

2. **缓存机制**：
   - 场景和页面数据相对稳定，可以添加缓存
   - 定期刷新缓存

3. **权限控制**：
   - 管理界面需要管理员权限
   - 操作需要审计日志

4. **数据迁移**：
   - 将现有的硬编码数据迁移到数据库
   - 确保数据完整性

5. **扩展性**：
   - 预留扩展字段（metadata）
   - 支持未来的组件级别配置

---

**文档版本**：v1.0  
**创建日期**：2026-01-30  
**状态**：待实施
