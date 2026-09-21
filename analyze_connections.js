const fs = require('fs');
const { LLMClient, Config } = require('coze-coding-dev-sdk');

// 读取图片并转换为 base64
const imageBuffer = fs.readFileSync('assets/extracted/image1.png');
const base64Image = imageBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64Image}`;

// 初始化 LLM 客户端
const config = new Config();
const client = new LLMClient(config);

// 专门分析连接线的消息
const messages = [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: '请非常仔细地观察这张图片中各个节点之间的连接线，特别关注以下细节：1. 连接线的样式（颜色、粗细、类型）；2. 连接线的路径（是直线、折线还是曲线）；3. 连接线如何从父节点连接到子节点（从哪个位置出发，到哪个位置结束）；4. 是否存在连接线断裂、重叠、十字交叉等异常情况；5. 连接线在节点之间的连接是否平滑自然；6. 请指出连接线存在的任何问题或不完善之处。请尽可能详细地描述。'
      },
      {
        type: 'image_url',
        image_url: {
          url: dataUri,
          detail: 'high'
        }
      }
    ]
  }
];

// 使用流式输出分析连接线
async function analyzeConnections() {
  try {
    console.log('正在分析连接线细节...\n');
    
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.3  // 降低温度以获得更准确的观察
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        process.stdout.write(chunk.content.toString());
      }
    }
    console.log('\n\n连接线分析完成！');
  } catch (error) {
    console.error('分析失败:', error.message);
    process.exit(1);
  }
}

analyzeConnections();
