# 页面编辑器使用文档

## 概述

页面编辑器是一个强大的可视化编辑工具，允许您直接在浏览器中编辑页面元素，并将修改保存到源代码文件。

## 快速开始

### 1. 启用编辑器

编辑器已集成到所有页面中，默认禁用。您可以通过以下方式启用：

#### 方法 1：URL 参数（推荐）

在浏览器地址栏的 URL 末尾添加 `?editor=true` 参数：

```
https://your-domain.com/page?editor=true
```

#### 方法 2：键盘快捷键

按 `Ctrl+Shift+E`（Windows/Linux）或 `Cmd+Shift+E`（Mac）切换编辑器开关。

### 2. 使用编辑器

1. **开启编辑模式**：点击右上角的"开启编辑"按钮
2. **选择元素**：点击页面中任意需要编辑的元素
3. **编辑元素**：在右侧属性面板中修改样式、内容或布局
4. **保存修改**：点击"保存"按钮将修改保存到源文件
5. **查看结果**：页面会自动刷新，显示更新后的内容

## 功能说明

### 支持的编辑类型

#### 1. 样式编辑
- 文字颜色
- 背景颜色
- 字体大小
- 字体粗细
- 文本对齐
- 内边距（Padding）
- 外边距（Margin）
- 圆角（Border Radius）

#### 2. 内容编辑
- 文本内容

#### 3. 属性编辑
- className
- id

## 重要限制

### ⚠️ 元素必须具有唯一标识符

**这是最重要的限制：**

为了确保修改能够正确保存到源文件，**被编辑的元素必须具有唯一的 `id` 属性**。

#### ❌ 错误示例（不可靠）

```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold">标题 1</h3>
</Card>

<Card className="p-6">
  <h3 className="text-lg font-semibold">标题 2</h3>
</Card>
```

**问题**：两个标题使用相同的 className，编辑时无法精确定位。

#### ✅ 正确示例（推荐）

```tsx
<Card className="p-6">
  <h3 id="card1-title" className="text-lg font-semibold">标题 1</h3>
</Card>

<Card className="p-6">
  <h3 id="card2-title" className="text-lg font-semibold">标题 2</h3>
</Card>
```

**优点**：每个元素都有唯一的 id，可以精确定位。

### 命名规范

建议使用语义化的 id 命名：

```
{页面名称}-{元素类型}-{序号}
```

**示例：**
- `dashboard-header-title`
- `sidebar-menu-1`
- `form-input-name`
- `card-primary-title`
- `button-submit`

## 为新页面添加编辑能力

### 步骤 1：创建页面

正常创建您的 Next.js 页面，编辑器会自动集成，无需额外配置。

### 步骤 2：为可编辑元素添加唯一 ID

在需要编辑的元素上添加 `id` 属性：

```tsx
export default function MyPage() {
  return (
    <div>
      <h1 id="page-title">我的页面</h1>
      <p id="page-description">这是页面描述</p>

      <div className="grid grid-cols-2 gap-4">
        <div id="card-primary">
          <h2 id="card-primary-title">主卡片</h2>
          <p id="card-primary-content">这是主卡片的内容</p>
        </div>

        <div id="card-secondary">
          <h2 id="card-secondary-title">次卡片</h2>
          <p id="card-secondary-content">这是次卡片的内容</p>
        </div>
      </div>

      <button id="button-submit">提交</button>
    </div>
  );
}
```

### 步骤 3：测试

1. 访问页面，添加 `?editor=true` 参数
2. 开启编辑模式
3. 点击带有 id 的元素
4. 修改样式或内容
5. 保存修改
6. 刷新页面验证

## 修改保存机制

### 工作流程

1. **浏览器编辑**：用户在浏览器中修改元素样式/内容
2. **记录修改**：所有修改被记录在内存中
3. **点击保存**：修改数据发送到后端 API
4. **解析源文件**：后端解析对应的源文件（`.tsx` 文件）
5. **查找元素**：通过 `id` 或 `className` 在 AST 中查找元素
6. **应用修改**：修改源文件的 AST
7. **生成代码**：将 AST 转换回代码
8. **保存文件**：将修改后的代码写入源文件
9. **自动刷新**：页面自动刷新，显示更新后的内容

### 文件路径映射

编辑器会根据页面路径自动定位源文件：

| 页面路径 | 源文件路径 |
|---------|----------|
| `/` | `src/app/page.tsx` |
| `/page-editor-demo` | `src/app/page-editor-demo/page.tsx` |
| `/dashboard` | `src/app/dashboard/page.tsx` |

如需添加新的映射，请编辑：`src/app/api/page-editor/save/utils.ts`

```typescript
const pageToFileMap: Record<string, string> = {
  '/page-editor-demo': 'src/app/page-editor-demo/page.tsx',
  '/': 'src/app/page.tsx',
  '/your-new-page': 'src/app/your-new-page/page.tsx', // 添加新映射
};
```

## 禁用编辑器

如果您需要禁用编辑器：

### 临时禁用

在 URL 中添加 `?editor=false` 参数：

```
https://your-domain.com/page?editor=false
```

### 永久禁用

按 `Ctrl+Shift+E` 或 `Cmd+Shift+E` 关闭编辑器。

### 清除状态

清除浏览器 localStorage 中的 `page-editor-enabled` 键。

## 最佳实践

### 1. 为所有可编辑元素添加唯一 ID

这是最重要的一点。即使您暂时不需要编辑，也建议为重要的元素添加 id，以便将来需要编辑。

### 2. 使用语义化命名

使用清晰、语义化的 id 名称，便于维护和理解。

### 3. 定期备份代码

编辑器会直接修改源代码文件，建议在大量编辑前备份代码或使用版本控制系统（Git）。

### 4. 在开发环境中使用

建议仅在开发环境中使用编辑器，不要在生产环境中启用。

### 5. 复杂组件使用条件渲染

对于复杂的组件，可以在编辑模式下显示简化版本：

```tsx
{!isEditing ? <ComplexComponent /> : <SimplifiedComponent />}
```

## 常见问题

### Q: 为什么修改后刷新页面又没了？

A: 请确保编辑的元素有唯一的 `id` 属性。如果只有 `className`，可能会匹配到错误的元素。

### Q: 可以编辑动态内容吗？

A: 可以，但需要确保动态内容也包含在带有唯一 id 的元素中。

### Q: 可以修改组件内部的元素吗？

A: 可以，但需要知道组件内部元素的 id。建议为组件的子元素也添加唯一的 id。

### Q: 修改会丢失代码格式吗？

A: 会。编辑器会重新生成代码，可能会丢失部分格式。建议修改后使用 Prettier 格式化代码。

### Q: 支持哪些修改类型？

A: 目前支持样式（style）、内容（content）和属性（attribute）的修改。复杂逻辑修改暂不支持。

## 技术实现

编辑器使用以下技术：
- **前端**：React + TypeScript + Tailwind CSS
- **AST 解析**：Babel Parser + Babel Traverse
- **代码生成**：Babel Generator
- **存储**：LocalStorage（编辑器状态）

## 支持

如遇问题，请检查：
1. 元素是否有唯一 id
2. 页面路径是否在映射表中
3. 浏览器控制台是否有错误信息
4. 源文件是否有写入权限

---

**最后更新**：2024-02-06
**版本**：1.0.0
