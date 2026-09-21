# 市场运营平台 - 设计规范

## 1. 指标树页面（离网维系）

### 1.1 数据显示规范

**节点数据要求**：
- 指标节点（business_metric, segment_metric）必须包含完整的数据：
  - `value`: 指标值（字符串，如 "78.5%", "125.6万"）
  - `yoy`: 环比增长率（数字，正数表示增长，负数表示下降）
  - `direction`: 指标方向（"positive" 或 "negative"）

**显示格式**（从左到右）：
```
[指标值] [箭头图标] [环比百分号]
```

**示例**：
- 增长：`78.5% ↑ 2.1%`
- 下降：`125.6万 ↓ 8.2%`
- 持平：`85.2% → 0%`

### 1.2 图标使用规范

**向上箭头（TrendingUp）**：
- 当 `yoy > 0` 时使用
- 颜色：根据指标方向判断
  - 对于 `direction: 'positive'`：绿色（text-green-600）
  - 对于 `direction: 'negative'`：红色（text-red-600）

**向下箭头（TrendingDown）**：
- 当 `yoy < 0` 时使用
- 颜色：根据指标方向判断
  - 对于 `direction: 'positive'`：红色（text-green-600）
  - 对于 `direction: 'negative'`：绿色（text-red-600）

### 1.3 颜色规范

**指标值颜色**：
- 增长（好）：text-green-600
- 下降（坏）：text-red-600

**环比颜色**：
- 绿色：代表增长或向好
- 红色：代表下降或向差

### 1.4 代码实现

```tsx
// 指标值和环比显示
{node.value && (
  <div className="flex items-center justify-between mt-2 gap-1">
    {/* 指标值 */}
    <div className={`text-sm font-bold ${getMetricValueColor(node)}`}>
      {node.value}
    </div>
    {/* 环比（带箭头） */}
    {node.yoy !== undefined && node.yoy !== null && (
      <div className={`flex items-center gap-0.5 text-xs ${getYoyColor(node)}`}>
        {node.yoy > 0 ? (
          <TrendingUp className="w-3 h-3" />
        ) : node.yoy < 0 ? (
          <TrendingDown className="w-3 h-3" />
        ) : null}
        <span>{Math.abs(node.yoy)}%</span>
      </div>
    )}
  </div>
)}
```

### 1.5 数据结构

```typescript
interface TreeNode {
  id: string;
  name: string;
  metricCode?: string;
  type: NodeType;
  children: TreeNode[];
  collapsed?: boolean;
  value?: string;          // 指标值，必填
  yoy?: number;            // 环比，必填
  isProblem?: boolean;
  isAlert?: boolean;
  direction?: 'positive' | 'negative'; // 指标方向
}
```

### 1.6 注意事项

1. **数据完整性**：所有业务指标和客群指标节点都应该包含 `value` 和 `yoy`
2. **yoy 判断**：使用 `node.yoy !== undefined && node.yoy !== null` 避免显示空数据
3. **零值处理**：当 `yoy === 0` 时，显示 `0%` 但不显示箭头
4. **客户标签节点**：customer_tag 类型的节点通常不需要显示指标数据

---

## 2. 策略匹配页面

### 2.1 整体布局
- 顶部：Header 组件（forceActivePath="/portal/churn-retention"）
- 步骤导航：数据洞察 → 策略匹配 → 调度派发
- 页面标题：策略匹配 + 当前分析指标

### 2.2 根因指标区域
**标题行**：
- 左侧：标题"根因指标"
- 右侧："新增指标"按钮（蓝色边框，带 Plus 图标）

**卡片结构**（支持多个）：
```
┌─────────────────────────────────────────────┐
│ [图标] 指标名称    [删除] [展开/收起]       │
│       关联度 XX%                            │
├─────────────────────────────────────────────┤
│ [!] 原因分析              [编辑]             │
│ ┌──────────────────────────────────────┐   │
│ │ 原因分析内容（橙色背景）              │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ [i] 推荐策略                                │
│ ┌──────────────────┬──────────────────┐   │
│ │潜在风险客群      │策略               │   │
│ ├──────────────────┼──────────────────┤   │
│ │[拖拽]客群名[删除]│策略内容[Bot][编辑]│   │
│ │                  │[添加策略]         │   │
│ ├──────────────────┼──────────────────┤   │
│ │[添加潜在客户群]  │                  │   │
│ └──────────────────┴──────────────────┘   │
└─────────────────────────────────────────────┘
```

### 2.3 卡片操作按钮规范

**指标名称右侧**：
- ❌ 不要编辑图标
- ✅ 删除按钮 (Trash2)
- ✅ 展开/收起图标 (ChevronDown/ChevronUp)

**原因分析标题右侧**：
- ✅ 编辑按钮 (Edit2)
- ✅ 点击弹出编辑对话框

**策略卡片操作按钮**：
- 右上角：
  - 🤖 Bot 图标：一直显示（AI生成策略）
  - ✏️ Edit 按钮：hover 显示
  - ❌ X 按钮：hover 显示
- 注意：Bot 图标在人工编辑策略后消失

### 2.4 表格布局规范

**推荐策略必须使用真正的 `<table>`**：
```jsx
<table className="w-full border-collapse border border-gray-200">
  <thead>
    <tr className="bg-gray-50 border-b border-gray-200">
      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 w-[300px]">
        潜在风险客群
      </th>
      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
        策略
      </th>
    </tr>
  </thead>
  <tbody>
    {/* 每行是一个客群-策略对 */}
  </tbody>
</table>
```

### 2.5 颜色规范
- 主色：#3B82F6 (蓝色)
- 原因分析背景：橙色 (#orange-50, border-orange-100)
- 策略卡片背景：蓝色 (#blue-50, border-blue-200)
- Bot 图标：紫色 (#text-purple-500)

### 2.6 交互规范
- **原因分析**：可编辑，点击编辑图标弹出对话框
- **指标卡片**：可展开/收起，可删除
- **客群**：可拖拽、可删除、可添加
- **策略**：可编辑、可删除、可添加
- **AI标记**：人工编辑后自动消失

### 2.7 弹窗规范
- 新增指标：选择指标列表 → 确认
- 添加客群：选择客群类型 → 确认
- 编辑原因分析：Textarea → 保存
- 编辑策略：Textarea → 保存

### 2.8 数据结构
```typescript
interface RootCauseCard {
  id: number;
  indicatorName: string;
  indicatorId: string;
  correlation: string;
  isExpanded: boolean;
  rootCauseAnalysis: string;
  customerStrategyPairs: CustomerStrategyPair[];
}

interface CustomerStrategyPair {
  id: number;
  customerGroup: string;
  strategies: Strategy[];
}

interface Strategy {
  id: number;
  content: string;
  isAIGenerated: boolean;
  isEditing: boolean;
}
```

### 2.9 关键注意事项

1. **不要改一个功能时影响其他功能**：修改时要仔细检查相关代码
2. **表格必须使用 `<table>`**：不能只用 grid 模拟，要保证严格的列对齐
3. **图标位置要准确**：
   - Bot 图标：右上角，一直显示
   - 编辑删除：右上角，hover 显示
   - 指标操作：右侧，无编辑图标
4. **多卡片状态管理**：所有操作都要关联到正确的卡片 ID
5. **展开收起**：收起时隐藏原因分析和推荐策略

### 2.10 后续优化建议
- 考虑添加拖拽排序功能
- 考虑添加批量操作功能
- 考虑添加导出功能
