import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import type { Message, ContentPart } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 读取图片文件
    const imagePath = path.join(process.cwd(), 'assets', 'a22540c7d6aafdb2616e815cf2340acd.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // 创建LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 调用豆包视觉模型
    const messages: Message[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '请详细描述这个对话框/弹窗的UI设计，包括：\n1. 弹窗的标题\n2. 所有表单字段和标签\n3. 所有按钮的文本和样式\n4. 布局结构\n5. 颜色和样式\n6. 下拉选项\n请用JSON格式返回，格式如下：\n{\n  "title": "弹窗标题",\n  "fields": [{"label": "字段标签", "type": "输入类型", "placeholder": "占位符", "options": ["选项1", "选项2"]}],\n  "buttons": [{"text": "按钮文本", "variant": "primary/secondary"}],\n  "layout": "布局描述"\n}'
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri,
              detail: 'high'
            }
          }
        ] as ContentPart[]
      }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.3
    });

    return NextResponse.json({
      success: true,
      content: response.content
    });
  } catch (error) {
    console.error('识别图片失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
