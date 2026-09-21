import { LLMClient, Config } from 'coze-coding-dev-sdk';
import fs from 'fs';

async function analyzeImage() {
  try {
    // 读取图片文件
    const imagePath = '/workspace/projects/assets/6910f31eb9ac66723a7bc5f8904d1e3f.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    console.log('Image loaded, size:', imageBuffer.length);

    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请详细分析这张离网维系概览页面的布局和内容，提取以下信息并以JSON格式返回：

1. **页面整体布局结构**：
   - 页面顶部导航栏（面包屑、标题、按钮等）
   - 页面主要区域的划分（几个区块、如何排列）
   - 每个区块的相对位置和比例

2. **整体指标区块**：
   - 有几个指标卡片
   - 每个卡片的名称、数值、单位、环比数据
   - 卡片的布局方式（几行几列）
   - 每个卡片下方是否有图表，图表类型和数据

3. **价值提升区块**：
   - 标题和整体布局
   - 累计数据（升档、降档等）
   - 图表类型（柱状图、折线图、混合图等）
   - 图表的数据系列和配置

4. **规模发展区块**：
   - 标题和布局
   - 图表类型和数据
   - X轴、Y轴的单位
   - 图例说明

5. **融合加固区块**：
   - 图表类型（饼图等）
   - 每个扇区的名称、数值、颜色
   - 图表配置

6. **客群看管区块**：
   - 表格的列名和数据
   - 每行的数据（客群名称、规模、环比、预警数、维系率等）
   - 表格样式

7. **颜色方案**：
   - 主色调、辅色调
   - 各图表的颜色配置
   - 背景色、边框色、文字色

8. **所有数据的完整值**：
   - 每个指标的精确数值
   - 环比数据的正负号和单位
   - 图表数据点（月份、数值等）

请提供完整的JSON数据结构，包含所有详细信息。`,
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
