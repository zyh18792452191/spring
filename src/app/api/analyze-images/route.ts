import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import type { Message, ContentPart } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json();

    const config = new Config();
    const client = new LLMClient(config);

    // 创建包含3张图片的消息
    const content: ContentPart[] = [
      {
        type: 'text',
        text: `请详细分析这3张图片中的工单详情页面布局和内容。这是离网工单的详情页面，请返回以下信息：
1. 页面整体布局结构（分几个区块）
2. 每个区块包含哪些字段和信息
3. 每个字段的数据类型和示例值
4. 按钮和操作项的位置
5. 页面的整体设计风格

请用JSON格式返回，包含一个完整的工单详情数据结构。`
      },
      ...imageUrls.map((url: string): ContentPart => ({
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
      temperature: 0.7
    });

    return NextResponse.json({
      success: true,
      data: response.content
    });
  } catch (error) {
    console.error('Error analyzing images:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
