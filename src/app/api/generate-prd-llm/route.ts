import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const config = new Config();
    const client = new LLMClient(config);

    // 读取门户首页代码
    const pageCode = fs.readFileSync(
      path.join(process.cwd(), 'src/app/page.tsx'),
      'utf-8'
    );

    // 读取 DispatchTrackingNew 组件代码
    let dispatchCode = '';
    try {
      dispatchCode = fs.readFileSync(
        path.join(process.cwd(), 'src/components/DispatchTrackingNew.tsx'),
        'utf-8'
      );
    } catch {
      dispatchCode = '// 组件未找到';
    }

    // 构造 system prompt
    const systemPrompt = `你是专业的PRD编写专家，精通prd-generator技能规范。你需要根据页面代码生成符合企业标准的PRD文档。

严格遵守以下规则：
1. 严格按照prd-generator技能的7个标准章节组织内容
2. 所有子章节内容里都用序号1、2、3...，不够就再加（1）（2）（3）...
3. 不要加多余的符号（-、#、*）
4. 字段说明用表格
5. 严格按照页面实际功能编写，不要臆造功能
6. 字段描述格式：字段名：字段类型 | 数据来源 | 显示格式/业务说明
7. 业务逻辑描述：按步骤描述，包含操作步骤和条件判断
8. 约束规则描述：必填项、枚举值、业务约束`;

    // 构造 user prompt
    const userPrompt = `请根据以下代码生成市场运营平台首页PRD文档。

门户首页代码（前3000字符）：
${pageCode.substring(0, 3000)}

DispatchTrackingNew组件代码（前2000字符）：
${dispatchCode.substring(0, 2000)}

页面主要功能模块：
1. 指标总览模块：展示5张指标卡片（市场份额、价值保有、规模保有、渠道触客、业务订购/退订）
2. 调度跟踪模块：展示调度任务执行情况和工单列表
3. 优秀运营案例模块：展示优秀运营案例列表

请生成完整的PRD文档，包含以下章节：

1. 修订历史
1. 表格：日期 | 修订人 | 修订内容

2. 简介
2.1 需求来源
2.2 范围
2.3 背景和现状
2.4 价值评估
2.5 上线时间

3. 业务流程
3.1 一级运营人员业务流程
3.2 省级运营人员业务流程

4. 系统需求
4.1 指标总览模块
4.1.1 指标卡片展示
1. 功能说明
2. 字段说明（用表格）
3. 业务逻辑
4. 约束规则
4.1.2 市场份额模块
...（其他模块类似）

5. 接口说明
5.1 指标总览接口
1. 接口描述
2. 请求方式
3. 请求参数（用表格）
4. 返回参数（用表格）
...（其他接口类似）

6. 对现有功能影响
6.1 涉及模块
6.2 测试描述

7. 风险评估

格式要求（严格遵守）：
1. 所有子章节内容里都用序号1、2、3...，不够就再加（1）（2）（3）...
2. 不要加多余的符号（-、#、*、###等）
3. 字段说明用表格，格式：| 字段名 | 字段类型 | 数据来源 | 显示格式/业务说明 |
4. 不要输出JSON格式，不要输出任何解释
5. 直接输出纯文本PRD文档内容

请严格按照上述格式输出PRD文档。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    // 调用 LLM
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.3,
    });

    return NextResponse.json({
      success: true,
      content: response.content,
    });
  } catch (error) {
    console.error('生成PRD失败:', error);
    return NextResponse.json(
      { error: '生成PRD失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
