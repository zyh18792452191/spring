import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import type { Message, ContentPart } from 'coze-coding-dev-sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

// 读取图片文件并转换为base64
async function imageToBase64(filePath: string): Promise<string> {
  const imageBuffer = await readFile(filePath);
  const base64Data = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64Data}`;
}

export async function POST(request: NextRequest) {
  try {
    // 读取3张图片
    const imagePaths = [
      join(process.cwd(), 'assets', '8a384b89323ad154a6b640586b233d3f.png'),
      join(process.cwd(), 'assets', '9ce0b80199bb523c2b769d828b42f3a2.png'),
      join(process.cwd(), 'assets', '11db10a6716acdd19cdf8424683a42f0.png')
    ];

    const base64Images = await Promise.all(imagePaths.map(path => imageToBase64(path)));

    const config = new Config();
    const client = new LLMClient(config);

    // 创建包含3张图片的消息
    const content: ContentPart[] = [
      {
        type: 'text',
        text: `请详细分析这3张图片中的工单详情页面布局和内容。这是离网工单的详情页面。

请返回JSON格式的详细分析，包含以下结构：
{
  "pageTitle": "页面标题",
  "sections": [
    {
      "name": "区块名称",
      "fields": [
        {"label": "字段标签", "value": "示例值", "type": "字段类型"}
      ]
    }
  ],
  "buttons": [
    {"text": "按钮文字", "position": "位置描述"}
  ]
}

请仔细分析图片中的所有细节，包括：
1. 顶部标题区域
2. 客户信息区块
3. 工单信息区块
4. 业务信息区块
5. 流程状态或进度区域
6. 底部操作按钮

注意：这是离网工单（客户注销/停用），不是中高端业务。`
      },
      ...base64Images.map((url: string): ContentPart => ({
        type: 'image_url',
        image_url: {
          url: url,
          detail: 'high'
        }
      }))
    ];

    const messages: Message[] = [
      {
        role: 'user',
        content: content
      }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.5
    });

    return NextResponse.json({
      success: true,
      data: response.content
    });
  } catch (error) {
    console.error('Error analyzing ticket images:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
