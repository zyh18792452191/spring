import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

const config = new Config();

// 各个模块的提示词
const modulePrompts = [
  {
    name: '指标总览模块',
    prompt: 'A modern dashboard interface showing 4 key metric cards in a grid layout. Each card displays: a metric title, a large number (e.g., "22.89"), a unit label (e.g., "亿元"), and a trend indicator with percentage change and arrow icon. Clean white cards with subtle shadows on a light gray background. Professional enterprise dashboard style.',
    filename: 'metric_overview.png'
  },
  {
    name: '指标卡片详细',
    prompt: 'A detailed view of a single metric card showing: icon in top right corner, metric title "整体收入规模", large value "22.89", unit "亿元", trend section with month-over-month comparison showing green upward arrow and percentage. White card background with rounded corners, modern UI design.',
    filename: 'metric_card_detail.png'
  },
  {
    name: '指标详情模块',
    prompt: 'A metric detail module with tabs at the top showing "全国数据" and "地州数据". Below the tabs, a line chart showing 12-month trend data with data labels. A data table below the chart showing monthly values. Clean layout, professional analytics dashboard style.',
    filename: 'metric_detail.png'
  },
  {
    name: '市场模块',
    prompt: 'A market module section with title "市场" at the top. Two tabs: "价值保有" (selected) and "规模保有". A multi-line chart showing 3 different colored trend lines representing customer segments. Legend showing line names. Professional data visualization style.',
    filename: 'market_module.png'
  },
  {
    name: '价值保有Tab',
    prompt: 'A line chart showing customer retention rates across 31 provinces. Three trend lines in different colors: "中高端客户" (blue), "高价值客户" (green), "全球通" (orange). X-axis shows province names, Y-axis shows retention percentage. Data points labeled with values. Clean chart design.',
    filename: 'value_retention.png'
  },
  {
    name: '客户指标模块',
    prompt: 'A customer metrics module showing a radar chart or bar chart with customer segmentation data. Tabs for "客户细分" and "渠道模块". Professional customer analytics dashboard with clean data visualization.',
    filename: 'customer_metrics.png'
  },
  {
    name: '产品TOP3模块',
    prompt: 'A product ranking module showing 3 vertical lists side by side: "高增长" (High Growth), "低增长" (Low Growth), "负增长" (Negative Growth). Each list shows product names with performance indicators. Modern leaderboard design with clean layout.',
    filename: 'product_top3.png'
  },
  {
    name: '页脚模块',
    prompt: 'A footer section showing company logo on the left, navigation links in the center (Home, About, Contact), and contact information on the right (phone, email). Clean, minimal design at the bottom of a webpage.',
    filename: 'footer_module.png'
  }
];

export async function POST(request: NextRequest) {
  try {
    const client = new ImageGenerationClient(config);

    const results = [];

    // 串行生成所有图片（避免并发限制）
    for (const module of modulePrompts) {
      try {
        console.log(`Generating image for: ${module.name}`);

        const response = await client.generate({
          prompt: module.prompt,
          size: '2560x1440',
          watermark: false,
          responseFormat: 'url'
        });

        const helper = client.getResponseHelper(response);

        if (helper.success && helper.imageUrls.length > 0) {
          results.push({
            name: module.name,
            filename: module.filename,
            url: helper.imageUrls[0],
            success: true
          });

          console.log(`✅ Generated: ${module.name}`);
        } else {
          results.push({
            name: module.name,
            filename: module.filename,
            success: false,
            error: helper.errorMessages.join(', ')
          });
          console.error(`❌ Failed: ${module.name}`, helper.errorMessages);
        }

        // 添加延迟以避免速率限制
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error generating ${module.name}:`, error);
        results.push({
          name: module.name,
          filename: module.filename,
          success: false,
          error: String(error)
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      total: modulePrompts.length,
      successCount: results.filter(r => r.success).length
    });

  } catch (error) {
    console.error('Generate module images error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
