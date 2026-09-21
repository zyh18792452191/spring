import { LLMClient, Config } from 'coze-coding-dev-sdk';

const fs = await import('fs');

const config = new Config();
const client = new LLMClient(config);

const imageBuffer = fs.readFileSync('/workspace/projects/assets/image.png');
const base64Image = imageBuffer.toString('base64');

const messages = [
  {
    role: 'user',
    content: [
      { 
        type: 'text', 
        text: '请详细分析这个网页截图，特别关注"推荐策略"部分的布局。描述当前布局的视觉效果，指出所有的问题，特别是关于"潜在风险客群"和"策略"这两列的排列方式。如果布局有问题，请明确指出应该如何修改才能实现标准的两列表格布局。' 
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64Image}`,
          detail: 'high',
        },
      },
    ],
  },
];

const response = await client.invoke(messages, {
  model: 'doubao-seed-1-6-vision-250815',
  temperature: 0.7,
});

console.log(response.content);
