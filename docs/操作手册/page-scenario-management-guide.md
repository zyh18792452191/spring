# 页面和场景管理系统 - 实施指南

## 概述

本系统用于管理业务场景和页面的关联关系，替代当前硬编码在代码中的配置。支持通过后台管理界面动态维护场景和页面数据。

## 问题背景

**当前问题**：
- 页面和场景的关联关系硬编码在 `src/lib/report-association/page-groups.ts` 中
- 缺乏后台管理界面，无法动态维护
- 新增或修改页面需要修改代码并重新部署

**解决方案**：
- 设计数据库表结构
- 开发后台管理界面
- 提供API接口
- 支持动态配置

## 快速开始

### 1. 执行数据库迁移

```bash
# 1. 创建表结构
psql -d your_database -f migrations/init-page-scenario-tables.sql

# 2. 插入初始化数据
psql -d your_database -f migrations/init-page-scenario-data.sql
```

### 2. 验证数据

```sql
-- 查看场景统计
SELECT * FROM scenario_stats ORDER BY sort_order;

-- 查看页面列表
SELECT * FROM page_full_info ORDER BY scenario_id, sort_order;

-- 查看特定场景的页面
SELECT 
    p.page_code,
    p.page_name,
    p.page_type,
    p.page_path
FROM pages p
JOIN business_scenarios bs ON p.scenario_id = bs.id
WHERE bs.scenario_code = 'churn'
ORDER BY p.sort_order;
```

## 数据库结构

### 核心表

1. **modules** - 模块表
2. **business_scenarios** - 业务场景表
3. **pages** - 页面表
4. **page_components** - 页面组件表（未来扩展）

### 关键字段说明

#### business_scenarios 表
- `scenario_code`: 场景编码，唯一标识（如 `churn`, `mid_high_end`）
- `scenario_name`: 场景名称（如 `离网维系`, `中高端客户运营`）
- `parent_scenario_id`: 父场景ID，支持层级结构
- `level`: 场景层级（1-一级，2-二级，3-三级）
- `sort_order`: 排序号

#### pages 表
- `page_code`: 页面编码，格式 `{module}.{scenario}.{page_type}.{unique_id}`（如 `market.churn.overview`）
- `page_name`: 页面名称（如 `离网维系概览页`）
- `page_type`: 页面类型（`overview`, `tree`, `dashboard`）
- `scenario_id`: 关联场景ID
- `is_tree_page`: 是否为指标树页面
- `tree_config_id`: 指标树配置ID（如果是指标树页面）

## 管理界面

### 1. 场景管理

**路径**：`/workspace/system/page-management/scenarios`

**功能**：
- 场景列表（表格展示）
- 新增场景
- 编辑场景
- 删除场景（级联检查）
- 启用/停用场景

**表单字段**：
- 场景编码（唯一）
- 场景名称
- 所属模块（下拉选择）
- 父场景（下拉选择，支持层级）
- 排序
- 状态
- 描述

### 2. 页面管理

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
- 支持搜索（页面名称、编码）
- 支持筛选（页面类型、状态）

**表单字段**：
- 页面编码（唯一）
- 页面名称
- 所属场景（下拉选择）
- 页面类型（概览页、指标树、仪表板）
- 页面路径
- 是否指标树（如果是指标树类型）
- 指标树配置ID（如果是指标树）
- 排序
- 状态
- 描述

## API接口

### 场景管理API

```typescript
// 获取场景列表
GET /api/scenarios

// 新增场景
POST /api/scenarios
Body: { scenario_code, scenario_name, module_code, parent_scenario_id, sort_order, description }

// 获取场景详情
GET /api/scenarios/:id

// 更新场景
PUT /api/scenarios/:id
Body: { scenario_name, sort_order, description, status }

// 删除场景
DELETE /api/scenarios/:id

// 获取场景树（层级结构）
GET /api/scenarios/tree
```

### 页面管理API

```typescript
// 获取页面列表（支持分页、筛选）
GET /api/pages?page=1&pageSize=20&scenarioId=1&status=active

// 新增页面
POST /api/pages
Body: { page_code, page_name, page_type, scenario_id, page_path, is_tree_page, tree_config_id, sort_order, description }

// 获取页面详情
GET /api/pages/:id

// 更新页面
PUT /api/pages/:id
Body: { page_name, page_path, sort_order, description, status }

// 删除页面
DELETE /api/pages/:id

// 获取某个场景下的页面列表
GET /api/pages/by-scenario/:scenarioId

// 获取按场景分组的页面列表（用于选择器）
GET /api/pages/grouped
```

## 集成到选择器

### 更新 SimpleReportAssociationSelector

当前组件使用硬编码数据，需要改为从API获取：

```typescript
// 修改前
import { MOCK_PAGES } from '@/lib/report-association/page-groups'

// 修改后
const [pageGroups, setPageGroups] = useState<PageGroup[]>([])

useEffect(() => {
  // 从API获取页面分组数据
  fetch('/api/pages/grouped')
    .then(res => res.json())
    .then(data => {
      setPageGroups(data.data)
    })
}, [])
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
    }
  ]
}
```

## 实施步骤

### 阶段1：数据库部署 ⏱️ 1天

- [x] 设计数据库表结构
- [x] 创建表结构SQL脚本
- [x] 创建初始化数据SQL脚本
- [ ] 执行数据库迁移
- [ ] 验证数据正确性

### 阶段2：API开发 ⏱️ 2-3天

- [ ] 实现场景管理API
  - [ ] GET /api/scenarios
  - [ ] POST /api/scenarios
  - [ ] GET /api/scenarios/:id
  - [ ] PUT /api/scenarios/:id
  - [ ] DELETE /api/scenarios/:id
  - [ ] GET /api/scenarios/tree

- [ ] 实现页面管理API
  - [ ] GET /api/pages
  - [ ] POST /api/pages
  - [ ] GET /api/pages/:id
  - [ ] PUT /api/pages/:id
  - [ ] DELETE /api/pages/:id
  - [ ] GET /api/pages/grouped

- [ ] 编写单元测试

### 阶段3：管理界面开发 ⏱️ 3-4天

- [ ] 开发场景管理页面
  - [ ] 场景列表组件
  - [ ] 新增场景表单
  - [ ] 编辑场景表单
  - [ ] 删除确认对话框

- [ ] 开发页面管理页面
  - [ ] 页面列表组件（按场景分组）
  - [ ] 新增页面表单
  - [ ] 编辑页面表单
  - [ ] 删除确认对话框
  - [ ] 搜索和筛选功能

- [ ] 集成到菜单系统
  - [ ] 添加菜单项
  - [ ] 配置权限

### 阶段4：集成到选择器 ⏱️ 1天

- [ ] 修改 SimpleReportAssociationSelector 组件
- [ ] 从API获取页面分组数据
- [ ] 移除硬编码的MOCK数据
- [ ] 添加加载状态和错误处理

### 阶段5：测试和优化 ⏱️ 1-2天

- [ ] 功能测试
- [ ] 性能优化
- [ ] 用户验收测试
- [ ] 文档更新

**总计时间**：8-11天

## 注意事项

### 数据一致性

1. **级联删除**：
   - 删除场景时检查是否有关联的页面
   - 删除页面时检查是否有关联的报告

2. **状态控制**：
   - 使用 `status` 字段控制启用/停用
   - 删除操作改为逻辑删除或硬删除（根据业务需求）

### 缓存机制

1. **缓存策略**：
   - 场景和页面数据相对稳定，可以添加缓存
   - 使用Redis或内存缓存
   - 设置合理的过期时间（如1小时）

2. **缓存刷新**：
   - 修改场景或页面后刷新缓存
   - 提供手动刷新缓存的接口

### 权限控制

1. **管理权限**：
   - 管理界面需要管理员权限
   - 操作需要审计日志

2. **API权限**：
   - API接口需要鉴权
   - 根据用户角色控制访问权限

### 数据迁移

1. **现有数据迁移**：
   - 将 `src/lib/report-association/page-groups.ts` 中的MOCK数据迁移到数据库
   - 确保数据完整性

2. **迁移脚本**：
   - 编写数据迁移脚本
   - 执行迁移后验证数据

### 扩展性

1. **预留扩展字段**：
   - 使用 `metadata` JSONB字段存储扩展信息
   - 避免频繁修改表结构

2. **组件级别支持**：
   - 预留 `page_components` 表结构
   - 预留 `has_components` 和 `component_config` 字段

## 相关文档

- [数据库设计文档](./report-association-database-design.md)
- [层级联动选择器文档](./report-association-hierarchical-selector.md)
- [创建报告页面配置文档](./report-create-association-config.md)
- [粒度设计决策文档](./report-association-granularity-decision.md)

## 常见问题

### Q1: 如何新增一个场景？

1. 登录系统，进入"系统管理 > 页面管理 > 场景管理"
2. 点击"新增场景"
3. 填写场景编码、场景名称、所属模块等信息
4. 保存

### Q2: 如何新增一个页面？

1. 登录系统，进入"系统管理 > 页面管理 > 页面管理"
2. 点击"新增页面"
3. 填写页面编码、页面名称、所属场景、页面类型等信息
4. 保存

### Q3: 如何修改页面的顺序？

1. 进入"系统管理 > 页面管理 > 场景管理"
2. 编辑场景，调整 `sort_order` 字段
3. 或进入"系统管理 > 页面管理 > 页面管理"
4. 编辑页面，调整 `sort_order` 字段

### Q4: 删除场景时提示有关联的页面怎么办？

1. 先删除或停用该场景下的所有页面
2. 然后再删除场景
3. 或选择"停用"场景，而不是删除

### Q5: 如何验证数据是否正确？

```sql
-- 查看场景及其页面数量
SELECT 
    bs.scenario_code,
    bs.scenario_name,
    COUNT(p.id) as page_count
FROM business_scenarios bs
LEFT JOIN pages p ON bs.id = p.scenario_id AND p.status = 'active'
GROUP BY bs.id, bs.scenario_code, bs.scenario_name
ORDER BY bs.sort_order;
```

## 总结

页面和场景管理系统解决了当前硬编码配置的问题，提供了灵活的后台管理界面。通过数据库存储、API接口、管理界面的完整解决方案，支持动态维护场景和页面数据。

**核心优势**：
- ✅ 动态配置，无需修改代码
- ✅ 后台管理界面，操作便捷
- ✅ 支持层级结构（场景）
- ✅ 支持多种页面类型
- ✅ 预留扩展空间（组件级别）
- ✅ 完整的API接口

**下一步行动**：
1. 执行数据库迁移脚本
2. 开发API接口
3. 开发管理界面
4. 集成到选择器组件

---

**文档版本**：v1.0  
**创建日期**：2026-01-30  
**状态**：待实施
