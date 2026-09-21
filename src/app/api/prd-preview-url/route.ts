import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少预览内容' },
        { status: 400 }
      );
    }

    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    // 将内容转换为 Base64
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');

    // 生成一个简单的 HTML 页面，使用 JavaScript 解码并显示内容
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>市场运营平台首页 PRD 预览</title>
<style>
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    background: #f5f5f5;
    line-height: 1.8;
}
.container {
    background: white;
    padding: 60px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
#content {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: 14px;
}
h1, h2, h3, h4 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
}
</style>
</head>
<body>
<div class="container">
<div id="content"></div>
</div>
<script>
var base64Content = "${base64Content}";
var decodedContent = decodeURIComponent(escape(window.atob(base64Content)));
document.getElementById('content').textContent = decodedContent;
</script>
</body>
</html>`;

    const buffer = Buffer.from(htmlContent, 'utf-8');

    // 使用UUID作为文件名
    const uuid = uuidv4();
    const fileName = `prd-preview-${uuid}.html`;

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: 'text/html; charset=utf-8',
    });

    // 生成签名URL（7天有效期）
    const previewUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天
    });

    return NextResponse.json({
      success: true,
      previewUrl,
      fileKey
    });

  } catch (error) {
    console.error('生成预览URL失败:', error);
    return NextResponse.json(
      { success: false, error: '生成预览URL失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
