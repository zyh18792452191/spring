# 编辑器默认状态说明

## ✅ 当前行为

### 默认状态
- **编辑器默认关闭**（灰色浮动按钮）
- 每次刷新页面，编辑器都会重置为关闭状态
- 不会自动恢复上次的编辑状态

### 启用编辑器的方式

用户必须主动操作才能启用编辑器：

1. **点击浮动按钮**（推荐）
   - 找到页面右下角的灰色圆形按钮
   - 快速点击按钮（不要拖动）
   - 按钮变为蓝色，编辑器启用

2. **使用URL参数**
   - 在地址栏添加 `?editor=true`
   - 例如：`http://9.129.66.5:5000/page-editor-demo?editor=true`

3. **使用快捷键**
   - 按 `Ctrl+Shift+E`（Windows/Linux）
   - 或 `Cmd+Shift+E`（Mac）

### 禁用编辑器的方式

1. **点击浮动按钮**
   - 再次点击蓝色浮动按钮
   - 按钮变回灰色，编辑器关闭

2. **使用URL参数**
   - 在地址栏添加 `?editor=false`

3. **使用快捷键**
   - 再次按 `Ctrl+Shift+E` 或 `Cmd+Shift+E`

---

## 🔄 行为变更说明

### 之前的逻辑（已废弃）
```
1. 页面加载时检查localStorage
2. 如果localStorage中有'true'，自动启用编辑器
3. 这可能导致用户刷新页面后编辑器仍然开启
```

### 现在的逻辑
```
1. 页面加载时，编辑器始终默认关闭
2. 只有URL参数明确指定 `?editor=true` 才会启用
3. 用户必须主动点击按钮或使用快捷键才能启用
```

---

## 💡 为什么这样设计？

### 优点
1. **用户控制**：编辑器状态完全由用户控制，不会意外开启
2. **一致性**：每次访问页面都是相同的初始状态
3. **安全性**：避免编辑器意外开启，误操作页面元素
4. **简洁性**：不需要清除localStorage就能关闭编辑器

### 适用场景
- 生产环境：默认关闭，避免误操作
- 演示环境：通过URL参数控制是否启用
- 开发环境：使用快捷键快速切换

---

## 📋 测试步骤

### 测试默认关闭状态
1. 清除浏览器的localStorage（可选）
2. 刷新页面
3. 查看浮动按钮，应该是**灰色**
4. 尝试点击页面元素，应该**无法选中**

### 测试启用编辑器
1. 点击灰色浮动按钮
2. 按钮变为**蓝色**
3. 页面左上角显示"编辑模式已开启"
4. 点击元素，应该可以选中并编辑

### 测试刷新页面
1. 启用编辑器（按钮变为蓝色）
2. 刷新页面（F5）
3. 查看浮动按钮，应该恢复为**灰色**
4. 编辑器状态已重置

---

## 🛠️ 技术细节

### 代码实现
```typescript
export default function EditorWrapper({ children }: EditorWrapperProps) {
  const [editorEnabled, setEditorEnabled] = useState(false); // 默认false

  useEffect(() => {
    // 只检查URL参数，不检查localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const editorParam = urlParams.get('editor');

    // 只有URL参数明确指定时才改变状态
    if (editorParam === 'true') {
      setEditorEnabled(true);
      localStorage.setItem('page-editor-enabled', 'true');
    } else if (editorParam === 'false') {
      setEditorEnabled(false);
      localStorage.setItem('page-editor-enabled', 'false');
    }
    // 默认状态始终是false
  }, []);
  // ...
}
```

### localStorage的作用
- **保存状态**：仍然保存用户的操作到localStorage
- **不恢复状态**：页面加载时不从localStorage恢复状态
- **用途**：可用于统计或其他功能，但不影响编辑器默认状态

---

## 🎯 使用建议

### 生产环境
```
# 默认关闭，需要时通过URL参数启用
http://your-site.com/?editor=true
```

### 演示环境
```
# 为演示人员提供启用链接
演示链接：http://your-site.com/demo?editor=true
```

### 开发环境
```
# 使用快捷键快速切换
Ctrl+Shift+E：启用/禁用编辑器
```

---

## ✅ 验证清单

- [ ] 页面加载时，浮动按钮是灰色
- [ ] 点击灰色按钮后，按钮变为蓝色
- [ ] 点击蓝色按钮后，按钮变回灰色
- [ ] 刷新页面后，按钮始终是灰色
- [ ] 使用 `?editor=true` 时，按钮是蓝色
- [ ] 使用 `?editor=false` 时，按钮是灰色
- [ ] 按快捷键 `Ctrl+Shift+E` 可以切换状态
