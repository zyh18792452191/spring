# DESIGN.md - 市场数智运营平台

## 品牌与视觉方向
电信运营商（新疆移动）智慧运营平台，深蓝电信蓝 + 中性灰底 + 语义化状态色，克制、数据密集、信息层级清晰。禁止花哨渐变与装饰性插画，以表格、卡片、徽标承载信息。

## Design Tokens

### 色彩
- 主行动色：#0085D0（电信蓝），hover #006BB0；`bg-[#0085D0] text-white` 用于搜索/新增/确认等主按钮、链接文字（与全站业务页面一致）
- 页面底色：gray-50；内容卡片：白底 + border-gray-200 + shadow-none
- AI 能力标识：紫色系 `bg-violet-50 text-violet-700 border-violet-200`（Badge，可带 Sparkles 图标），用于"AI"判定条件标签、预警依据卡片
- 状态语义色（Badge，bg-50 底 + 600 文字 + 100/200 边框）：
  - 绿 = 启用中 / 未误判 / 已执行未预警 / 正常
  - 红 = 误判 / 已执行已预警 / 异常
  - 黄 = 待确认 / 预警中
  - 灰 = 已停用 / 无意义占位（—）

### 字体排版
- 页面标题：text-lg font-semibold text-gray-900
- 模块标题：text-sm font-medium text-gray-900，前置 14px 主题色图标
- 字段标签：text-xs text-gray-500；主值：text-sm text-gray-900
- 表格表头：TableRow bg-gray-100，th text-gray-600；数据行 hover:bg-gray-50

### 圆角与控件
- 统一使用 shadcn 默认 radius（组件内建 rounded-md/lg），卡片圆角默认即可
- 表格内容区 rounded-md border；行内小按钮 h-7 text-xs

### 布局
- 列表/详情页统一：外层 p-6 flex flex-col gap-4；筛选与表格各自 Card 承载；筛选栏一行排布 + 右侧主操作按钮
- 详情页头部：返回(Outline, ArrowLeft) + 标题横排

## 组件规范（预警类模块）
- 判定条件列 = AI Badge + 条件文本（flex items-center gap-1.5）
- 分页：底部左侧"共 N 条数据 + 每页 10/20/50 条"，右侧 上一页/页码/下一页
- 展示形式汇总：仅汇总视图下表格上方显示浅色说明行（bg-gray-50 text-gray-500 text-xs），汇总列内用"等 N 个范围/共 N 个指标"表述
- 预警粒度可选：省份/地市/区县/网格；预警范围随粒度联动（省份→新疆维吾尔自治区，地市→16 个地市分公司…）
- 弹窗内必填项带红色 *；主按钮蓝色、取消 Outline

## 交互与状态
- 新增/编辑弹窗校验失败：字段下红字提示，不阻断弹窗关闭以外的操作
- 明细账期"待确认"行操作列显示主按钮"确认"；已确认行显示链接样"查看"
