import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 定义多个地图数据源，按优先级尝试
    const mapSources = [
      'https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/data/asset/geo/china.json',
      'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
      'https://isqqw.github.io/echarts-resource/china.json',
    ];

    let lastError = null;

    for (const url of mapSources) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Next.js Server)',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const mapData = await response.json();

        // 检查是否是有效的 GeoJSON
        if (mapData && (mapData.type === 'FeatureCollection' || mapData.type === 'Feature')) {
          // 设置缓存头，减少重复请求
          return NextResponse.json(mapData, {
            headers: {
              'Cache-Control': 'public, max-age=86400', // 缓存一天
              'Content-Type': 'application/json',
            },
          });
        } else {
          throw new Error('无效的地图数据格式');
        }
      } catch (error) {
        console.error(`从 ${url} 获取地图数据失败:`, error);
        lastError = error;
        // 继续尝试下一个数据源
      }
    }

    // 所有数据源都失败了
    console.error('所有地图数据源获取失败:', lastError);
    return NextResponse.json(
      { error: '无法获取地图数据', details: lastError instanceof Error ? lastError.message : '未知错误' },
      { status: 500 }
    );
  } catch (error) {
    console.error('API 端点错误:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
