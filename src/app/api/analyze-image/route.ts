import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import type { Message, ContentPart } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 读取图片
    const imagePath = path.join(process.cwd(), 'assets', 'image.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // 使用视觉模型分析
    const config = new Config();
    const client = new LLMClient(config);

    const messages: Message[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '请详细描述这个网页截图的布局结构，特别关注：1. 是否有左侧菜单栏 2. 顶部导航栏的状态（哪个菜单项被选中） 3. 页面内容区域的背景色和布局。这是一个策略匹配页面的截图，用户反馈说布局不对，请指出具体问题。',
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri,
              detail: 'high',
            },
          },
        ] as ContentPart[],
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.7,
    });

    return NextResponse.json({ description: response.content });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
