# 页面编辑器快速指南

## 快速启用

在任意页面 URL 后添加 `?editor=true` 即可启用编辑器：

```
https://your-domain.com/page?editor=true
```

或按 `Ctrl+Shift+E` / `Cmd+Shift+E` 切换编辑器。

## 重要提示

⚠️ **编辑器只能修改带有唯一 `id` 属性的元素**

### ❌ 错误写法
```tsx
<h3 className="text-lg font-semibold">标题</h3>
```

### ✅ 正确写法
```tsx
<h3 id="unique-title" className="text-lg font-semibold">标题</h3>
```

## 使用步骤

1. 启用编辑器（添加 `?editor=true` 参数）
2. 点击"开启编辑"按钮
3. 点击页面中需要编辑的元素
4. 在右侧面板修改样式、内容或布局
5. 点击"保存"按钮
6. 页面自动刷新，显示更新后的内容

## 支持的编辑

- ✅ 文本内容
- ✅ 颜色（文字颜色、背景颜色）
- ✅ 字体（大小、粗细）
- ✅ 布局（对齐、边距、圆角）
- ✅ 属性（className、id）

## 详细文档

完整文档请查看：[PAGE_EDITOR_GUIDE.md](./PAGE_EDITOR_GUIDE.md)
