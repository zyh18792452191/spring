import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const objectKey = url.searchParams.get('key');

    if (!objectKey) {
      return NextResponse.json({ error: '缺少objectKey参数' }, { status: 400 });
    }

    // 使用 coze-coding-dev-sdk 生成签名 URL
    const pythonScript = `
import sys
sys.path.insert(0, '${process.env.COZE_WORKSPACE_PATH}/node_modules/coze-coding-dev-sdk')

from coze_coding_dev_sdk import S3SyncStorage

storage = S3SyncStorage()

# 生成签名 URL
signed_url = storage.generate_presigned_url(
    object_key='${objectKey}',
    expiration=7 * 24 * 3600  # 7天有效期
)

print(signed_url)
`;

    const signedUrl = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: process.cwd()
    }).trim();

    console.log('Generated signed URL:', signedUrl);

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl,
      fileName: '市场运营平台首页PRD_v1.0.docx'
    });
  } catch (error: any) {
    console.error('Generate URL error:', error);
    return NextResponse.json({
      error: '生成下载链接失败',
      message: error.message
    }, { status: 500 });
  }
}
