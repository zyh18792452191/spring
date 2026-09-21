# 页面和场景管理系统 - 重新设计 v2.0

## 核心改进

### 问题反馈

用户提出：
1. **业务场景不应该强制**：门户首页不属于任何业务场景（不属于中高端、离网维系、家庭运营等）
2. **页面定义需要维护**：页面的基本信息（名称、路径、类型等）需要有个地方维护

### 重新设计

**核心理念**：
- **页面是核心**：页面是基础实体，必须维护其基本信息
- **业务场景是属性**：业务场景是页面的一个可选属性，不是强制的
- **灵活分组**：支持有场景和无场景的页面，分别分组展示

## 数据库设计 v2.0

### 1. 业务场景表（business_scenarios）

保持不变，用于管理业务场景定义。

```sql
CREATE TABLE business_scenarios (
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
    updated_by BIGINT
);
```

### 2. 页面表（pages）- 重大修改

**关键修改**：
- `scenario_id` 改为可选（允许NULL）
- 新增 `scenario_code` 和 `scenario_name` 冗余字段（便于查询和展示）
- `module_code` 也改为可选（因为不是所有页面都属于某个模块）

```sql
CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    page_code VARCHAR(100) NOT NULL UNIQUE COMMENT '页面编码',
    page_name VARCHAR(200) NOT NULL COMMENT '页面名称',
    page_type VARCHAR(50) NOT NULL COMMENT '页面类型：overview-概览页，tree-指标树，dashboard-仪表板，other-其他',
    page_path VARCHAR(500) NOT NULL COMMENT '页面路径',
    
    -- 业务场景（可选）
    scenario_id BIGINT COMMENT '所属场景ID（可选）',
    scenario_code VARCHAR(50) COMMENT '场景编码（冗余字段）',
    scenario_name VARCHAR(100) COMMENT '场景名称（冗余字段）',
    
    -- 所属模块（可选）
    module_code VARCHAR(50) COMMENT '所属模块编码（可选）',
    module_name VARCHAR(100) COMMENT '所属模块名称（冗余字段）',
    
    -- 页面属性
    is_tree_page BOOLEAN DEFAULT FALSE COMMENT '是否为指标树页面',
    tree_config_id VARCHAR(100) COMMENT '指标树配置ID',
    has_components BOOLEAN DEFAULT FALSE COMMENT '是否有子组件（未来扩展）',
    component_config JSONB COMMENT '组件配置（未来扩展）',
    
    -- 排序和状态
    sort_order INTEGER DEFAULT 0 COMMENT '排序号',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-启用，inactive-停用',
    description TEXT COMMENT '页面描述',
    metadata JSONB COMMENT '扩展元数据',
    
    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    
    FOREIGN KEY (scenario_id) REFERENCES business_scenarios(id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX idx_pages_scenario_id ON pages(scenario_id);
CREATE INDEX idx_pages_scenario_code ON pages(scenario_code);
CREATE INDEX idx_pages_module_code ON pages(module_code);
CREATE INDEX idx_pages_page_type ON pages(page_type);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_sort_order ON pages(sort_order);
CREATE INDEX idx_pages_page_code ON pages(page_code);
```

**关键修改说明**：
- `scenario_id` 改为可选，允许NULL，支持不属于任何业务场景的页面
- 新增 `scenario_code` 和 `scenario_name` 冗余字段，避免JOIN查询，提升性能
- `module_code` 也改为可选，因为不是所有页面都属于某个模块
- `page_type` 增加 `other` 类型，支持其他类型的页面

## 初始化数据 v2.0

### 1. 业务场景数据（保持不变）

```sql
INSERT INTO business_scenarios (scenario_code, scenario_name, module_code, module_name, level, sort_order, status) VALUES
('public_market', '公众市场', 'market', '市场运营', 1, 1, 'active'),
('enterprise_market', '政企市场', 'market', '市场运营', 1, 2, 'active'),
('home_market', '家庭市场', 'market', '市场运营', 1, 3, 'active');

-- 二级、三级场景...
```

### 2. 页面数据（更新）

**有业务场景的页面**：

```sql
-- 市场运营场景的页面（有业务场景）
WITH market_scenario_id AS (
    SELECT id, scenario_code, scenario_name FROM business_scenarios WHERE scenario_code = 'market'
)
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, is_tree_page, tree_config_id, sort_order, status)
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
    FALSE,
    NULL,
    1,
    'active'
FROM market_scenario_id;
```

**无业务场景的页面**（如门户首页）：

```sql
-- 门户首页（无业务场景）
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name, sort_order, status) VALUES
('portal.home', '门户首页', 'other', '/', NULL, NULL, NULL, 'portal', '门户', 1, 'active'),
('portal.profile', '个人中心', 'other', '/profile', NULL, NULL, NULL, 'portal', '门户', 2, 'active'),
('portal.settings', '系统设置', 'other', '/settings', NULL, NULL, NULL, 'portal', '门户', 3, 'active');
```

## 页面分组逻辑

### 分组策略

```
页面列表
├── 有业务场景的页面
│   ├── 中高端客户运营（场景）
│   │   ├── 中高端客户运营概览页
│   │   ├── 拍照中高端客户规模保有率
│   │   └── ...
│   ├── 离网维系（场景）
│   │   ├── 离网维系概览页
│   │   ├── 当月全量客户离网客户数
│   │   └── ...
│   └── 市场运营（场景）
│       ├── 市场运营概览页
│       └── ...
└── 无业务场景的页面
    ├── 门户首页
    ├── 个人中心
    └── 系统设置
```

### API响应格式

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
    },
    {
      "scenarioId": null,
      "scenarioName": "其他页面",
      "moduleName": null,
      "pages": [
        {
          "pageId": "portal.home",
          "pageName": "门户首页",
          "pageType": "other",
          "pagePath": "/"
        },
        {
          "pageId": "portal.profile",
          "pageName": "个人中心",
          "pageType": "other",
          "pagePath": "/profile"
        }
      ]
    }
  ]
}
```

## 管理界面设计 v2.0

### 1. 页面管理页面（简化）

**路径**：`/workspace/system/page-management/pages`

**功能**：
- 页面列表（按业务场景分组 + 其他页面）
- 新增页面
- 编辑页面
- 删除页面
- 启用/停用页面

**列表展示**：
```
页面管理
├── 中高端客户运营（场景） [4个页面]
├── 离网维系（场景） [4个页面]
├── 市场运营（场景） [3个页面]
└── 其他页面 [3个页面]
```

**新增/编辑表单字段**：
- 页面编码（唯一）
- 页面名称
- 页面类型（概览页、指标树、仪表板、其他）
- 页面路径（必填）
- **业务场景（可选，下拉选择）**
- 所属模块（可选）
- 是否指标树（如果是指标树类型）
- 指标树配置ID（如果是指标树）
- 排序
- 状态
- 描述

### 2. 场景管理页面（保持不变）

场景管理页面保持不变，用于管理业务场景定义。

## SimpleReportAssociationSelector 组件调整

### 自动关联逻辑调整

**之前**：
- 必须根据业务场景自动关联

**现在**：
- 如果模板有业务场景，则自动关联该场景下的页面
- 如果模板没有业务场景，则不自动关联，用户手动选择

```typescript
// 根据业务场景自动关联的页面
const autoAssociatedPages = scenarioConfig
  ? PageGroupBuilder.getAutoAssociatedPages(businessScenario, MOCK_PAGES)
  : []  // 如果没有业务场景，不自动关联

// UI展示
{autoAssociatedPages.length > 0 ? (
  <div>
    <div>当前业务场景：{scenarioConfig?.name || businessScenario}</div>
    <div>将自动关联到（{autoAssociatedPages.length}个页面）：</div>
  </div>
) : (
  <div>
    <div>该模板未指定业务场景</div>
    <div>请手动选择要关联的页面</div>
  </div>
)}
```

## 数据对比：v1.0 vs v2.0

| 维度 | v1.0（旧设计） | v2.0（新设计） |
|------|-------------|-------------|
| **业务场景** | 强制关联（scenario_id NOT NULL） | 可选（scenario_id 可为NULL） |
| **场景字段** | 只有ID | 新增 code 和 name 冗余字段 |
| **模块关联** | 强制 | 可选 |
| **页面类型** | overview, tree, dashboard | 新增 other 类型 |
| **页面分组** | 按场景分组 | 按场景分组 + 其他页面 |
| **门户首页** | 无法定义（没有场景） | 可以定义（scenario_id=NULL） |
| **灵活性** | 受限 | 高 |
| **查询性能** | 需要JOIN查询 | 冗余字段，无需JOIN |

## 核心优势

✅ **业务场景可选**：支持不属于任何业务场景的页面（如门户首页）  
✅ **页面定义完整**：维护页面的完整信息（编码、名称、路径、类型等）  
✅ **灵活分组**：支持有场景和无场景的页面，分别分组展示  
✅ **查询性能**：冗余字段避免JOIN查询，提升性能  
✅ **扩展性强**：预留扩展空间，支持未来的需求  
✅ **向后兼容**：支持现有的有场景的页面  

## 实施路径

### 阶段1：更新数据库结构 ⏱️ 1天

- [x] 重新设计页面表结构
- [ ] 更新表结构SQL脚本
- [ ] 更新初始化数据SQL脚本
- [ ] 执行数据库迁移
- [ ] 验证数据正确性

### 阶段2：更新API ⏱️ 1天

- [ ] 调整页面分组API，支持无场景页面
- [ ] 更新页面创建/更新API，支持scenario_id为NULL
- [ ] 更新API响应格式

### 阶段3：更新管理界面 ⏱️ 1天

- [ ] 更新页面管理页面，业务场景改为可选
- [ ] 调整页面列表展示，支持"其他页面"分组
- [ ] 更新表单验证逻辑

### 阶段4：更新选择器组件 ⏱️ 0.5天

- [ ] 调整 SimpleReportAssociationSelector 组件
- [ ] 支持无业务场景的模板
- [ ] 支持选择"其他页面"

### 阶段5：测试和验证 ⏱️ 0.5天

- [ ] 功能测试
- [ ] 边界情况测试
- [ ] 验证门户首页等无场景页面

**总计时间**：4天

## 总结

### v2.0 的核心改进

1. **业务场景改为可选**：支持不属于任何业务场景的页面（如门户首页）
2. **页面定义完整**：维护页面的完整信息，定义好后才能在创建模板、创建报告时使用
3. **灵活分组**：支持有场景和无场景的页面，分别分组展示
4. **查询性能**：冗余字段避免JOIN查询，提升性能

### 使用示例

**场景1：有业务场景的页面**
```sql
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name)
VALUES (
  'market.churn.overview',
  '离网维系概览页',
  'overview',
  '/workspace/insight/churn/overview',
  1,  -- scenario_id
  'churn',  -- scenario_code
  '离网维系',  -- scenario_name
  'market',
  '市场运营'
);
```

**场景2：无业务场景的页面**
```sql
INSERT INTO pages (page_code, page_name, page_type, page_path, scenario_id, scenario_code, scenario_name, module_code, module_name)
VALUES (
  'portal.home',
  '门户首页',
  'other',
  '/',
  NULL,  -- scenario_id 为NULL
  NULL,  -- scenario_code 为NULL
  NULL,  -- scenario_name 为NULL
  'portal',
  '门户'
);
```

### 下一步行动

1. **立即执行**：更新SQL脚本
2. **API调整**：调整页面分组API
3. **界面更新**：更新管理界面和选择器组件

---

**文档版本**：v2.0  
**创建日期**：2026-01-30  
**状态**：待实施
