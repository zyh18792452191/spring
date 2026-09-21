# 创建报告页面的展示位置配置优化

## 概述

本文档说明了在创建报告（实例）页面中，如何优化报告展示位置配置，支持层级联动选择和自动关联功能。

## 背景和需求

### 用户场景

用户在创建报告时，需要配置报告的展示位置（即报告要在哪些页面展示）。主要有两种使用场景：

1. **使用模板默认配置**：大多数情况下，用户会使用模板配置的默认展示位置
2. **自定义展示位置**：部分情况下，用户需要覆盖模板默认配置，为当前报告自定义展示位置

### 核心需求

- 显示模板的默认展示位置，让用户了解报告会展示在哪里
- 支持覆盖默认配置，为当前报告自定义展示位置
- 使用层级联动选择（场景 → 指标树），提升用户体验
- 支持自动关联，根据模板的业务场景自动匹配页面

## 功能实现

### 1. 模板默认配置展示

#### 展示逻辑

当用户选择模板后，系统会：
1. 从模板中加载默认的展示位置配置
2. 按场景层级结构展示这些页面
3. 标注页面类型（概览页/指标树）
4. 如果用户选择了"覆盖默认配置"，则将这些页面标记为失效（划线）

#### 展示结构

```
模板默认配置
├── 中高端客户运营（场景）
│   ├── 中高端客户运营概览页 [概览页]
│   ├── 拍照中高端客户规模保有率 [指标树]
│   ├── 拍照中高端客户价值保有率 [指标树]
│   └── 中高端一降到底占比 [指标树]
└── 市场运营（场景）
    ├── 市场运营概览页 [概览页]
    └── 市场运营指标树1 [指标树]
```

#### 代码实现

```tsx
// 按场景分组展示
const { MOCK_PAGES, PageGroupBuilder } = require('@/lib/report-association/page-groups')
const { PageIdBuilder } = require('@/lib/report-association/types')

// 获取关联的页面详情
const associatedPages = templateAssociations
  .map(assoc => ({
    ...assoc,
    page: MOCK_PAGES.find((p: any) => p.pageId === assoc.pageId)
  }))
  .filter((item: any) => item.page)

// 按场景分组
const groupedByScenario = associatedPages.reduce((acc, item) => {
  const parsed = PageIdBuilder.parse(item.pageId)
  const scenarioId = parsed.scenario || 'other'
  
  if (!acc[scenarioId]) {
    acc[scenarioId] = []
  }
  acc[scenarioId].push(item)
  return acc
}, {} as Record<string, any[]>)

// 按场景顺序展示
const scenarioOrder = ['market', 'churn', 'mid_high_end', 'churn_warning', 'new_subscriptions', 'group_customers']
const scenarioNames = {
  'market': '市场运营',
  'churn': '离网维系',
  'mid_high_end': '中高端客户运营',
  // ...
}
```

### 2. 自定义配置（覆盖默认）

#### 功能说明

用户可以选择"覆盖默认配置"来为当前报告自定义展示位置。一旦启用：
- 模板默认配置将被标记为失效（划线显示）
- 用户可以使用层级联动选择器选择要展示的位置
- 报告将仅展示在用户自定义的位置，不展示在模板默认位置

#### 使用方式

1. 勾选"覆盖默认配置"复选框
2. 展开层级联动选择器
3. 根据场景层级选择要关联的页面
4. 支持自动关联和手动选择

#### 代码实现

```tsx
<Checkbox
  id="override-association"
  checked={overrideTemplateAssociation}
  onCheckedChange={(checked) => {
    setOverrideTemplateAssociation(checked as boolean)
    // 如果取消覆盖，清空自定义配置
    if (!checked) {
      setReportAssociations([])
    }
  }}
/>

{overrideTemplateAssociation && (
  <SimpleReportAssociationSelector
    businessScenario={businessScenario}
    associations={reportAssociations}
    onChange={setReportAssociations}
  />
)}
```

### 3. 业务场景自动匹配

#### 匹配逻辑

系统根据模板ID自动匹配对应的业务场景：

| 模板ID | 业务场景ID | 业务场景名称 |
|-------|----------|------------|
| tpl001 | mid_high_end | 中高端客户运营 |
| tpl002 | market | 市场运营 |
| tpl003 | churn | 离网维系 |

#### 代码实现

```tsx
// 获取模板的业务场景
const selectedTemplate = mockTemplates.find(t => t.id === basicConfig.templateId)
const businessScenario = selectedTemplate?.id === 'tpl001' 
  ? 'mid_high_end' 
  : selectedTemplate?.id === 'tpl002'
  ? 'market'
  : 'churn'

<SimpleReportAssociationSelector
  businessScenario={businessScenario}
  associations={reportAssociations}
  onChange={setReportAssociations}
/>
```

## 用户操作流程

### 场景1：使用模板默认配置

1. 用户进入创建报告页面
2. 选择模板（如"中高端客户运营分析报告模板"）
3. 展开"报告展示位置"配置区域
4. 查看"模板默认配置"，了解报告将展示的位置
5. 不勾选"覆盖默认配置"
6. 完成其他配置，生成报告
7. 报告将展示在模板默认配置的位置

### 场景2：自定义展示位置

1. 用户进入创建报告页面
2. 选择模板（如"中高端客户运营分析报告模板"）
3. 展开"报告展示位置"配置区域
4. 勾选"覆盖默认配置"
5. 展开层级联动选择器
6. 开启"自动关联到相关页面"（推荐）
7. 或手动展开场景，勾选需要的页面
8. 完成其他配置，生成报告
9. 报告将仅展示在用户自定义的位置

## 核心优势

✅ **清晰的展示**：按场景层级结构展示默认配置，一目了然
✅ **灵活的控制**：支持覆盖默认配置，满足个性化需求
✅ **智能匹配**：自动匹配业务场景，减少配置时间
✅ **层级选择**：支持场景 → 指标树的层级联动选择
✅ **批量操作**：支持场景级全选/取消全选，快速配置
✅ **所见即所得**：清晰展示关联页面，标注页面类型

## 与创建模板页面的区别

| 维度 | 创建模板页面 | 创建报告页面 |
|------|------------|------------|
| **配置对象** | 模板（可复用） | 报告（单次使用） |
| **默认行为** | 无默认配置 | 继承模板默认配置 |
| **覆盖选项** | 无 | 支持覆盖默认配置 |
| **业务场景** | 用户手动选择 | 自动从模板继承 |
| **自动关联** | 推荐，需手动开启 | 推荐，根据模板场景自动匹配 |

## 技术要点

### 1. 组件复用

创建报告页面复用了 `SimpleReportAssociationSelector` 组件，确保了：
- 统一的UI和交互体验
- 代码复用，减少维护成本
- 功能一致性

### 2. 数据流

```
用户选择模板
    ↓
加载模板默认配置（templateAssociations）
    ↓
用户选择是否覆盖默认配置
    ↓
├─ 不覆盖 → 使用 templateAssociations
└─ 覆盖 → 用户手动配置 reportAssociations
    ↓
保存报告配置
```

### 3. 类型安全

使用 TypeScript 确保类型安全：
```typescript
const templateAssociations: ReportAssociation[] = []
const reportAssociations: ReportAssociation[] = []
```

## 后续优化建议

1. **模板预览**
   - 在选择模板时，预览模板的默认展示位置
   - 帮助用户快速了解模板配置

2. **配置历史**
   - 记录用户自定义的配置历史
   - 支持快速复用之前的配置

3. **批量创建报告**
   - 支持批量创建报告时统一配置展示位置
   - 提升批量操作效率

4. **权限控制**
   - 根据用户权限限制可选择的页面
   - 确保报告只展示在用户有权限的页面

## 总结

创建报告页面的展示位置配置优化，通过以下方式提升了用户体验：

✅ **清晰展示默认配置**：按场景层级结构展示，一目了然
✅ **灵活支持自定义**：覆盖默认配置，满足个性化需求
✅ **智能自动匹配**：根据模板业务场景自动关联
✅ **层级联动选择**：场景 → 指标树，结构清晰

**推荐大多数用户使用模板默认配置，必要时再自定义调整！** 🎯
