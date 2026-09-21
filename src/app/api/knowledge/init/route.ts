import { NextRequest, NextResponse } from 'next/server';
import {
  KnowledgeClient,
  Config,
  DataSourceType,
} from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const config = new Config();
    const client = new KnowledgeClient(config);

    const datasetName = 'market-operation-platform';

    const chunkConfig = {
      separator: '\n\n',
      max_tokens: 1500,
      remove_extra_spaces: true,
    };

    const documents = [
      {
        source: DataSourceType.TEXT,
        rawData: `# 市场运营平台项目概述

## 项目背景
中国移动市场运营平台，用于市场运营人员查看指标总览、调度跟踪、优秀运营案例等业务数据。

## 技术栈
- 前端框架：Next.js 16 (App Router)
- UI组件：shadcn/ui + Radix UI
- 样式：Tailwind CSS 4
- 语言：TypeScript 5
- 包管理器：pnpm
- 端口：5000

## 项目结构
- /workspace/projects/src/app/portal/market/overview - 首页
- /workspace/projects/src/components/DispatchTrackingNew - 调度跟踪组件
- /workspace/projects/src/components/WorkOrderTypeTreeSelect - 工单类型树形选择器

## 核心功能
1. 指标总览：展示5个关键指标（5G套包升档率、ARPU值提升、DOU增长率、5G渗透率、云业务渗透率）
2. 调度跟踪：工单筛选、整体态势、效果跟踪（Top5/Bottom5指标）、31省对比
3. 优秀运营案例：展示成功案例

## 业务场景
- 离网维系
- 中高端客户运营
- 用量运营
- 融合运营
- 国际业务运营
- 细分市场运营
- 家庭运营

## 工单类型分类
- 生产类
- 管理类
- 营销类
- 服务类
- 其他类

## 用户角色
- 一级运营人员：查看全国数据
- 省级运营人员：查看本省数据`,
      },
      {
        source: DataSourceType.TEXT,
        rawData: `# 调度跟踪功能详细说明

## 组件位置
/workspace/projects/src/components/DispatchTrackingNew.tsx

## 筛选器功能
### 业务场景筛选
- 类型：下拉选择器（Select）
- 选项：全部、离网维系、中高端客户运营、用量运营、融合运营、国际业务运营、细分市场运营、家庭运营
- 默认值：all（全部）

### 工单类型筛选
- 类型：树形选择器（WorkOrderTypeTreeSelect）
- 支持多级分类
- 默认值：all（全部）

### 创建时间筛选
- 类型：单选框 + 日期选择器
- 选项：
  * 历史所有（默认，无需日期选择）
  * 按日（显示日期选择器，格式：YYYY-MM-DD）
  * 按月（显示月份选择器，格式：YYYY-MM）

### 刷新按钮
- 功能：刷新数据
- 位置：筛选器区域右侧

## 效果跟踪
### 显示条件
- 仅生产类、管理类工单类型显示
- 营销类、服务类、其他类不显示

### Top5指标
- 展示全国或选中省份的Top5指标
- 每个指标展示：指标名称、当前值、改善幅度、活动数、总订购量

### Bottom5指标
- 展示全国或选中省份的Bottom5指标

### 31省对比
- 选择指标后显示31省对比数据
- 每省展示：省份名称、指标当前值、改善幅度、活动数、总订购量

## 重要功能约束
1. 指标卡片上没有时间筛选器
2. 31省对比区域没有地市数据对比开关
3. 只有生产类、管理类工单才显示效果跟踪`,
      },
      {
        source: DataSourceType.TEXT,
        rawData: `# 市场运营平台UI设计规范

## 品牌色
- 主色：#0085D0（中国移动蓝）
- 辅助色：#60B3E2（浅蓝）
- 高亮色：#10B981（绿色，表示正增长）
- 警告色：#F59E0B（橙色，表示在途）
- 错误色：#EF4444（红色，表示负增长或超时）

## 字体规范
- 标题：无衬线字体（SimHei, 黑体）
- 正文：衬线字体（FangSong, 仿宋）

## 按钮规范
- 主要按钮：bg-[#0085D0] hover:bg-[#006DB8]
- 次要按钮：bg-white border border-gray-200 hover:bg-gray-50

## 状态色规范
- 进行中：蓝色或默认色
- 已完成：绿色
- 已取消：灰色
- 超时：红色`,
      },
      {
        source: DataSourceType.TEXT,
        rawData: `# 市场运营平台业务规则

## 数据权限控制
### 一级运营人员
- 数据范围：全国数据
- 可以查看所有31省数据

### 省级运营人员
- 数据范围：本省数据
- 只能查看本省的指标数据

## 工单类型分类规则
### 生产类
- 显示效果跟踪功能

### 管理类
- 显示效果跟踪功能

### 营销类/服务类/其他类
- 不显示效果跟踪功能

## 指标计算规则
### Top5指标
- 按改善幅度降序排列

### Bottom5指标
- 按改善幅度升序排列`,
      },
    ];

    const response = await client.addDocuments(
      documents as any[],
      datasetName,
      chunkConfig
    );

    if (response.code === 0) {
      return NextResponse.json({
        success: true,
        message: `成功导入 ${(response as any).doc_ids?.length || 0} 个文档`,
        docIds: (response as any).doc_ids,
        dataset: datasetName,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `导入失败: ${response.msg}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Knowledge base init error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '知识库初始化失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
