import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的产品需求文档（PRD）编写专家。你的任务是严格按照指定的格式和内容要求生成PRD文档。

## 核心原则

1. **严格遵循格式要求**：必须按照提供的文档结构生成
2. **严格基于实际功能**：所有描述必须与代码实际功能完全一致
3. **严谨准确**：避免模糊描述，确保技术侧开发人员能够准确理解需求
4. **避免幻觉**：不得臆造不存在的功能

## 重要约束（必须严格遵守）

1. **指标卡片没有时间筛选器**：指标卡片仅展示当前数据，无任何时间筛选功能
2. **调度跟踪模块有时间筛选器**：只有调度跟踪模块才有时间筛选，支持"历史所有"、"按日"、"按月"三种模式
3. **没有地市数据对比开关**：整个系统没有任何"地市数据对比"开关功能，删除所有相关描述
4. **没有地市数据对比柱状图**：删除所有关于"地市数据对比柱状图"的描述
5. **参考调度跟踪组件代码**：时间筛选器的描述必须基于DispatchTrackingNew.tsx组件的实际实现

## 文档结构（必须按此顺序）

1. 文档信息（修订历史）
2. 1 简介
   - 1.1 需求来源
   - 1.2 范围
   - 1.3 背景和现状
   - 1.4 价值评估
   - 1.5 上线时间
3. 2 角色定义与权限矩阵
   - 2.1 角色定义
   - 2.2 权限识别
   - 2.3 权限矩阵总览
4. 3 数据权限控制规则
   - 3.1 指标总览模块
   - 3.2 调度跟踪模块
   - 3.3 优秀运营案例模块
5. 4 业务流程
   - 4.1 一级运营人员业务流程
   - 4.2 省级运营人员业务流程
6. 5 营服平台需求
   - 5.1 指标总览
     - 5.1.1 指标卡片展示
     - 5.1.2 市场份额详情
     - 5.1.3 价值保有详情
     - 5.1.4 规模保有详情
     - 5.1.5 渠道触客详情
     - 5.1.6 业务订购/退订详情
   - 5.2 调度跟踪
     - 5.2.1 整体态势
     - 5.2.2 效果跟踪
   - 5.3 优秀运营案例
     - 5.3.1 案例展示
   - 5.4 页脚
     - 5.4.1 页脚展示
7. 6 数据说明
8. 7 对现有功能影响
9. 8 风险评估
10. 9 数据更新策略
11. 10 异常处理
    - 10.1 数据为空时的展示逻辑
    - 10.2 权限不足时的处理
    - 10.3 网络错误时的降级方案
    - 10.4 数据更新中的处理

## 每个功能模块的格式要求

每个功能模块必须包含以下6个小节：

• 功能说明
• 交互说明
• 展示规则
• 约束规则
• 界面设计
• 权限控制

## 特别注意

1. 指标卡片仅展示当前数据，无时间筛选器
2. 调度跟踪模块的时间筛选器基于DispatchTrackingNew.tsx组件的实现：
   - 支持三种模式：历史所有（默认）、按日、按月
   - 按日模式显示日期选择器
   - 按月模式显示月份选择器
3. 不要包含任何"地市数据对比开关"的描述
4. 不要包含任何指标卡片的时间筛选器描述
5. 所有描述必须基于代码实际功能`;

    const userPrompt = `请严格按照以下真实PRD文档的格式和内容，生成市场运营平台首页的PRD文档。

## 真实PRD文档内容

以下是我提供的真实PRD文档（v14版本）内容，请严格按照这个格式和内容生成，但要根据以下约束进行调整：

### 约束调整要求（必须严格执行）：

1. **指标卡片没有时间筛选器**：删除所有关于指标卡片时间筛选的描述
2. **调度跟踪模块有时间筛选器**：保留并明确描述调度跟踪模块的时间筛选功能（历史所有、按日、按月）
3. **完全移除地市数据对比功能**：
   - 删除所有关于"地市数据对比开关"的描述
   - 删除所有关于"地市数据对比柱状图"的描述
   - 删除所有关于"本省各地市数据对比"的描述
   - 删除所有关于"31省地市数据对比"的描述
   - 详情模块只展示全国或本省的趋势图，不要有地市对比

### 真实PRD文档内容：

${await readFileContent('/tmp/prd_v14_reference.txt')}

## 重要说明

1. 请严格按照真实PRD文档的格式和结构生成
2. 保留所有业务逻辑和功能描述
3. 根据约束调整要求删除不存在的功能描述
4. 确保调度跟踪模块的时间筛选器描述准确（基于DispatchTrackingNew.tsx组件）
5. 不要添加任何文档中没有的功能`;

    const messages: { role: 'system' | 'user'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, {
            temperature: 0.7,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (error) {
          console.error('LLM stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('Generate PRD preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PRD preview' },
      { status: 500 }
    );
  }
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    const fs = require('fs');
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Read file error:', error);
    return '';
  }
}
