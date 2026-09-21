# 报告关联配置粒度设计决策

## 问题

### 用户提问

> 单个页面的多个区域或多个组件，这种又如何考虑，是否暂时先不考虑到这么细的粒度。比如中高端客户运营概览页中有好几块（整体指标、价值提升、规模发展、融合加固、客群看管等）

### 问题分析

用户提出的是关于报告展示位置的粒度问题：
- **当前设计**：页面级别（整个概览页作为一个展示位置）
- **潜在需求**：组件级别（页面内的某个区域或组件作为展示位置）

**示例**：
```
中高端客户运营概览页
├── 整体指标区域
├── 价值提升区域
├── 规模发展区域
├── 融合加固区域
└── 客群看管区域
```

用户可能希望：报告只展示在"价值提升"区域，而不是整个概览页。

## 决策

### 当前阶段：不支持组件级别 ✅

**决策理由**：

1. **满足当前核心需求**
   - 当前需求主要是"报告在哪些页面展示"
   - 用户更关注报告的可访问性，而不是精确的位置
   - 页面级别的粒度已经足够满足大部分场景

2. **降低复杂度**
   - 页面级别的配置简单直观
   - 用户理解成本低，上手快
   - 减少配置时间，提升效率

3. **扩展性强**
   - 当前架构支持未来扩展到组件级别
   - 可以渐进式地增加功能
   - 不会因为设计限制而需要重构

4. **维护成本低**
   - 页面结构变动对配置影响小
   - 不需要频繁更新组件结构定义
   - 减少维护工作

### 复杂度对比

| 维度 | 页面级别（当前） | 组件级别（未来） |
|------|----------------|----------------|
| **选择器层级** | 2级（场景 → 页面） | 3级（场景 → 页面 → 组件） |
| **配置复杂度** | 简单，选择页面即可 | 复杂，需要选择页面内的组件 |
| **用户理解成本** | 低 | 高 |
| **页面结构变动影响** | 低 | 高（组件变动需要调整配置） |
| **维护成本** | 低 | 高 |
| **数据结构复杂度** | 简单 | 复杂（需要管理组件ID和层级） |
| **配置时间** | 短 | 长 |
| **学习曲线** | 平缓 | 陡峭 |

### 组件级别的具体问题

1. **组件标识规范**
   - 需要定义统一的组件ID规范
   - 需要管理组件的层级关系
   - 组件ID冲突问题

2. **页面结构管理**
   - 每个页面需要定义自己的组件结构
   - 页面结构变动时需要更新配置
   - 新增/删除组件时需要调整关联配置

3. **用户选择器**
   - 需要支持3级联动选择
   - UI复杂度增加
   - 交互逻辑复杂

4. **报告展示逻辑**
   - 页面内部需要支持多个报告展示位置
   - 需要处理多个报告在同一个组件内的冲突
   - 需要处理层级继承（组件级 → 页面级）

5. **冲突处理**
   - 如果多个报告配置到同一个组件，如何处理？
   - 如何排序？
   - 如何限制数量？

## 未来扩展方案

### 1. 组件标识规范

**扩展页面ID格式**：

```
当前：{module}.{scenario}.{page_type}.{unique_id}
未来：{module}.{scenario}.{page_type}.{unique_id}.{component_id}
```

**示例**：
```
页面ID：market.mid_high_end.overview
组件ID：
- market.mid_high_end.overview.overall_metrics  (整体指标)
- market.mid_high_end.overview.value_improvement  (价值提升)
- market.mid_high_end.overview.scale_development  (规模发展)
- market.mid_high_end.overview.consolidation  (融合加固)
- market.mid_high_end.overview.customer_management  (客群看管)
```

### 2. 数据结构扩展

```typescript
// 组件元数据
export interface ComponentMetadata {
  componentId: string
  componentName: string
  componentType: 'metrics' | 'chart' | 'table' | 'custom'
  parentId?: string
  order: number
}

// 页面元数据（扩展）
export interface PageMetadata {
  pageId: string
  pageName: string
  pageType: PageType
  moduleId: string
  scenarioId?: string
  pagePath: string
  isTreePage?: boolean
  treeConfigId?: string
  components?: ComponentMetadata[]  // 新增：页面组件列表
  metadata?: Record<string, any>
}

// 页面分组项（扩展）
export interface PageGroupItem {
  pageId: string
  pageName: string
  pageType: PageType
  pagePath: string
  hasComponents?: boolean  // 新增：是否有子组件
  components?: ComponentMetadata[]  // 新增：组件列表
}
```

### 3. 选择器扩展

**3级联动选择器**：
```
场景 → 页面 → 组件
```

**交互设计**：
1. 用户展开场景
2. 用户选择页面
3. 如果页面有组件，则可以进一步展开选择组件
4. 支持页面级选择（选择整个页面）和组件级选择（选择特定组件）

**UI示例**：
```
├── 中高端客户运营（场景）
│   ├── 中高端客户运营概览页 [可展开]
│   │   ├── ✓ 整体指标
│   │   ├── ✓ 价值提升
│   │   └── 规模发展
│   └── 拍照中高端客户规模保有率 [无组件，直接选择]
└── 离网维系（场景）
    └── 离网维系概览页 [可展开]
        └── ...
```

### 4. 页面组件配置

**每个页面定义自己的组件结构**：

```typescript
// src/lib/page-components/mid-high-end-overview.ts
export const midHighEndOverviewComponents: ComponentMetadata[] = [
  {
    componentId: 'overall_metrics',
    componentName: '整体指标',
    componentType: 'metrics',
    order: 1,
  },
  {
    componentId: 'value_improvement',
    componentName: '价值提升',
    componentType: 'metrics',
    order: 2,
  },
  {
    componentId: 'scale_development',
    componentName: '规模发展',
    componentType: 'metrics',
    order: 3,
  },
  {
    componentId: 'consolidation',
    componentName: '融合加固',
    componentType: 'metrics',
    order: 4,
  },
  {
    componentId: 'customer_management',
    componentName: '客群看管',
    componentType: 'metrics',
    order: 5,
  },
]
```

### 5. 报告展示逻辑

**层级继承**：
```typescript
const getReportsForComponent = async (pageId: string, componentId: string) => {
  // 优先查询组件级别的报告
  const componentReports = await queryReports(`${pageId}.${componentId}`)
  
  // 如果组件级别没有报告，则查询页面级别的报告
  if (componentReports.length === 0) {
    return await queryReports(pageId)
  }
  
  return componentReports
}
```

**继承规则**：
- 组件级别报告优先展示
- 如果组件级别没有报告，则展示页面级别报告
- 支持混合展示（某些区域展示组件级报告，某些区域展示页面级报告）

### 6. 实施路径

**阶段1：准备阶段**
1. 定义组件标识规范
2. 建立页面组件配置机制
3. 扩展数据结构

**阶段2：支持阶段**
1. 扩展选择器支持3级选择
2. 实现组件级别的报告查询
3. 支持页面内的报告展示

**阶段3：优化阶段**
1. 提供组件配置管理界面
2. 支持组件的动态调整
3. 提供可视化配置工具

### 7. 向后兼容

**保持兼容性**：
- 页面级别的关联配置继续有效
- 自动迁移：页面级别的报告可以自动映射到页面内的所有组件
- 用户可以选择是否启用组件级别配置

## 总结

### 当前设计：页面级别 ✅

**优势**：
- ✅ 满足当前核心需求
- ✅ 配置简单，用户理解成本低
- ✅ 扩展性强，支持未来升级
- ✅ 维护成本低
- ✅ 符合用户心智模型

**适用场景**：
- 报告需要在整个页面内展示
- 用户关注报告的可访问性，而非精确位置
- 页面内的所有区域都需要查看报告

### 未来扩展：组件级别 🔮

**何时需要**：
- 用户明确提出组件级别的需求
- 有明确的业务场景需要精细控制
- 用户调研和验证支持

**实施前提**：
- 明确的业务需求
- 充分的用户调研
- 完善的设计方案
- 可用的开发资源

**实施原则**：
- 渐进式实施，分阶段推进
- 保持向后兼容
- 用户可以选择是否启用
- 提供清晰的升级路径

### 建议

**当前阶段**：
- ✅ 继续使用页面级别的设计
- ✅ 关注用户反馈，收集组件级别的需求
- ✅ 保持架构的可扩展性

**未来阶段**：
- 🔮 如果用户反馈强烈，考虑实施组件级别
- 🔮 按照渐进式路径实施
- 🔮 确保向后兼容和用户体验

## 附录：用户调研建议

如果未来考虑实施组件级别，建议先进行用户调研：

1. **需求验证**
   - 用户是否真的需要组件级别的控制？
   - 有哪些具体的业务场景？
   - 预期的收益是什么？

2. **用户访谈**
   - 与典型用户进行深度访谈
   - 了解他们的实际工作流程
   - 观察他们的操作习惯

3. **原型测试**
   - 制作组件级别选择器的原型
   - 进行可用性测试
   - 收集用户反馈

4. **成本效益分析**
   - 实施成本（开发、维护、培训）
   - 预期收益（效率提升、满意度）
   - ROI计算

5. **决策依据**
   - 基于调研结果做出决策
   - 确保投入产出比合理
   - 优先级排序

---

**文档版本**：v1.0  
**创建日期**：2026-01-30  
**决策状态**：当前使用页面级别，暂不支持组件级别  
**下次评审**：3个月后或用户明确提出需求时
