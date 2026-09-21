# 市场运营平台

一个专业的市场运营管理系统，提供全方位的市场管理、数据分析和运营管理功能。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **图标**: Lucide React

## 功能模块

### 1. 首页仪表盘
- 关键指标展示（营地数量、装备总数、人员总数、待处理事项）
- 营地使用率趋势图（占位）
- 装备状态分布图（占位）
- 最近活动记录

### 2. 营地管理
- 营地列表展示
- 营地信息详情
- 容量和使用率统计
- 营地状态管理
- 新增/编辑/删除营地

### 3. 装备管理
- 装备库存管理
- 装备分类展示
- 库存状态追踪
- 装备位置管理
- 维护记录

### 4. 人员管理
- 人员信息管理
- 职位部门管理
- 人员状态追踪
- 联系方式管理
- 当前位置记录

### 5. 数据统计
- 营地收入趋势
- 装备使用统计
- 客流量分析
- 装备借用排行
- 详细数据报表

### 6. 系统设置
- 账户设置
- 通知设置
- 安全设置
- 数据管理
- 语言与地区设置

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```
或者使用 Coze CLI:
```bash
coze dev
```

### 构建生产版本
```bash
pnpm build
```

### 启动生产服务
```bash
pnpm start
```
或者使用 Coze CLI:
```bash
coze start
```

## API 接口

### 仪表盘数据
```
GET /api/dashboard
```

### 营地管理
```
GET /api/camps
POST /api/camps
```

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/           # 仪表盘路由组
│   │   ├── layout.tsx         # 主布局（侧边栏导航）
│   │   ├── page.tsx           # 首页仪表盘
│   │   ├── camps/             # 营地管理
│   │   ├── equipment/         # 装备管理
│   │   ├── personnel/         # 人员管理
│   │   ├── statistics/        # 数据统计
│   │   └── settings/          # 系统设置
│   ├── api/                   # API 路由
│   │   ├── dashboard/
│   │   └── camps/
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 根页面
├── components/
│   └── ui/                    # shadcn/ui 组件
└── lib/
    └── utils.ts               # 工具函数
```

## 功能特性

- ✅ 响应式设计，支持桌面和移动端
- ✅ 侧边栏导航，支持折叠
- ✅ 实时数据展示
- ✅ 搜索过滤功能
- ✅ 状态标签展示
- ✅ 进度条可视化
- ✅ RESTful API 接口
- ✅ TypeScript 类型安全
- ✅ 深色模式支持

## 待完善功能

- [ ] 图表组件集成（使用 Recharts 或 Chart.js）
- [ ] 数据持久化（数据库集成）
- [ ] 用户认证和权限管理
- [ ] 文件上传功能
- [ ] 数据导出功能
- [ ] 更多图表类型
- [ ] 实时数据更新（WebSocket）

## 开发说明

本项目使用 Coze CLI 进行开发和部署，请确保：

1. 使用 `coze dev` 启动开发环境（端口 5000）
2. 代码修改会自动触发热更新（HMR）
3. 使用 `coze build` 构建生产版本
4. 使用 `coze start` 启动生产环境

## 许可证

MIT License
