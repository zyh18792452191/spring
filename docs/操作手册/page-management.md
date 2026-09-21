# 页面管理系统使用指南

## 概述

页面管理系统用于管理市场运营平台的所有页面、业务场景和模块。

## 首次使用

### 步骤1：初始化数据库表结构

由于项目使用Supabase作为数据库，需要手动执行SQL脚本来创建表结构。

1. 访问页面管理页面：`http://localhost:5000/workspace/admin/pages`
2. 点击"初始化数据库"按钮
3. 在弹出的对话框中，点击"复制SQL"或"下载SQL"获取初始化脚本
4. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
5. 进入你的项目
6. 点击左侧菜单的 "SQL Editor"
7. 粘贴SQL脚本并点击 "RUN" 执行
8. 返回页面管理页面，点击"验证并初始化数据"

### 步骤2：初始化页面数据

执行完SQL脚本后，点击"验证并初始化数据"按钮，系统会自动填充以下数据：

- 6个模块（门户首页、离网维系、中高端客户运营、策略管理、调度管理、工作台）
- 30个业务场景
- 35个页面（包括14个指标树页面）

## 使用说明

### 查看页面列表

1. 在页面管理页面，默认显示"树形视图"
2. 点击模块名称可以展开/收起该模块下的页面
3. 查看页面详细信息：
   - 页面名称
   - 页面类型（概览、指标树、列表、表单、仪表板、门户）
   - 业务场景
   - 页面路径
   - 是否指标树页面

### 添加新页面

1. 切换到"添加页面"标签
2. 填写页面信息：

**必填字段：**
- 页面代码：唯一标识符，例如 `PAGE_CHURN_RETENTION`
- 页面名称：显示名称，例如 "离网维系"
- 页面类型：选择下拉框中的类型
- 页面路径：URL路径，例如 `/portal/churn-retention`
- 所属模块：从下拉框选择
- 业务场景：从下拉框选择（会根据所属模块过滤）

**可选字段：**
- 是否指标树页面：勾选表示这是一个指标树页面
- 排序顺序：数字，控制显示顺序

3. 点击"添加页面"按钮

### 刷新数据

点击"刷新"按钮重新获取最新的页面数据。

## 数据结构

### 模块 (Module)

表示系统的主要功能模块，例如：
- PORTAL - 门户首页
- CHURN_RETENTION - 离网维系
- MID_HIGH_CUSTOMER - 中高端客户运营
- STRATEGY - 策略管理
- DISPATCH - 调度管理
- WORKSPACE - 工作台

### 业务场景 (Business Scenario)

模块下的具体业务场景，例如：
- SCENARIO_CHURN_ALL - 当月全量客户离网客户数
- SCENARIO_CHURN_MID_HIGH - 当月拍照中高端客户离网客户数
- SCENARIO_MID_HIGH_VALUE - 拍照中高端价值保有率

### 页面 (Page)

系统的具体页面，每个页面归属于一个业务场景，包含以下信息：
- 页面代码（唯一）
- 页面名称
- 页面类型
- 页面路径
- 所属场景和模块
- 是否指标树页面

## API接口

### 获取页面树形结构

```
GET /api/pages/tree
```

返回示例：
```json
{
  "success": true,
  "stats": {
    "moduleCount": 6,
    "scenarioCount": 30,
    "pageCount": 35
  },
  "modules": [...],
  "scenarios": [...],
  "moduleStats": [...]
}
```

### 添加页面

```
POST /api/pages
Content-Type: application/json

{
  "page_code": "PAGE_NEW_PAGE",
  "page_name": "新页面",
  "page_type": "OVERVIEW",
  "page_path": "/new-page",
  "scenario_code": "SCENARIO_X",
  "module_code": "WORKSPACE",
  "is_tree_page": false,
  "sort_order": 1
}
```

### 获取初始化数据统计

```
GET /api/init-pages-data
```

### 初始化页面数据

```
POST /api/init-pages-data
```

### 获取数据库初始化SQL

```
GET /api/init-db
```

返回SQL脚本，用于创建数据库表结构。

## 常见问题

### Q: 为什么显示"没有可用的页面"？

A: 这表示数据库中没有页面数据。请先执行"初始化数据库"步骤，然后点击"初始化页面数据"按钮。

### Q: 模块或场景下拉框是空的？

A: 请确保已经成功执行了数据库初始化SQL脚本，并点击了"初始化页面数据"按钮。

### Q: 如何检查数据库是否已正确初始化？

A: 查看页面顶部的统计卡片，应该显示：
- 模块数量：6
- 业务场景数量：30
- 页面数量：35

### Q: 执行SQL脚本时报错怎么办？

A: 请检查：
1. SQL脚本是否完整复制
2. 是否有网络连接问题
3. Supabase项目是否正常
4. 查看错误信息并联系技术支持

## 开发说明

### 数据库表结构

所有表定义在 `migrations/create-tables.sql` 文件中，包括：
- `modules` - 模块表
- `business_scenarios` - 业务场景表
- `pages` - 页面表
- `report_templates` - 报告模板表
- `reports` - 报告表
- `report_associations` - 报告关联配置表

### TypeScript类型定义

数据库表对应的TypeScript类型定义在 `src/storage/database/shared/schema.ts` 中。

### 初始化数据

页面和场景的初始化数据在 `src/app/api/init-pages-data/route.ts` 中定义。

## 联系支持

如果遇到问题，请查看：
1. 控制台日志（F12）
2. Supabase Dashboard中的SQL执行日志
3. 联系开发团队获取帮助
