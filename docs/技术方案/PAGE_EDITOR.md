# 页面编辑器使用指南

## 功能概述

可视化页面编辑器允许您在浏览器中直接编辑页面元素，修改样式、内容和布局，所见即所得。

## 核心功能

### ✅ 已实现功能

1. **元素选中和高亮**
   - 点击任意页面元素即可选中
   - 选中元素会显示蓝色高亮边框
   - 显示元素尺寸信息

2. **样式编辑**
   - 修改文字颜色（支持预设颜色和自定义颜色）
   - 修改背景颜色
   - 调整字体大小
   - 修改字体粗细
   - 设置文本对齐方式
   - 调整内边距和外边距
   - 修改圆角

3. **内容编辑**
   - 修改文本内容
   - 编辑元素ID
   - 修改CSS Class

4. **实时预览**
   - 所有修改立即生效
   - 无需刷新页面

5. **编辑模式开关**
   - 通过右上角按钮开启/退出编辑模式
   - 编辑模式下显示提示信息

## 使用方法

### 基础使用

```tsx
import { PageEditor } from '@/components/PageEditor';

function MyPage() {
  return (
    <PageEditor enabled={true}>
      {/* 您的页面内容 */}
      <div>
        <h1>标题</h1>
        <p>内容</p>
      </div>
    </PageEditor>
  );
}
```

### 启用/禁用编辑器

通过 `enabled` 属性控制：

```tsx
// 开启编辑器
<PageEditor enabled={true}>
  {/* 页面内容 */}
</PageEditor>

// 禁用编辑器（正常显示）
<PageEditor enabled={false}>
  {/* 页面内容 */}
</PageEditor>
```

### 在现有页面中启用

如果您想在现有页面中启用编辑器，需要修改页面的 layout 或页面组件：

#### 方法 1：在 Layout 中启用（影响所有页面）

```tsx
// src/app/portal/layout.tsx
import { PageEditor } from '@/components/PageEditor';

export default function PortalLayout({ children }) {
  const isEditMode = process.env.NEXT_PUBLIC_EDITOR_MODE === 'true';

  return (
    <PageEditor enabled={isEditMode}>
      <Header />
      <main>
        {children}
      </main>
    </PageEditor>
  );
}
```

然后通过环境变量控制：

```bash
# 开启编辑模式
NEXT_PUBLIC_EDITOR_MODE=true

# 关闭编辑模式
NEXT_PUBLIC_EDITOR_MODE=false
```

#### 方法 2：在特定页面启用（推荐用于开发）

```tsx
// src/app/my-page/page.tsx
import { PageEditor } from '@/components/PageEditor';

const IS_DEV = process.env.NODE_ENV === 'development';

export default function MyPage() {
  return (
    <PageEditor enabled={IS_DEV}>
      {/* 页面内容 */}
    </PageEditor>
  );
}
```

### 查看演示

访问演示页面：

```
http://localhost:5000/page-editor-demo
```

## 编辑器操作

### 1. 开启编辑模式

点击右上角的 **"开启编辑"** 按钮。

### 2. 选择元素

- 点击页面上的任意元素
- 元素会被蓝色边框高亮
- 右侧显示属性编辑面板

### 3. 编辑样式

在右侧面板中切换到不同标签：

- **样式标签**：修改颜色、字体等样式
- **内容标签**：修改文本内容、ID、Class
- **布局标签**：修改对齐、边距、圆角

### 4. 保存更改

点击右侧面板的 **"保存"** 按钮。

### 5. 退出编辑模式

点击右上角的 **"退出编辑"** 按钮。

## 注意事项

### ⚠️ 重要提醒

1. **当前限制**
   - 修改仅在浏览器中生效
   - 刷新页面后会恢复原状
   - 完整的代码保存功能正在开发中

2. **使用场景**
   - 适用于快速原型设计
   - 适用于样式调试
   - 不适用于生产环境
   - 请勿在生产环境启用

3. **兼容性**
   - 部分复杂组件可能不支持编辑
   - 动态生成的内容可能无法正确识别
   - 某些CSS属性可能无法编辑

4. **最佳实践**
   - 建议在开发环境使用
   - 修改后记录需要调整的样式
   - 在代码中实现最终的样式修改

## 配色方案

编辑器提供了预设的中国移动品牌色：

- 中国移动蓝：`#0085D0`
- 浅蓝：`#60B3E2`
- 极浅蓝：`#C0E1F3`
- 红色：`#EF4444`
- 绿色：`#10B981`
- 黄色：`#F59E0B`

## 后续开发计划

- [ ] 实现代码自动保存到文件
- [ ] 支持拖拽调整元素位置
- [ ] 支持复制/粘贴元素
- [ ] 支持撤销/重做
- [ ] 支持响应式预览
- [ ] 支持导出配置
- [ ] 支持版本管理

## 常见问题

### Q: 修改后如何保存到代码文件？

A: 当前版本仅支持在浏览器中预览修改效果。代码保存功能正在开发中。建议：

1. 使用编辑器快速调整样式
2. 记录需要修改的样式
3. 在源代码中应用这些样式

### Q: 为什么某些元素无法点击编辑？

A: 可能的原因：

- 元素是只读的（如 `disabled` 的输入框）
- 元素被其他元素遮挡
- 元素使用了特殊的点击事件

### Q: 如何在不同页面启用编辑器？

A: 参考"使用方法"章节中的示例，在每个需要编辑的页面中包裹 `<PageEditor>` 组件。

### Q: 编辑器会影响页面性能吗？

A: 编辑器只在 `enabled={true}` 时会初始化，禁用时不会影响页面性能。

## 技术支持

如有问题或建议，请联系开发团队。
