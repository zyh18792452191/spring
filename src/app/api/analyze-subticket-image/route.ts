import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import type { Message, ContentPart } from 'coze-coding-dev-sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function imageToBase64(filePath: string): Promise<string> {
  const imageBuffer = await readFile(filePath);
  const base64Data = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64Data}`;
}

export async function POST(request: NextRequest) {
  try {
    const imagePath = join(process.cwd(), 'assets', 'b8e493a9d58235ef81bf42a37b24990a.png');
    const base64Image = await imageToBase64(imagePath);

    const config = new Config();
    const client = new LLMClient(config);

    const content: ContentPart[] = [
      {
        type: 'text',
        text: `请详细分析这张子单详情页面的布局和内容。

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
1. 顶部标题和编号
2. 各个信息区块（基本信息、执行信息、结果信息等）
3. 每个区块包含的字段
4. 底部操作按钮`
      },
      {
        type: 'image_url',
        image_url: {
          url: base64Image,
          detail: 'high'
        }
      }
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
    console.error('Error analyzing sub-ticket image:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
