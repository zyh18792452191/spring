import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, Message } from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { codeContext } = await request.json();
    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的产品需求文档(PRD)撰写专家。你的任务是：

1. 基于提供的项目代码，严谨分析原型页面的实际功能点
2. 生成与企业标准一致的PRD文档
3. 严格基于代码中的实际功能，不得臆造不存在的功能
4. 文档格式要求：
   - 一级标题：# 标题（黑体，三号）
   - 二级标题：## 标题（黑体，小三）
   - 三级标题：### 标题（仿宋，四号）
   - 四级标题：#### 标题（仿宋，小四）
   - 正文：仿宋，小四
5. 文档结构：
   - 1. 文档概述
   - 2. 角色权限与数据范围
   - 3. 功能需求（详细描述页面实际功能）
   - 4. 业务规则（基于代码逻辑）
   - 5. 非功能性需求

输出格式：使用Markdown格式，便于后续转换为Word文档。`;

    const userPrompt = `请基于以下项目代码，生成市场运营平台首页的PRD文档预览：

## 代码上下文

### 首页代码 (page.tsx)
该页面展示了市场运营平台首页，包含三个主要楼层：
1. 指标总览 - 展示5个关键指标
2. 调度跟踪 - 展示调度跟踪信息
3. 优秀运营案例 - 展示成功案例

### 调度跟踪组件 (DispatchTrackingNew.tsx)
该组件实现了调度跟踪功能，包含：

**筛选器功能：**
- 业务场景筛选（下拉选择器）：全部、离网维系、中高端客户运营、用量运营、融合运营、国际业务运营、细分市场运营、家庭运营
- 工单类型筛选（树形选择器）：WorkOrderTypeTreeSelect组件
- 创建时间筛选（单选框+日期选择器）：
  * 历史所有（默认）
  * 按日（显示日期选择器）
  * 按月（显示月份选择器）
- 刷新按钮

**整体态势展示：**
- 全国总工单量、全国在途、全国超时、全国完成率
- 支持省份选择（点击省份卡片可切换）
- 返回全国按钮（选择省份后显示）

**效果跟踪（仅生产类、管理类显示）：**
- Top5指标：
  * 展示全国或选中省份的Top5指标
  * 每个指标包含：指标名称、当前值、改善幅度、活动数、总订购量
  * 点击指标卡片打开效果详情弹窗
- Bottom5指标：
  * 展示全国或选中省份的Bottom5指标
  * 同样展示5个关键指标数据
- 31省对比：
  * 选择特定指标后显示31省对比数据
  * 包含地州、指标当前值、改善幅度、活动数、总订购量

**效果详情弹窗：**
- 指标概览：当前值、改善幅度、活动数、总订购量
- 活动列表（表格形式）：
  * 产品名称
  * 产品订购量
  * 占比
  * 产品订购量（合计）
  * 活动名称
  * 活动开始时间
  * 活动结束时间
- 分页功能（每页10个产品）

**数据结构说明：**
- 指标数据包含：name、currentValue、improvement、activityCount、totalOrders、trendData、activities
- activities包含：id、name、orderCount、date、status、products
- products包含：name、count

**重要说明：**
1. 指标卡片上没有时间筛选器
2. 31省对比区域没有地市数据对比开关
3. 只有生产类和管理类工单才显示效果跟踪
4. 所有数据基于代码中的模拟数据结构

请基于以上代码分析，生成严谨的PRD文档，确保所有描述与代码实际功能一致。`;

    const messages: Message[] = [
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
