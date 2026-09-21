import { LLMClient, Config } from 'coze-coding-dev-sdk';
import fs from 'fs';

async function analyzeImage() {
  try {
    // 读取图片文件
    const imagePath = '/workspace/projects/assets/image.png';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    console.log('Image loaded, size:', imageBuffer.length);

    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请详细分析这张指标树UI设计图片，提取以下信息并以JSON格式返回：

1. **整体布局结构**：
   - 左侧指标树区域和右侧分析面板的比例
   - 指标树卡片的排列方式（横向、纵向、层级）
   - 连线样式和布局

2. **指标树卡片设计**：
   - 卡片的尺寸、间距、圆角、边框
   - 卡片内部元素布局：
     * 指标名称（字体大小、颜色、位置）
     * 指标值（字体大小、颜色、单位）
     * 环比数据（字体大小、颜色、正负号标识）
     * 问题指标标签（颜色、形状、位置）
     * 状态指示器（颜色、形状）
   - 不同层级卡片的样式差异
   - 卡片的背景色（不同层级不同背景色）

3. **指标树结构**：
   - 父子节点关系
   - 每个节点的层级深度
   - 连线样式（直线、曲线、颜色、粗细）
   - 卡片之间的间距和对齐方式

4. **右侧分析面板**：
   - 面板的标题和布局
   - 包含的模块和组件（如：指标详情、趋势图、预警列表等）
   - 各模块的内容和样式

5. **颜色方案**：
   - 主色调、辅色调
   - 状态颜色（正常、警告、危险）
   - 背景、边框、文字颜色
   - 不同层级卡片的背景色差异

6. **交互元素**：
   - 按钮、图标、筛选器
   - 展开折叠功能
   - 搜索框

7. **所有指标的完整数据**：
   - 每个指标的精确名称、数值、单位、环比
   - 所有层级节点的完整关系
   - 指标标签（主指标、分类节点、问题指标等）

请提供详细的JSON数据结构，包含所有指标的完整信息（指标名称、值、环比、标签、层级、父子关系等）。`,
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri,
              detail: 'high',
            },
          },
        ],
      },
    ];

    console.log('Calling LLM with doubao-seed-1-8-251228 model...');
    const response = await client.invoke(
      messages,
      {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3,
      }
    );

    console.log('Response:', response.content);
    return response.content;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

analyzeImage()
  .then(result => {
    console.log('\n=== Analysis Complete ===');
    console.log(result);
  })
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
